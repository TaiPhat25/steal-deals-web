"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import NewStoreCard from "@/components/home/NewStoreCard";
import { storeProfiles } from "@/components/stores/store-profile-data";

type StoreFilter = "all" | "verified" | "new";
type StoreSort = "rating" | "bags" | "name";

export default function StoreListing() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StoreFilter>("all");
  const [sort, setSort] = useState<StoreSort>("rating");

  const stores = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return storeProfiles
      .filter((store) => store.isActive)
      .filter((store) => {
        if (filter === "verified") return store.isVerify;
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
  }, [filter, query, sort]);

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
              <span>{stores.length} {stores.length === 1 ? "store" : "stores"} available</span>
            </div>

            <label className="store-listing-search">
              <span className="sr-only">Search stores</span>
              <i className="icon-search" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search stores, areas, or food rescue partners"
              />
            </label>

            <div className="store-listing-toolbar">
              <div className="store-listing-filters" role="group" aria-label="Filter stores">
                <button type="button" className={filter === "all" ? "is-active" : ""} onClick={() => setFilter("all")}>All stores</button>
                <button type="button" className={filter === "verified" ? "is-active" : ""} onClick={() => setFilter("verified")}>Verified</button>
                <button type="button" className={filter === "new" ? "is-active" : ""} onClick={() => setFilter("new")}>New stores</button>
              </div>
              <label className="store-listing-sort">
                <span>Sort by</span>
                <select value={sort} onChange={(event) => setSort(event.target.value as StoreSort)}>
                  <option value="rating">Highest rated</option>
                  <option value="bags">Most available bags</option>
                  <option value="name">Store name</option>
                </select>
              </label>
            </div>
          </section>

          {stores.length ? (
            <section className="store-listing-grid" aria-label="Available stores">
              {stores.map((store) => <NewStoreCard key={store.id} store={store} />)}
            </section>
          ) : (
            <section className="store-listing-empty" aria-live="polite">
              <i className="icon-search" aria-hidden="true" />
              <h2>No stores found</h2>
              <p>Try a different search term or clear the current filter.</p>
              <button type="button" className="btn btn-outline-primary-2" onClick={() => { setQuery(""); setFilter("all"); }}>
                Clear filters
              </button>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
