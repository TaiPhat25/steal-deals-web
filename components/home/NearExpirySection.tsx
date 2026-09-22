"use client";

import Link from "next/link";
import { toListingBag } from "@/components/products/product-listing-data";
import DragScrollRow from "./DragScrollRow";
import HomeCollectionState from "./HomeCollectionState";
import { useHomeData } from "./HomeDataProvider";
import SurpriseBagCard from "./SurpriseBagCard";

export default function NearExpirySection() {
  const { bags: bagResource, retry } = useHomeData();
  const bags = bagResource.data
    .filter((bag) => (bag.status || "").toLowerCase() === "active")
    .map(toListingBag)
    .sort((a, b) => {
      const timeA = Date.parse(a.pickupStartTime) || 0;
      const timeB = Date.parse(b.pickupStartTime) || 0;
      return timeA - timeB;
    });

  return (
    <section className="near-expiry-section bg-lighter py-5" aria-labelledby="near-expiry-title">
      <div className="container">
        <div className="near-expiry-section__heading">
          <div>
            <p className="near-expiry-section__eyebrow">Rescue good food near you</p>
            <h2 id="near-expiry-title" className="title mb-1">
              Near-Expiry Surprise Bags
            </h2>
            <p className="near-expiry-section__description mb-0">
              Save money and help reduce food waste with discounted bags available for pickup today.
            </p>
          </div>
          <Link href="/products?sort=near-expiry" className="near-expiry-section__view-all">
            View all surprise bags
            <i className="icon-angle-right" aria-hidden="true"></i>
          </Link>
        </div>

        {bagResource.status === "loading" ? (
          <HomeCollectionState state="loading" message="Loading surprise bags" />
        ) : bagResource.status === "error" ? (
          <HomeCollectionState
            state="error"
            title="Surprise bags are temporarily unavailable"
            message={bagResource.error ?? "Please try again."}
            onRetry={retry}
          />
        ) : bags.length === 0 ? (
          <HomeCollectionState
            state="empty"
            title="No surprise bags available"
            message="New near-expiry bags will appear here when stores add them."
          />
        ) : (
          <DragScrollRow className="drag-scroll-row near-expiry-scroll-row" visibleItems={5}>
            {bags.map((bag) => (
              <SurpriseBagCard key={bag.backendId ?? bag.slug} bag={bag} />
            ))}
          </DragScrollRow>
        )}
      </div>
    </section>
  );
}
