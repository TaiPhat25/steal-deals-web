"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SurpriseBagCard from "@/components/home/SurpriseBagCard";
import { ApiClientError } from "@/lib/api/client";
import { listBags } from "@/lib/api/store";
import {
  filterBags,
  isBagAvailable,
  normalizeSort,
  toListingBag,
  validatePriceRange,
  type ListingBag,
} from "./product-listing-data";

type ProductListingProps = {
  initialCategory?: string;
  initialQuery?: string;
  initialSort?: string;
  storeId?: string;
};

const PRICE_MIN = 0;
const PRICE_MAX = Number.POSITIVE_INFINITY;
const priceFormatter = new Intl.NumberFormat("en-US");

function stepPriceDraft(value: string, step: number, blankValue: number) {
  const normalized = value.trim().replace(/,/g, "");
  const parsed = /^\d+$/.test(normalized) ? Number(normalized) : blankValue;
  const current = Number.isSafeInteger(parsed) ? parsed : blankValue;
  return String(Math.max(PRICE_MIN, current + step));
}

function formatPriceFilter(minPrice: number, maxPrice: number) {
  if (minPrice > PRICE_MIN && Number.isFinite(maxPrice)) {
    return `${priceFormatter.format(minPrice)} - ${priceFormatter.format(maxPrice)} VND`;
  }

  if (minPrice > PRICE_MIN) return `From ${priceFormatter.format(minPrice)} VND`;
  return `Up to ${priceFormatter.format(maxPrice)} VND`;
}

function FilterWidget({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="widget widget-collapsible">
      <h3 className="widget-title">
        <button
          type="button"
          className="category-widget-toggle"
          data-toggle="collapse"
          data-target={`#${id}`}
          aria-expanded="true"
          aria-controls={id}
        >
          {title}
        </button>
      </h3>
      <div className="collapse show" id={id}>
        <div className="widget-body">{children}</div>
      </div>
    </div>
  );
}

export default function ProductListing({
  initialCategory,
  initialQuery = "",
  initialSort,
  storeId,
}: ProductListingProps) {
  const [query, setQuery] = useState(initialQuery);
  const [categories, setCategories] = useState(initialCategory ? [initialCategory] : []);
  const [minPrice, setMinPrice] = useState(PRICE_MIN);
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [priceDraft, setPriceDraft] = useState({ min: "", max: "" });
  const [sort, setSort] = useState(normalizeSort(initialSort));
  const [bags, setBags] = useState<ListingBag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    void listBags()
      .then((response) => {
        if (!active) return;

        setBags(
          response
            .filter((bag) => isBagAvailable(bag))
            .map(toListingBag),
        );
      })
      .catch((requestError) => {
        if (!active) return;

        setError(
          requestError instanceof ApiClientError
            ? requestError.message
            : "Unable to load surprise bags. Please try again.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  function retryLoad() {
    setError(null);
    setIsLoading(true);
    setReloadKey((current) => current + 1);
  }

  const scopedBags = useMemo(
    () => bags.filter((bag) => !storeId || bag.storeId === storeId),
    [bags, storeId],
  );
  const storeName = storeId
    ? scopedBags[0]?.storeName
    : undefined;
  const categoryOptions = useMemo(
    () =>
      Array.from(new Set(scopedBags.map((bag) => bag.category)))
        .sort()
        .map((category) => [
          category,
          scopedBags.filter((bag) => bag.category === category).length,
        ] as const),
    [scopedBags],
  );
  const priceStepCeiling = useMemo(() => {
    const highestPrice = scopedBags.reduce(
      (highest, bag) => Math.max(highest, bag.salePrice),
      PRICE_MIN,
    );
    return Math.ceil(highestPrice / 10000) * 10000;
  }, [scopedBags]);
  const priceValidation = useMemo(
    () => validatePriceRange(priceDraft.min, priceDraft.max),
    [priceDraft],
  );
  const hasPriceFilter = minPrice > PRICE_MIN || Number.isFinite(maxPrice);
  const hasActiveFilters = Boolean(query.trim()) || categories.length > 0 || hasPriceFilter;
  const visibleBags = useMemo(
    () =>
      filterBags(bags, {
        query,
        categories,
        pickupDay: "all",
        minPrice,
        maxPrice,
        minDistance: 0,
        maxDistance: Number.POSITIVE_INFINITY,
        sort,
        storeId,
      }),
    [bags, categories, maxPrice, minPrice, query, sort, storeId],
  );

  function toggleCategory(category: string) {
    setCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  }

  function clearFilters() {
    setQuery("");
    setCategories([]);
    setMinPrice(PRICE_MIN);
    setMaxPrice(PRICE_MAX);
    setPriceDraft({ min: "", max: "" });
    setSort("popularity");
  }

  function applyPriceFilter() {
    if (!priceValidation.isValid) return;

    setMinPrice(priceValidation.min);
    setMaxPrice(priceValidation.max);
    setPriceDraft({
      min: priceValidation.min === PRICE_MIN ? "" : String(priceValidation.min),
      max: priceValidation.max === PRICE_MAX ? "" : String(priceValidation.max),
    });
  }

  function clearPriceFilter() {
    setMinPrice(PRICE_MIN);
    setMaxPrice(PRICE_MAX);
    setPriceDraft({ min: "", max: "" });
  }

  const pageTitle = storeName ? `${storeName} Surprise Bags` : "Surprise Bags";

  return (
    <main className="main product-listing-page">
      <section className="info-page__hero info-page__hero--image">
        <Image
          src="/assets/images/page-headers/products-marketplace-v2.webp"
          alt="Surprise bags filled with rescued food at a local market"
          fill
          preload
          sizes="100vw"
        />
        <div className="info-page__hero-overlay" aria-hidden="true" />
        <div className="container info-page__hero-content">
          <p className="info-page__eyebrow">
            {storeName ? "Explore this local partner" : "Rescue good food nearby"}
          </p>
          <h1>{pageTitle}</h1>
          <p>
            {storeName
              ? `Browse active surprise bags from ${storeName} and choose a pickup window that works for you.`
              : "Discover discounted surplus food from local stores and collect it during the listed pickup window."}
          </p>
        </div>
      </section>

      <nav aria-label="breadcrumb" className="breadcrumb-nav mb-2">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link href="/">Home</Link></li>
            {storeName ? (
              <>
                <li className="breadcrumb-item"><Link href="/products">Surprise Bags</Link></li>
                <li className="breadcrumb-item active" aria-current="page">{storeName}</li>
              </>
            ) : (
              <li className="breadcrumb-item active" aria-current="page">Surprise Bags</li>
            )}
          </ol>
        </div>
      </nav>

      <div className="page-content">
        <div className="container">
          <div className="product-listing-search" role="search">
            <label className="sr-only" htmlFor="product-search">Search surprise bags</label>
            <i className="icon-search" aria-hidden="true" />
            <input
              type="search"
              id="product-search"
              className="form-control"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={storeName ? `Search ${storeName}` : "Search bags, stores, or food categories"}
            />
          </div>

          <div className="row">
            <div className="col-lg-9">
              {isLoading ? (
                <div className="product-listing-empty" aria-live="polite">
                  <h2>Loading surprise bags</h2>
                  <p>Finding available food rescue bags.</p>
                </div>
              ) : error ? (
                <div className="product-listing-empty" role="alert">
                  <h2>Unable to load surprise bags</h2>
                  <p>{error}</p>
                  <button
                    type="button"
                    className="btn btn-outline-primary-2"
                    onClick={retryLoad}
                  >
                    Try again
                  </button>
                </div>
              ) : scopedBags.length === 0 ? (
                <div className="product-listing-empty" role="status">
                  <h2>No surprise bags available</h2>
                  <p>
                    {storeId
                      ? "This store does not have any active surprise bags available for pickup."
                      : "There are no active surprise bags available for pickup right now."}
                  </p>
                </div>
              ) : (
                <>
              <div className="toolbox">
                <div className="toolbox-left">
                  <div className="toolbox-info" role="status" aria-live="polite" aria-atomic="true">
                    Showing <span>{visibleBags.length} of {scopedBags.length}</span> surprise bags
                  </div>
                </div>
                <div className="toolbox-right">
                  <div className="toolbox-sort">
                    <label htmlFor="sortby">Sort by:</label>
                    <div className="select-custom">
                      <select
                        name="sortby"
                        id="sortby"
                        className="form-control"
                        value={sort}
                        onChange={(event) => setSort(event.target.value)}
                      >
                        <option value="popularity">Most Popular</option>
                        <option value="pickup">Pickup Soonest</option>
                        <option value="price">Lowest Price</option>
                        <option value="discount">Highest Discount</option>
                        <option value="newest">Newest</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {hasActiveFilters ? (
                <div className="product-listing-active-filters" role="group" aria-label="Applied filters">
                  <span className="product-listing-active-filters__label">Applied:</span>
                  {query.trim() ? (
                    <button
                      type="button"
                      className="product-listing-filter-chip"
                      onClick={() => setQuery("")}
                      aria-label={`Remove search filter: ${query.trim()}`}
                    >
                      Search: {query.trim()} <span aria-hidden="true">&times;</span>
                    </button>
                  ) : null}
                  {categories.map((category) => (
                    <button
                      type="button"
                      className="product-listing-filter-chip"
                      key={category}
                      onClick={() => toggleCategory(category)}
                      aria-label={`Remove category filter: ${category}`}
                    >
                      {category} <span aria-hidden="true">&times;</span>
                    </button>
                  ))}
                  {hasPriceFilter ? (
                    <button
                      type="button"
                      className="product-listing-filter-chip"
                      onClick={clearPriceFilter}
                      aria-label={`Remove price filter: ${formatPriceFilter(minPrice, maxPrice)}`}
                    >
                      {formatPriceFilter(minPrice, maxPrice)} <span aria-hidden="true">&times;</span>
                    </button>
                  ) : null}
                </div>
              ) : null}

              {visibleBags.length ? (
                <div className="row product-listing-grid">
                  {visibleBags.map((bag, index) => (
                    <div className="col-12 col-sm-6 col-xl-4" key={bag.slug}>
                      <SurpriseBagCard bag={bag} eager={index === 0} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="product-listing-empty">
                  <h2>No surprise bags match your filters</h2>
                  <p>Remove one or more filters, or clear them all to see available bags.</p>
                  {hasActiveFilters ? (
                    <button type="button" className="btn btn-outline-primary-2" onClick={clearFilters}>
                      Clear filters
                    </button>
                  ) : null}
                </div>
              )}
                </>
              )}
            </div>

            <aside className="col-lg-3 order-lg-first">
              <div className="sidebar sidebar-shop">
                <div className="widget widget-clean">
                  <label>Filters:</label>
                  {hasActiveFilters ? (
                    <button type="button" className="sidebar-filter-clear" onClick={clearFilters}>
                      Clear All
                    </button>
                  ) : null}
                </div>

                <FilterWidget id="category-filter" title="Food Category">
                  <div className="filter-items filter-items-count">
                    {categoryOptions.map(([category, count], index) => (
                      <div className="filter-item" key={category}>
                        <div className="custom-control custom-checkbox">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id={`category-${index + 1}`}
                            checked={categories.includes(category)}
                            onChange={() => toggleCategory(category)}
                          />
                          <label className="custom-control-label" htmlFor={`category-${index + 1}`}>
                            {category}
                          </label>
                        </div>
                        <span className="item-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </FilterWidget>

                <FilterWidget id="price-filter" title="Price">
                  <div className="filter-range">
                    <div className="filter-range-fields">
                      <div className={`filter-range-input${priceValidation.isValid ? "" : " filter-range-input--invalid"}`}>
                        <span aria-hidden="true">VND</span>
                        <button
                          type="button"
                          className="filter-range-stepper"
                          onClick={() => setPriceDraft((current) => ({ ...current, min: stepPriceDraft(current.min, -10000, PRICE_MIN) }))}
                          aria-label="Decrease minimum price"
                        >
                          -
                        </button>
                        <input
                          type="text"
                          id="price-min"
                          inputMode="numeric"
                          value={priceDraft.min}
                          onChange={(event) => setPriceDraft((current) => ({ ...current, min: event.target.value }))}
                          placeholder="MIN"
                          aria-label="Minimum price"
                          aria-invalid={!priceValidation.isValid}
                          aria-describedby={!priceValidation.isValid ? "price-range-error" : undefined}
                        />
                        <button
                          type="button"
                          className="filter-range-stepper"
                          onClick={() => setPriceDraft((current) => ({ ...current, min: stepPriceDraft(current.min, 10000, PRICE_MIN) }))}
                          aria-label="Increase minimum price"
                        >
                          +
                        </button>
                      </div>
                      <span className="filter-range-separator" aria-hidden="true">-</span>
                      <div className={`filter-range-input${priceValidation.isValid ? "" : " filter-range-input--invalid"}`}>
                        <span aria-hidden="true">VND</span>
                        <button
                          type="button"
                          className="filter-range-stepper"
                          onClick={() => setPriceDraft((current) => ({ ...current, max: stepPriceDraft(current.max, -10000, priceStepCeiling) }))}
                          aria-label="Decrease maximum price"
                        >
                          -
                        </button>
                        <input
                          type="text"
                          id="price-max"
                          inputMode="numeric"
                          value={priceDraft.max}
                          onChange={(event) => setPriceDraft((current) => ({ ...current, max: event.target.value }))}
                          placeholder="MAX"
                          aria-label="Maximum price"
                          aria-invalid={!priceValidation.isValid}
                          aria-describedby={!priceValidation.isValid ? "price-range-error" : undefined}
                        />
                        <button
                          type="button"
                          className="filter-range-stepper"
                          onClick={() => setPriceDraft((current) => ({ ...current, max: stepPriceDraft(current.max, 10000, priceStepCeiling) }))}
                          aria-label="Increase maximum price"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    {!priceValidation.isValid ? (
                      <p className="filter-range-error" id="price-range-error" role="alert">
                        {priceValidation.error}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      className="btn btn-outline-primary-2 filter-range-apply"
                      onClick={applyPriceFilter}
                      disabled={!priceValidation.isValid}
                    >
                      Apply
                    </button>
                  </div>
                </FilterWidget>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
