"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SurpriseBagCard from "@/components/home/SurpriseBagCard";
import { useDialogFocusTrap } from "@/components/login/use-dialog-focus-trap";
import { ApiClientError } from "@/lib/api/client";
import { listAvailableBags } from "@/lib/api/store";
import { listAvailableBagsWithDistances } from "@/lib/api/store";
import { useUserLocation } from "@/components/location/UserLocationProvider";
import {
  filterBags,
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
const DISTANCE_OPTIONS = [2, 5, 10, 20] as const;
const PICKUP_DAY_OPTIONS = [
  { value: "all", label: "Any day" },
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "later", label: "Later" },
] as const;
const ABOVE_THE_FOLD_PRODUCT_COUNT = 3;
const BAGS_PER_BATCH = 12;
const PRODUCT_LISTING_CARD_IMAGE_SIZES = "(max-width: 575px) calc(100vw - 30px), (max-width: 991px) calc(50vw - 30px), (max-width: 1199px) calc(37.5vw - 30px), 255px";
const priceFormatter = new Intl.NumberFormat("en-US");

function parsePriceDraft(value: string) {
  const normalized = value.trim().replace(/,/g, "");
  if (!/^\d+$/.test(normalized)) return null;

  const parsed = Number(normalized);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function stepPriceDraft(value: string, step: number) {
  const current = parsePriceDraft(value) ?? PRICE_MIN;
  return String(Math.max(PRICE_MIN, current + step));
}

function canDecreasePriceDraft(value: string) {
  return (parsePriceDraft(value) ?? PRICE_MIN) > PRICE_MIN;
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
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="widget widget-collapsible">
      <h3 className="widget-title">
        <button
          type="button"
          className="category-widget-toggle"
          aria-expanded={isExpanded}
          aria-controls={id}
          onClick={() => setIsExpanded((current) => !current)}
        >
          {title}
        </button>
      </h3>
      <div id={id} hidden={!isExpanded}>
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
  const [pickupDay, setPickupDay] = useState<ListingBag["pickupDay"] | "all">("all");
  const [maxDistance, setMaxDistance] = useState(Number.POSITIVE_INFINITY);
  const [priceDraft, setPriceDraft] = useState({ min: "", max: "" });
  const [sort, setSort] = useState(normalizeSort(initialSort));
  const [bags, setBags] = useState<ListingBag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [visibleCount, setVisibleCount] = useState(BAGS_PER_BATCH);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const filterDialogRef = useRef<HTMLDivElement>(null);
  const deferredQuery = useDeferredValue(query);
  const { coordinates, isLoading: isUserLocationLoading } = useUserLocation();

  useDialogFocusTrap({
    dialogRef: filterDialogRef,
    initialFocusSelector: "[data-filter-drawer-close]",
    onEscape: () => setIsFilterDrawerOpen(false),
    isActive: isFilterDrawerOpen,
  });

  useEffect(() => {
    if (isUserLocationLoading) return;

    let active = true;

    const bagsRequest = coordinates
      ? listAvailableBagsWithDistances({ ...coordinates, radiusInKm: 100, limit: 100 })
      : listAvailableBags();

    void bagsRequest
      .then((response) => {
        if (!active) return;

        setBags(response.map(toListingBag));
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
  }, [coordinates, isUserLocationLoading, reloadKey]);

  useEffect(() => {
    const desktopQuery = window.matchMedia?.("(min-width: 992px)");
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setIsFilterDrawerOpen(false);
    };

    desktopQuery?.addEventListener("change", closeAtDesktop);

    return () => {
      desktopQuery?.removeEventListener("change", closeAtDesktop);
    };
  }, []);

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
  const categoryOptions = useMemo(() => {
    const categoryCounts = new Map<string, number>();

    for (const bag of scopedBags) {
      categoryCounts.set(bag.category, (categoryCounts.get(bag.category) ?? 0) + 1);
    }

    return Array.from(categoryCounts.entries()).sort(([left], [right]) =>
      left.localeCompare(right),
    );
  }, [scopedBags]);
  const priceValidation = useMemo(
    () => validatePriceRange(priceDraft.min, priceDraft.max),
    [priceDraft],
  );
  const hasPriceFilter = minPrice > PRICE_MIN || Number.isFinite(maxPrice);
  const hasPickupDayFilter = pickupDay !== "all";
  const hasDistanceFilter = Boolean(coordinates) && Number.isFinite(maxDistance);
  const hasActiveFilters = Boolean(query.trim()) || categories.length > 0 || hasPriceFilter || hasPickupDayFilter || hasDistanceFilter;
  const activeFilterCount = Number(Boolean(query.trim())) + categories.length + Number(hasPriceFilter) + Number(hasPickupDayFilter) + Number(hasDistanceFilter);
  const visibleBags = useMemo(
    () =>
      filterBags(scopedBags, {
        query: deferredQuery,
        categories,
        pickupDay,
        minPrice,
        maxPrice,
        minDistance: 0,
        maxDistance: hasDistanceFilter ? maxDistance : Number.POSITIVE_INFINITY,
        sort,
      }),
    [categories, deferredQuery, hasDistanceFilter, maxDistance, maxPrice, minPrice, pickupDay, scopedBags, sort],
  );
  const shownBags = visibleBags.slice(0, visibleCount);

  function toggleCategory(category: string) {
    setVisibleCount(BAGS_PER_BATCH);
    setCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  }

  function clearFilters() {
    setVisibleCount(BAGS_PER_BATCH);
    setQuery("");
    setCategories([]);
    setMinPrice(PRICE_MIN);
    setMaxPrice(PRICE_MAX);
    setPickupDay("all");
    setMaxDistance(Number.POSITIVE_INFINITY);
    setPriceDraft({ min: "", max: "" });
    setSort("popularity");
  }

  function applyPriceFilter() {
    if (!priceValidation.isValid) return;

    setVisibleCount(BAGS_PER_BATCH);
    setMinPrice(priceValidation.min);
    setMaxPrice(priceValidation.max);
    setPriceDraft({
      min: priceValidation.min === PRICE_MIN ? "" : String(priceValidation.min),
      max: priceValidation.max === PRICE_MAX ? "" : String(priceValidation.max),
    });
  }

  function clearPriceFilter() {
    setVisibleCount(BAGS_PER_BATCH);
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
              onChange={(event) => {
                setQuery(event.target.value);
                setVisibleCount(BAGS_PER_BATCH);
              }}
              placeholder={storeName ? `Search ${storeName}` : "Search bags, stores, or food categories"}
            />
          </div>

          <div className="product-listing-mobile-actions">
            <button
              type="button"
              className="btn btn-outline-primary-2 product-listing-filter-trigger"
              aria-controls="product-listing-filters"
              aria-expanded={isFilterDrawerOpen}
              aria-label={activeFilterCount
                ? `Filters, ${activeFilterCount} active`
                : "Filters"}
              onClick={() => setIsFilterDrawerOpen(true)}
            >
              <span>Filters</span>
              {activeFilterCount ? (
                <span className="product-listing-filter-trigger__count" aria-hidden="true">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>
          </div>

          <div className="row">
            <div className="col-lg-9" aria-busy={query !== deferredQuery}>
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
                    Showing <span>{shownBags.length} of {visibleBags.length}</span> surprise bags
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
                        onChange={(event) => {
                          setSort(event.target.value);
                          setVisibleCount(BAGS_PER_BATCH);
                        }}
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
                      onClick={() => {
                        setQuery("");
                        setVisibleCount(BAGS_PER_BATCH);
                      }}
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
                  {hasPickupDayFilter ? (
                    <button
                      type="button"
                      className="product-listing-filter-chip"
                      onClick={() => {
                        setPickupDay("all");
                        setVisibleCount(BAGS_PER_BATCH);
                      }}
                      aria-label={`Remove pickup day filter: ${PICKUP_DAY_OPTIONS.find((option) => option.value === pickupDay)?.label}`}
                    >
                      Pickup: {PICKUP_DAY_OPTIONS.find((option) => option.value === pickupDay)?.label} <span aria-hidden="true">&times;</span>
                    </button>
                  ) : null}
                  {hasDistanceFilter ? (
                    <button
                      type="button"
                      className="product-listing-filter-chip"
                      onClick={() => {
                        setMaxDistance(Number.POSITIVE_INFINITY);
                        setVisibleCount(BAGS_PER_BATCH);
                      }}
                      aria-label={`Remove distance filter: Within ${maxDistance} km`}
                    >
                      Within {maxDistance} km <span aria-hidden="true">&times;</span>
                    </button>
                  ) : null}
                </div>
              ) : null}

              {visibleBags.length ? (
                <>
                  <div className="row product-listing-grid" id="product-listing-results">
                    {shownBags.map((bag, index) => (
                      <div className="col-12 col-sm-6 col-xl-4" key={bag.slug}>
                        <SurpriseBagCard
                          bag={bag}
                          eager={index < ABOVE_THE_FOLD_PRODUCT_COUNT}
                          imageSizes={PRODUCT_LISTING_CARD_IMAGE_SIZES}
                        />
                      </div>
                    ))}
                  </div>
                  {shownBags.length < visibleBags.length ? (
                    <div className="product-listing-load-more">
                      <button
                        type="button"
                        className="btn btn-outline-primary-2"
                        aria-controls="product-listing-results"
                        onClick={() => setVisibleCount((current) => current + BAGS_PER_BATCH)}
                      >
                        Load more
                      </button>
                    </div>
                  ) : null}
                </>
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

            <aside
              className={`col-lg-3 order-lg-first product-listing-filter-panel${isFilterDrawerOpen ? " is-open" : ""}`}
              id="product-listing-filters"
              aria-label="Product filters"
            >
              <div
                className="product-listing-filter-panel__surface"
                ref={filterDialogRef}
                role={isFilterDrawerOpen ? "dialog" : undefined}
                aria-modal={isFilterDrawerOpen ? "true" : undefined}
                aria-labelledby={isFilterDrawerOpen ? "product-filter-drawer-title" : undefined}
                tabIndex={-1}
              >
                <div className="product-listing-filter-panel__header">
                  <h2 id="product-filter-drawer-title">Filters</h2>
                  <button
                    type="button"
                    className="product-listing-filter-panel__close"
                    aria-label="Close filters"
                    onClick={() => setIsFilterDrawerOpen(false)}
                    data-filter-drawer-close
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>

                <div className="product-listing-filter-panel__body">
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

                <FilterWidget id="pickup-day-filter" title="Pickup day">
                  <div className="filter-items">
                    {PICKUP_DAY_OPTIONS.map(({ value, label }) => (
                      <div className="filter-item" key={value}>
                        <div className="custom-control custom-radio">
                          <input
                            type="radio"
                            className="custom-control-input"
                            name="pickup-day"
                            id={`pickup-day-${value}`}
                            checked={pickupDay === value}
                            onChange={() => {
                              setPickupDay(value);
                              setVisibleCount(BAGS_PER_BATCH);
                            }}
                          />
                          <label className="custom-control-label" htmlFor={`pickup-day-${value}`}>{label}</label>
                        </div>
                      </div>
                    ))}
                  </div>
                </FilterWidget>

                <FilterWidget id="distance-filter" title="Distance">
                  <div className="filter-items">
                    <div className="filter-item">
                      <div className="custom-control custom-radio">
                        <input
                          type="radio"
                          className="custom-control-input"
                          name="distance"
                          id="distance-any"
                          checked={!hasDistanceFilter}
                          onChange={() => {
                            setMaxDistance(Number.POSITIVE_INFINITY);
                            setVisibleCount(BAGS_PER_BATCH);
                          }}
                        />
                        <label className="custom-control-label" htmlFor="distance-any">Any distance</label>
                      </div>
                    </div>
                    {DISTANCE_OPTIONS.map((distance) => (
                      <div className="filter-item" key={distance}>
                        <div className="custom-control custom-radio">
                          <input
                            type="radio"
                            className="custom-control-input"
                            name="distance"
                            id={`distance-${distance}`}
                            checked={hasDistanceFilter && maxDistance === distance}
                            onChange={() => {
                              setMaxDistance(distance);
                              setVisibleCount(BAGS_PER_BATCH);
                            }}
                            disabled={!coordinates}
                          />
                          <label className="custom-control-label" htmlFor={`distance-${distance}`}>
                            Within {distance} km
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  {!coordinates && (
                    <p className="product-listing-distance-hint">
                      {isUserLocationLoading ? "Loading your saved address..." : (
                        <>Add a saved address with a map location in your <Link href="/profile">profile</Link> to filter by distance.</>
                      )}
                    </p>
                  )}
                </FilterWidget>

                <FilterWidget id="price-filter" title="Price">
                  <div className="filter-range">
                    <div className="filter-range-fields">
                      <div className="filter-range-field">
                        <label className="filter-range-field-label" htmlFor="price-min">
                          Minimum
                        </label>
                        <div className={`filter-range-input${priceValidation.isValid ? "" : " filter-range-input--invalid"}`}>
                          <span aria-hidden="true">VND</span>
                          <button
                            type="button"
                            className="filter-range-stepper"
                            onClick={() => setPriceDraft((current) => ({ ...current, min: stepPriceDraft(current.min, -10000) }))}
                            aria-label="Decrease minimum price"
                            disabled={!canDecreasePriceDraft(priceDraft.min)}
                          >
                            -
                          </button>
                          <input
                            type="text"
                            id="price-min"
                            inputMode="numeric"
                            value={priceDraft.min}
                            onChange={(event) => setPriceDraft((current) => ({ ...current, min: event.target.value }))}
                            placeholder="0"
                            aria-invalid={!priceValidation.isValid}
                            aria-describedby={!priceValidation.isValid ? "price-range-error" : undefined}
                          />
                          <button
                            type="button"
                            className="filter-range-stepper"
                            onClick={() => setPriceDraft((current) => ({ ...current, min: stepPriceDraft(current.min, 10000) }))}
                            aria-label="Increase minimum price"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <span className="filter-range-separator" aria-hidden="true">-</span>
                      <div className="filter-range-field">
                        <label className="filter-range-field-label" htmlFor="price-max">
                          Maximum
                        </label>
                        <div className={`filter-range-input${priceValidation.isValid ? "" : " filter-range-input--invalid"}`}>
                          <span aria-hidden="true">VND</span>
                          <button
                            type="button"
                            className="filter-range-stepper"
                            onClick={() => setPriceDraft((current) => ({ ...current, max: stepPriceDraft(current.max, -10000) }))}
                            aria-label="Decrease maximum price"
                            disabled={!canDecreasePriceDraft(priceDraft.max)}
                          >
                            -
                          </button>
                          <input
                            type="text"
                            id="price-max"
                            inputMode="numeric"
                            value={priceDraft.max}
                            onChange={(event) => setPriceDraft((current) => ({ ...current, max: event.target.value }))}
                            placeholder="0"
                            aria-invalid={!priceValidation.isValid}
                            aria-describedby={!priceValidation.isValid ? "price-range-error" : undefined}
                          />
                          <button
                            type="button"
                            className="filter-range-stepper"
                            onClick={() => setPriceDraft((current) => ({ ...current, max: stepPriceDraft(current.max, 10000) }))}
                            aria-label="Increase maximum price"
                          >
                            +
                          </button>
                        </div>
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
                </div>

                <div className="product-listing-filter-panel__footer">
                  <button
                    type="button"
                    className="btn btn-outline-primary-2"
                    aria-label="Clear all filters in drawer"
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                  >
                    Clear All
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary-2"
                    onClick={() => setIsFilterDrawerOpen(false)}
                  >
                    View {visibleBags.length} {visibleBags.length === 1 ? "Result" : "Results"}
                  </button>
                </div>
              </div>
            </aside>

            {isFilterDrawerOpen ? (
              <button
                type="button"
                className="product-listing-filter-backdrop is-open"
                aria-label="Dismiss filter drawer"
                onClick={() => setIsFilterDrawerOpen(false)}
              />
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
