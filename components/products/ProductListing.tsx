"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SurpriseBagCard from "@/components/home/SurpriseBagCard";
import {
  filterBags,
  normalizeSort,
  storeNames,
  surpriseBags,
  type ListingBag,
} from "./product-listing-data";

type ProductListingProps = {
  initialCategory?: string;
  initialQuery?: string;
  initialSort?: string;
  storeSlug?: string;
};

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
  const [pickupDay, setPickupDay] = useState<"all" | ListingBag["pickupDay"]>("all");
  const [maxPrice, setMaxPrice] = useState(300000);
  const [maxDistance, setMaxDistance] = useState(10);
  const [sort, setSort] = useState(normalizeSort(initialSort));
  const storeName = storeSlug ? storeNames[storeSlug] : undefined;
  const scopedBags = useMemo(
    () => surpriseBags.filter((bag) => !storeSlug || bag.storeSlug === storeSlug),
    [storeSlug],
  );
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
      filterBags(surpriseBags, {
        query,
        categories,
        pickupDay,
        maxPrice,
        maxDistance: storeSlug ? Number.POSITIVE_INFINITY : maxDistance,
        sort,
        storeSlug,
      }),
    [categories, maxDistance, maxPrice, pickupDay, query, sort, storeSlug],
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
    setPickupDay("all");
    setMaxPrice(300000);
    setMaxDistance(10);
    setSort("popularity");
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

                <FilterWidget id="pickup-filter" title="Pickup">
                  <div className="filter-items">
                    {(["all", "today", "tomorrow"] as const).map((day) => (
                      <div className="filter-item" key={day}>
                        <div className="custom-control custom-radio">
                          <input
                            type="radio"
                            className="custom-control-input"
                            id={`pickup-${day}`}
                            name="pickup-day"
                            checked={pickupDay === day}
                            onChange={() => setPickupDay(day)}
                          />
                          <label className="custom-control-label text-capitalize" htmlFor={`pickup-${day}`}>
                            {day === "all" ? "Any day" : day}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </FilterWidget>

                <FilterWidget id="price-filter" title="Price">
                  <div className="filter-price">
                    <div className="filter-price-text">
                      Up to <span>{maxPrice.toLocaleString("en-US")} VND</span>
                    </div>
                    <label className="sr-only" htmlFor="price-range">Maximum price</label>
                    <input
                      type="range"
                      id="price-range"
                      className="category-price-range"
                      min="50000"
                      max="300000"
                      step="10000"
                      value={maxPrice}
                      onChange={(event) => setMaxPrice(Number(event.target.value))}
                    />
                  </div>
                </FilterWidget>

                {!storeSlug ? (
                  <FilterWidget id="distance-filter" title="Distance">
                    <div className="filter-price">
                      <div className="filter-price-text">
                        Within <span>{maxDistance} km</span>
                      </div>
                      <label className="sr-only" htmlFor="distance-range">Maximum distance</label>
                      <input
                        type="range"
                        id="distance-range"
                        className="category-price-range"
                        min="1"
                        max="10"
                        value={maxDistance}
                        onChange={(event) => setMaxDistance(Number(event.target.value))}
                      />
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
