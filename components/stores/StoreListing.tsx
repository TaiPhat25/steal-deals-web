"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ApiClientError } from "@/lib/api/client";
import { listAvailableBags, listStores } from "@/lib/api/store";
import NewStoreCard from "@/components/home/NewStoreCard";
import { mapStoreResponses } from "@/components/stores/store-api-mappers";
import {
  getAvailableBagQuantity,
  isNewStore,
  isPublicStore,
} from "@/components/stores/store-listing-data";
import {
  buildStoreListingSearchParams,
  DEFAULT_STORE_LISTING_STATE,
  parseStoreListingSearchParams,
} from "@/components/stores/store-listing-query";
import type {
  StoreFilter,
  StoreListingUrlState,
  StoreSort,
} from "@/components/stores/store-listing-query";
import type { StoreProfile } from "@/components/stores/store-types";

const STORES_PER_PAGE = 20;
const ABOVE_THE_FOLD_STORE_COUNT = 4;
const STORE_LISTING_IMAGE_SIZES = "(max-width: 575px) calc(100vw - 30px), (max-width: 991px) calc(50vw - 38px), (max-width: 1199px) 225px, 270px";

type StoreListingProps = {
  initialState?: StoreListingUrlState;
};

export default function StoreListing({
  initialState = DEFAULT_STORE_LISTING_STATE,
}: StoreListingProps) {
  const [query, setQuery] = useState(initialState.query);
  const [filter, setFilter] = useState<StoreFilter>(initialState.filter);
  const [sort, setSort] = useState<StoreSort>(initialState.sort);
  const [page, setPage] = useState(initialState.page);
  const [storeProfiles, setStoreProfiles] = useState<StoreProfile[]>([]);
  const [listingReferenceTime, setListingReferenceTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [bagAvailabilityError, setBagAvailabilityError] = useState<string | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function restoreStateFromUrl() {
      const restoredState = parseStoreListingSearchParams(
        new URLSearchParams(window.location.search),
      );

      setQuery(restoredState.query);
      setFilter(restoredState.filter);
      setSort(restoredState.sort);
      setPage(restoredState.page);
    }

    window.addEventListener("popstate", restoreStateFromUrl);
    return () => window.removeEventListener("popstate", restoreStateFromUrl);
  }, []);

  useEffect(() => {
    let active = true;

    void Promise.allSettled([listStores(), listAvailableBags()])
      .then(([storesResult, bagsResult]) => {
        if (!active) return;

        if (storesResult.status === "rejected") {
          setLoadError(
            storesResult.reason instanceof ApiClientError
              ? storesResult.reason.message
              : "Unable to load stores. Please try again.",
          );
          setBagAvailabilityError(null);
          return;
        }

        const hasBagAvailability = bagsResult.status === "fulfilled";
        const bags = hasBagAvailability ? bagsResult.value : [];

        setLoadError(null);
        setBagAvailabilityError(
          hasBagAvailability
            ? null
            : "Bag availability is temporarily unavailable.",
        );
        setStoreProfiles(mapStoreResponses(storesResult.value, bags));
        setListingReferenceTime(Date.now());
        if (!hasBagAvailability) {
          setSort((current) => current === "bags" ? "rating" : current);

          const currentUrlState = parseStoreListingSearchParams(
            new URLSearchParams(window.location.search),
          );
          if (currentUrlState.sort === "bags") {
            updateStoreListingUrl(
              { ...currentUrlState, sort: "rating" },
              "replaceState",
            );
          }
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadVersion]);

  const stores = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return storeProfiles
      .filter(isPublicStore)
      .filter((store) => {
        const storeIsNew = listingReferenceTime !== null
          && isNewStore(store, listingReferenceTime);
        if (filter === "established") return !storeIsNew;
        if (filter === "new") return storeIsNew;
        return true;
      })
      .filter((store) => {
        if (!normalizedQuery) return true;

        return [store.name, store.description, store.address]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedQuery));
      })
      .sort((left, right) => {
        if (sort === "bags") {
          return getAvailableBagQuantity(right.surpriseBags)
            - getAvailableBagQuantity(left.surpriseBags);
        }
        if (sort === "name") return left.name.localeCompare(right.name);
        return right.ratingScore - left.ratingScore;
      });
  }, [filter, listingReferenceTime, query, sort, storeProfiles]);

  const totalPages = Math.max(1, Math.ceil(stores.length / STORES_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visibleStores = stores.slice(
    (currentPage - 1) * STORES_PER_PAGE,
    currentPage * STORES_PER_PAGE,
  );
  const firstVisibleStore = stores.length
    ? (currentPage - 1) * STORES_PER_PAGE + 1
    : 0;
  const lastVisibleStore = Math.min(
    currentPage * STORES_PER_PAGE,
    stores.length,
  );
  const visiblePageNumbers = getVisiblePageNumbers(currentPage, totalPages);

  function focusResults() {
    window.requestAnimationFrame(() => {
      const prefersReducedMotion = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      ).matches ?? false;

      resultsRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
      resultsRef.current?.focus({ preventScroll: true });
    });
  }

  function changeFilter(nextFilter: StoreFilter) {
    setFilter(nextFilter);
    setPage(1);
    updateStoreListingUrl(
      { query, filter: nextFilter, sort, page: 1 },
      "pushState",
    );
    focusResults();
  }

  function changeQuery(nextQuery: string) {
    setQuery(nextQuery);
    setPage(1);
    updateStoreListingUrl(
      { query: nextQuery, filter, sort, page: 1 },
      "replaceState",
    );
  }

  function changeSort(nextSort: StoreSort) {
    setSort(nextSort);
    setPage(1);
    updateStoreListingUrl(
      { query, filter, sort: nextSort, page: 1 },
      "pushState",
    );
    focusResults();
  }

  function clearSearch() {
    setQuery("");
    setPage(1);
    updateStoreListingUrl(
      { query: "", filter, sort, page: 1 },
      "replaceState",
    );
    searchInputRef.current?.focus();
  }

  function clearFilters() {
    setQuery("");
    setFilter("all");
    setPage(1);
    updateStoreListingUrl(
      { query: "", filter: "all", sort, page: 1 },
      "pushState",
    );
    focusResults();
  }

  function changePage(nextPage: number) {
    const normalizedPage = Math.min(totalPages, Math.max(1, nextPage));

    if (normalizedPage === currentPage) return;

    setPage(normalizedPage);
    updateStoreListingUrl(
      { query, filter, sort, page: normalizedPage },
      "pushState",
    );
    focusResults();
  }

  function retryLoadingStores() {
    setIsLoading(true);
    setLoadError(null);
    setBagAvailabilityError(null);
    setReloadVersion((current) => current + 1);
  }

  return (
    <main className="main store-listing-page">
      <section className="store-listing-hero">
        <Image
          src="/assets/images/page-headers/stores-local-market.webp"
          alt=""
          fill
          preload
          sizes="100vw"
        />
        <div className="store-listing-hero__overlay" aria-hidden="true" />
        <div className="container store-listing-hero__content">
          <p>Discover local food rescue partners</p>
          <h1>Local rescue stores</h1>
          <span>Find verified local businesses offering surplus food at a better price.</span>
        </div>
      </section>

      <nav aria-label="Breadcrumb" className="breadcrumb-nav border-0 mb-0">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link href="/">Home</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Stores</li>
          </ol>
        </div>
      </nav>

      <div className="page-content">
        <div className="container">
          <section className="store-listing-controls" aria-label="Store filters">
            <div className="store-listing-controls__heading">
              <div>
                <p>Browse the community</p>
                <h2>Local stores</h2>
              </div>
              <span>
                {isLoading
                  ? "Loading stores..."
                  : stores.length
                    ? `Showing ${firstVisibleStore}-${lastVisibleStore} of ${stores.length} stores`
                    : "0 stores available"}
              </span>
            </div>

            <div className="store-listing-search">
              <label className="sr-only" htmlFor="store-search">
                Search stores
              </label>
              <i className="icon-search" aria-hidden="true" />
              <input
                ref={searchInputRef}
                id="store-search"
                type="search"
                aria-controls="store-listing-results"
                value={query}
                onChange={(event) => changeQuery(event.target.value)}
                placeholder="Search stores, areas, or food rescue partners"
              />
              {query ? (
                <button
                  type="button"
                  className="store-listing-search__clear"
                  aria-label="Clear store search"
                  title="Clear search"
                  onClick={clearSearch}
                >
                  <i className="icon-close" aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <div className="store-listing-toolbar">
              <div className="store-listing-filters" role="group" aria-label="Filter stores">
                <button
                  type="button"
                  className={filter === "all" ? "is-active" : ""}
                  aria-pressed={filter === "all"}
                  aria-controls="store-listing-results"
                  onClick={() => changeFilter("all")}
                >
                  All stores
                </button>
                <button
                  type="button"
                  className={filter === "established" ? "is-active" : ""}
                  aria-pressed={filter === "established"}
                  aria-controls="store-listing-results"
                  onClick={() => changeFilter("established")}
                >
                  Established stores
                </button>
                <button
                  type="button"
                  className={filter === "new" ? "is-active" : ""}
                  aria-pressed={filter === "new"}
                  aria-controls="store-listing-results"
                  onClick={() => changeFilter("new")}
                >
                  New stores
                </button>
              </div>
              <label className="store-listing-sort">
                <span>Sort by</span>
                <select
                  aria-controls="store-listing-results"
                  value={sort}
                  onChange={(event) => changeSort(event.target.value as StoreSort)}
                >
                  <option value="rating">Highest rated</option>
                  <option value="bags" disabled={bagAvailabilityError !== null}>
                    Most available bags
                  </option>
                  <option value="name">Store name</option>
                </select>
              </label>
            </div>
          </section>

          {!isLoading && !loadError && bagAvailabilityError ? (
            <section className="store-listing-notice" aria-live="polite">
              <div>
                <strong>Bag availability unavailable</strong>
                <span>Store profiles are still available. Retry to restore live bag totals.</span>
              </div>
              <button
                type="button"
                className="btn btn-outline-primary-2 store-listing-notice__retry"
                onClick={retryLoadingStores}
              >
                Try again
              </button>
            </section>
          ) : null}

          {loadError ? (
            <p className="sr-only" role="alert">
              Stores could not be loaded. {loadError}
            </p>
          ) : (
            <p className="sr-only" role="status" aria-atomic="true">
              {isLoading
                ? "Loading stores."
                : `${stores.length} ${stores.length === 1 ? "store" : "stores"} found. Page ${currentPage} of ${totalPages}.`}
            </p>
          )}

          <div
            ref={resultsRef}
            id="store-listing-results"
            className="store-listing-results"
            role="region"
            aria-labelledby="store-listing-results-heading"
            aria-busy={isLoading}
            tabIndex={-1}
          >
            <h2 id="store-listing-results-heading" className="sr-only">
              Store results
            </h2>
            {isLoading ? (
              <section className="store-listing-empty">
                <h2>Loading stores</h2>
                <p>Finding active food rescue partners.</p>
              </section>
            ) : loadError ? (
              <section className="store-listing-empty">
                <h2>Unable to load stores</h2>
                <p>{loadError}</p>
                <button
                  type="button"
                  className="btn btn-outline-primary-2"
                  onClick={retryLoadingStores}
                >
                  Try again
                </button>
              </section>
            ) : stores.length ? (
              <div className="store-listing-grid">
                {visibleStores.map((store, index) => (
                  <NewStoreCard
                    key={store.id}
                    store={store}
                    imageSizes={STORE_LISTING_IMAGE_SIZES}
                    isAvailabilityKnown={bagAvailabilityError === null}
                    loadImageEagerly={index < ABOVE_THE_FOLD_STORE_COUNT}
                  />
                ))}
              </div>
            ) : (
              <section className="store-listing-empty">
                <i className="icon-search" aria-hidden="true" />
                <h2>No stores found</h2>
                <p>Try a different search term or clear the current filter.</p>
                <button
                  type="button"
                  className="btn btn-outline-primary-2"
                  aria-controls="store-listing-results"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              </section>
            )}
          </div>

          {totalPages > 1 ? (
            <nav className="store-listing-pagination" aria-label="Store pages">
              <button
                type="button"
                aria-label="Previous store page"
                aria-controls="store-listing-results"
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <div className="store-listing-pagination__pages">
                {visiblePageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={pageNumber === currentPage ? "is-active" : ""}
                    aria-label={`Go to store page ${pageNumber}`}
                    aria-current={pageNumber === currentPage ? "page" : undefined}
                    aria-controls="store-listing-results"
                    onClick={() => changePage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
              <span className="sr-only">Page {currentPage} of {totalPages}</span>
              <button
                type="button"
                aria-label="Next store page"
                aria-controls="store-listing-results"
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </nav>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function getVisiblePageNumbers(currentPage: number, totalPages: number) {
  const maximumVisiblePages = 5;
  const visiblePageCount = Math.min(maximumVisiblePages, totalPages);
  const maximumStartPage = totalPages - visiblePageCount + 1;
  const startPage = Math.min(
    Math.max(1, currentPage - Math.floor(visiblePageCount / 2)),
    maximumStartPage,
  );

  return Array.from(
    { length: visiblePageCount },
    (_, index) => startPage + index,
  );
}

function updateStoreListingUrl(
  nextState: StoreListingUrlState,
  method: "pushState" | "replaceState",
) {
  const searchParams = buildStoreListingSearchParams(
    new URLSearchParams(window.location.search),
    nextState,
  );
  const queryString = searchParams.toString();
  const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash}`;

  window.history[method](null, "", nextUrl);
}
