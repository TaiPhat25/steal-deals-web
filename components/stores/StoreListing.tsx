"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ApiClientError } from "@/lib/api/client";
import { listBags, listStores } from "@/lib/api/store";
import NewStoreCard from "@/components/home/NewStoreCard";
import { mapStoreResponse } from "@/components/stores/store-api-mappers";
import type { StoreProfile } from "@/components/stores/store-profile-data";

type StoreFilter = "all" | "old" | "new";
type StoreSort = "rating" | "bags" | "name";
const STORES_PER_PAGE = 20;

export default function StoreListing() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StoreFilter>("all");
  const [sort, setSort] = useState<StoreSort>("rating");
  const [page, setPage] = useState(1);
  const [storeProfiles, setStoreProfiles] = useState<StoreProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    let active = true;

    void Promise.all([listStores(), listBags()])
      .then(([storesResponse, bagsResponse]) => {
        if (!active) return;

        setStoreProfiles(
          storesResponse.map((store) => mapStoreResponse(store, bagsResponse)),
        );
        setPage(1);
      })
      .catch((requestError) => {
        if (!active) return;

        setLoadError(
          requestError instanceof ApiClientError
            ? requestError.message
            : "Unable to load stores. Please try again.",
        );
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
      .filter((store) => store.isActive)
      .filter((store) => {
        if (filter === "old") return store.isVerify;
        if (filter === "new") return !store.isVerify;
        return true;
      })
      .filter((store) => {
        if (!normalizedQuery) return true;

        return [store.name, store.description, store.address]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedQuery));
      })
      .sort((left, right) => {
        if (sort === "bags") return right.surpriseBags.length - left.surpriseBags.length;
        if (sort === "name") return left.name.localeCompare(right.name);
        return right.ratingScore - left.ratingScore;
      });
  }, [filter, query, sort, storeProfiles]);

  const totalPages = Math.max(1, Math.ceil(stores.length / STORES_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visibleStores = stores.slice(
    (currentPage - 1) * STORES_PER_PAGE,
    currentPage * STORES_PER_PAGE,
  );

  function changeFilter(nextFilter: StoreFilter) {
    setFilter(nextFilter);
    setPage(1);
  }

  function changeQuery(nextQuery: string) {
    setQuery(nextQuery);
    setPage(1);
  }

  function changeSort(nextSort: StoreSort) {
    setSort(nextSort);
    setPage(1);
  }

  function clearFilters() {
    setQuery("");
    setFilter("all");
    setPage(1);
  }

  function retryLoadingStores() {
    setIsLoading(true);
    setLoadError(null);
    setReloadVersion((current) => current + 1);
  }

  return (
    <main className="main store-listing-page">
      <section className="store-listing-hero">
        <Image
          src="/assets/images/demos/demo-28/banners/5.jpg"
          alt="Fresh food prepared by local stores"
          fill
          priority
          sizes="100vw"
        />
        <div className="store-listing-hero__overlay" aria-hidden="true" />
        <div className="container store-listing-hero__content">
          <p>Discover local food rescue partners</p>
          <h1>Stores near you</h1>
          <span>Find local businesses offering good food at a better price.</span>
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
                  : `${stores.length} ${stores.length === 1 ? "store" : "stores"} available`}
              </span>
            </div>

            <label className="store-listing-search">
              <span className="sr-only">Search stores</span>
              <i className="icon-search" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => changeQuery(event.target.value)}
                placeholder="Search stores, areas, or food rescue partners"
              />
            </label>

            <div className="store-listing-toolbar">
              <div className="store-listing-filters" role="group" aria-label="Filter stores">
                <button type="button" className={filter === "all" ? "is-active" : ""} onClick={() => changeFilter("all")}>All stores</button>
                <button type="button" className={filter === "old" ? "is-active" : ""} onClick={() => changeFilter("old")}>Old stores</button>
                <button type="button" className={filter === "new" ? "is-active" : ""} onClick={() => changeFilter("new")}>New stores</button>
              </div>
              <label className="store-listing-sort">
                <span>Sort by</span>
                <select value={sort} onChange={(event) => changeSort(event.target.value as StoreSort)}>
                  <option value="rating">Highest rated</option>
                  <option value="bags">Most available bags</option>
                  <option value="name">Store name</option>
                </select>
              </label>
            </div>
          </section>

          {isLoading ? (
            <section className="store-listing-empty" aria-live="polite">
              <h2>Loading stores</h2>
              <p>Finding active food rescue partners near you.</p>
            </section>
          ) : loadError ? (
            <section className="store-listing-empty" aria-live="assertive">
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
            <section className="store-listing-grid" aria-label="Available stores">
              {visibleStores.map((store) => <NewStoreCard key={store.id} store={store} />)}
            </section>
          ) : (
            <section className="store-listing-empty" aria-live="polite">
              <i className="icon-search" aria-hidden="true" />
              <h2>No stores found</h2>
              <p>Try a different search term or clear the current filter.</p>
              <button type="button" className="btn btn-outline-primary-2" onClick={clearFilters}>
                Clear filters
              </button>
            </section>
          )}

          {totalPages > 1 ? (
            <nav className="store-listing-pagination" aria-label="Store pages">
              <button
                type="button"
                aria-label="Previous store page"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                type="button"
                aria-label="Next store page"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
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
