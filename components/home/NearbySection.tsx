"use client";

import Link from "next/link";
import { toListingBag } from "@/components/products/product-listing-data";
import DragScrollRow from "./DragScrollRow";
import HomeCollectionState from "./HomeCollectionState";
import { useHomeData } from "./HomeDataProvider";
import SurpriseBagCard from "./SurpriseBagCard";

export default function NearbySection() {
  const { bags: bagResource, retry } = useHomeData();
  const bags = bagResource.data
    .filter((bag) => (bag.status || "").toLowerCase() === "active")
    .map(toListingBag)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <section className="nearby-section py-5" aria-labelledby="nearby-title">
      <div className="container">
        <div className="nearby-section__heading">
          <div>
            <p className="nearby-section__eyebrow">Find food close to you</p>
            <h2 id="nearby-title" className="title mb-1">
              Near You
            </h2>
            <p className="nearby-section__description mb-0">
              Discover surprise bags from nearby stores and pick them up before they are gone.
            </p>
          </div>
          <Link href="/products?sort=distance" className="nearby-section__view-all">
            View all nearby
            <i className="icon-angle-right" aria-hidden="true"></i>
          </Link>
        </div>

        {bagResource.status === "loading" ? (
          <HomeCollectionState state="loading" message="Loading nearby bags" />
        ) : bagResource.status === "error" ? (
          <HomeCollectionState
            state="error"
            title="Nearby bags are temporarily unavailable"
            message={bagResource.error ?? "Please try again."}
            onRetry={retry}
          />
        ) : bags.length === 0 ? (
          <HomeCollectionState
            state="empty"
            title="No nearby bags available"
            message="Nearby surprise bags will appear here when stores add them."
          />
        ) : (
          <DragScrollRow className="drag-scroll-row nearby-scroll-row" visibleItems={5}>
            {bags.map((bag) => (
              <SurpriseBagCard key={bag.backendId ?? bag.slug} bag={bag} />
            ))}
          </DragScrollRow>
        )}
      </div>
    </section>
  );
}
