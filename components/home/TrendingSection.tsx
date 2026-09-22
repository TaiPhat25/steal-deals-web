"use client";

import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";
import { toListingBag } from "@/components/products/product-listing-data";
import DragScrollRow from "./DragScrollRow";
import HomeCollectionState from "./HomeCollectionState";
import { useHomeData } from "./HomeDataProvider";
import SurpriseBagCard from "./SurpriseBagCard";

export default function TrendingSection() {
  const { bags: bagResource, retry } = useHomeData();
  const bags = bagResource.data
    .filter((bag) => (bag.status || "").toLowerCase() === "active")
    .map(toListingBag)
    .sort(
      (a, b) =>
        b.popularity - a.popularity || b.discountPercent - a.discountPercent,
    );

  return (
    <section className="trending-section bg-lighter py-5" aria-labelledby="trending-title">
      <div className="container">
        <div className="trending-section__heading">
          <div>
            <p className="trending-section__eyebrow">Popular with {BRAND_NAME} buyers</p>
            <h2 id="trending-title" className="title mb-1">
              Trending Now
            </h2>
            <p className="trending-section__description mb-0">
              See the surprise bags buyers are discovering and sharing this week.
            </p>
          </div>
          <Link href="/products?sort=trending" className="trending-section__view-all">
            View all trending
            <i className="icon-angle-right" aria-hidden="true"></i>
          </Link>
        </div>

        {bagResource.status === "loading" ? (
          <HomeCollectionState state="loading" message="Loading trending bags" />
        ) : bagResource.status === "error" ? (
          <HomeCollectionState
            state="error"
            title="Trending bags are temporarily unavailable"
            message={bagResource.error ?? "Please try again."}
            onRetry={retry}
          />
        ) : bags.length === 0 ? (
          <HomeCollectionState
            state="empty"
            title="No trending bags available"
            message="Popular surprise bags will appear here as buyers discover them."
          />
        ) : (
          <DragScrollRow className="drag-scroll-row trending-scroll-row" visibleItems={5}>
            {bags.map((bag) => (
              <SurpriseBagCard key={bag.backendId ?? bag.slug} bag={bag} />
            ))}
          </DragScrollRow>
        )}
      </div>
    </section>
  );
}
