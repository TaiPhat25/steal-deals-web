"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SurpriseBagCard from "@/components/home/SurpriseBagCard";
import { ApiClientError } from "@/lib/api/client";
import { listBags } from "@/lib/api/store";
import {
  filterBags,
  normalizeSort,
  storeNames,
  toListingBag,
  type ListingBag,
} from "./product-listing-data";

type ProductListingProps = {
  initialCategory?: string;
  initialQuery?: string;
  initialSort?: string;
  storeSlug?: string;
};

const PRICE_MIN = 0;
const PRICE_MAX = 300000;
const DISTANCE_MIN = 0;
const DISTANCE_MAX = 10;

function clampBound(value: string, fallback: number, min: number, max: number) {
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? Math.max(min, Math.min(max, parsed)) : fallback;
}

function stepDraftValue(value: string, step: number, fallback: number, min: number, max: number) {
  const current = clampBound(value, fallback, min, max);
  const next = Math.max(min, Math.min(max, current + step));
  return Number.isInteger(next) ? String(next) : next.toFixed(1);
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
  storeSlug,
}: ProductListingProps) {
  const [query, setQuery] = useState(initialQuery);
  const [categories, setCategories] = useState(initialCategory ? [initialCategory] : []);
  const [minPrice, setMinPrice] = useState(PRICE_MIN);
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [minDistance, setMinDistance] = useState(DISTANCE_MIN);
  const [maxDistance, setMaxDistance] = useState(DISTANCE_MAX);
  const [priceDraft, setPriceDraft] = useState({ min: "", max: "" });
  const [distanceDraft, setDistanceDraft] = useState({ min: "", max: "" });
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
            .filter((bag) => bag.status.toLowerCase() === "active")
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
    () => bags.filter((bag) => !storeSlug || bag.storeSlug === storeSlug),
    [bags, storeSlug],
  );
  const storeName = storeSlug
    ? scopedBags[0]?.storeName ?? storeNames[storeSlug]
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
  const visibleBags = useMemo(
    () =>
      filterBags(bags, {
        query,
        categories,
        pickupDay: "all",
        minPrice,
        maxPrice,
        minDistance,
        maxDistance: storeSlug ? Number.POSITIVE_INFINITY : maxDistance,
        sort,
        storeSlug,
      }),
    [bags, categories, maxDistance, maxPrice, minDistance, minPrice, query, sort, storeSlug],
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
    setMinDistance(DISTANCE_MIN);
    setMaxDistance(DISTANCE_MAX);
    setPriceDraft({ min: "", max: "" });
    setDistanceDraft({ min: "", max: "" });
    setSort("popularity");
  }

  function applyPriceFilter() {
    const normalizedMin = clampBound(priceDraft.min, PRICE_MIN, PRICE_MIN, PRICE_MAX);
    const normalizedMax = clampBound(priceDraft.max, PRICE_MAX, PRICE_MIN, PRICE_MAX);
    const lower = Math.min(normalizedMin, normalizedMax);
    const upper = Math.max(normalizedMin, normalizedMax);

    setMinPrice(lower);
    setMaxPrice(upper);
    setPriceDraft({
      min: lower === PRICE_MIN ? "" : String(lower),
      max: upper === PRICE_MAX ? "" : String(upper),
    });
  }

  function applyDistanceFilter() {
    const normalizedMin = clampBound(distanceDraft.min, DISTANCE_MIN, DISTANCE_MIN, DISTANCE_MAX);
    const normalizedMax = clampBound(distanceDraft.max, DISTANCE_MAX, DISTANCE_MIN, DISTANCE_MAX);
    const lower = Math.min(normalizedMin, normalizedMax);
    const upper = Math.max(normalizedMin, normalizedMax);

    setMinDistance(lower);
    setMaxDistance(upper);
    setDistanceDraft({
      min: lower === DISTANCE_MIN ? "" : String(lower),
      max: upper === DISTANCE_MAX ? "" : String(upper),
    });
  }

  const pageTitle = storeName ? `${storeName} Surprise Bags` : "Surprise Bags";

  return (
    <main className="main product-listing-page">
      <div
        className="page-header text-center"
        style={{ backgroundImage: "url('/assets/images/page-header-bg.jpg')" }}
      >
        <div className="container">
          <h1 className="page-title">
            {pageTitle}<span>{storeName ? "Store" : "Food rescue marketplace"}</span>
          </h1>
        </div>
      </div>

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
              ) : (
                <>
              <div className="toolbox">
                <div className="toolbox-left">
                  <div className="toolbox-info">
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
                        {!storeSlug ? <option value="distance">Nearest</option> : null}
                        <option value="pickup">Pickup Soonest</option>
                        <option value="price">Lowest Price</option>
                        <option value="discount">Highest Discount</option>
                        <option value="newest">Newest</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {visibleBags.length ? (
                <div className="row product-listing-grid">
                  {visibleBags.map((bag) => (
                    <div className="col-12 col-sm-6 col-xl-4" key={bag.slug}>
                      <SurpriseBagCard bag={bag} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="product-listing-empty">
                  <h2>No surprise bags found</h2>
                  <p>Try clearing a filter or searching for something else.</p>
                  <button type="button" className="btn btn-outline-primary-2" onClick={clearFilters}>
                    Clear filters
                  </button>
                </div>
              )}
                </>
              )}
            </div>

            <aside className="col-lg-3 order-lg-first">
              <div className="sidebar sidebar-shop">
                <div className="widget widget-clean">
                  <label>Filters:</label>
                  <button type="button" className="sidebar-filter-clear" onClick={clearFilters}>
                    Clear All
                  </button>
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
                      <div className="filter-range-input">
                        <span aria-hidden="true">VND</span>
                        <button
                          type="button"
                          className="filter-range-stepper"
                          onClick={() => setPriceDraft((current) => ({ ...current, min: stepDraftValue(current.min, -10000, PRICE_MIN, PRICE_MIN, PRICE_MAX) }))}
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
                        />
                        <button
                          type="button"
                          className="filter-range-stepper"
                          onClick={() => setPriceDraft((current) => ({ ...current, min: stepDraftValue(current.min, 10000, PRICE_MIN, PRICE_MIN, PRICE_MAX) }))}
                          aria-label="Increase minimum price"
                        >
                          +
                        </button>
                      </div>
                      <span className="filter-range-separator" aria-hidden="true">-</span>
                      <div className="filter-range-input">
                        <span aria-hidden="true">VND</span>
                        <button
                          type="button"
                          className="filter-range-stepper"
                          onClick={() => setPriceDraft((current) => ({ ...current, max: stepDraftValue(current.max, -10000, PRICE_MAX, PRICE_MIN, PRICE_MAX) }))}
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
                        />
                        <button
                          type="button"
                          className="filter-range-stepper"
                          onClick={() => setPriceDraft((current) => ({ ...current, max: stepDraftValue(current.max, 10000, PRICE_MAX, PRICE_MIN, PRICE_MAX) }))}
                          aria-label="Increase maximum price"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button type="button" className="btn btn-outline-primary-2 filter-range-apply" onClick={applyPriceFilter}>
                      Apply
                    </button>
                  </div>
                </FilterWidget>

                {!storeSlug ? (
                  <FilterWidget id="distance-filter" title="Distance">
                    <div className="filter-range">
                      <div className="filter-range-fields">
                        <div className="filter-range-input">
                          <span aria-hidden="true">KM</span>
                          <button
                            type="button"
                            className="filter-range-stepper"
                            onClick={() => setDistanceDraft((current) => ({ ...current, min: stepDraftValue(current.min, -0.1, DISTANCE_MIN, DISTANCE_MIN, DISTANCE_MAX) }))}
                            aria-label="Decrease minimum distance"
                          >
                            -
                          </button>
                          <input
                            type="text"
                            id="distance-min"
                            inputMode="decimal"
                            value={distanceDraft.min}
                            onChange={(event) => setDistanceDraft((current) => ({ ...current, min: event.target.value }))}
                            placeholder="MIN"
                            aria-label="Minimum distance"
                          />
                          <button
                            type="button"
                            className="filter-range-stepper"
                            onClick={() => setDistanceDraft((current) => ({ ...current, min: stepDraftValue(current.min, 0.1, DISTANCE_MIN, DISTANCE_MIN, DISTANCE_MAX) }))}
                            aria-label="Increase minimum distance"
                          >
                            +
                          </button>
                        </div>
                        <span className="filter-range-separator" aria-hidden="true">-</span>
                        <div className="filter-range-input">
                          <span aria-hidden="true">KM</span>
                          <button
                            type="button"
                            className="filter-range-stepper"
                            onClick={() => setDistanceDraft((current) => ({ ...current, max: stepDraftValue(current.max, -0.1, DISTANCE_MAX, DISTANCE_MIN, DISTANCE_MAX) }))}
                            aria-label="Decrease maximum distance"
                          >
                            -
                          </button>
                          <input
                            type="text"
                            id="distance-max"
                            inputMode="decimal"
                            value={distanceDraft.max}
                            onChange={(event) => setDistanceDraft((current) => ({ ...current, max: event.target.value }))}
                            placeholder="MAX"
                            aria-label="Maximum distance"
                          />
                          <button
                            type="button"
                            className="filter-range-stepper"
                            onClick={() => setDistanceDraft((current) => ({ ...current, max: stepDraftValue(current.max, 0.1, DISTANCE_MAX, DISTANCE_MIN, DISTANCE_MAX) }))}
                            aria-label="Increase maximum distance"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button type="button" className="btn btn-outline-primary-2 filter-range-apply" onClick={applyDistanceFilter}>
                        Apply
                      </button>
                    </div>
                  </FilterWidget>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
