"use client";

import { useMemo } from "react";
import Link from "next/link";
import { mapStoreResponse } from "@/components/stores/store-api-mappers";
import type { StoreProfile } from "@/components/stores/store-profile-data";
import DragScrollRow from "./DragScrollRow";
import HomeCollectionState from "./HomeCollectionState";
import { useHomeData } from "./HomeDataProvider";
import NewStoreCard from "./NewStoreCard";

const STORE_FALLBACK_IMAGE = "/assets/images/home/store-fallback.webp";

export default function NewStoresSection() {
  const { bags, retry, stores: storeResource } = useHomeData();
  const stores = useMemo<StoreProfile[]>(() => {
    return storeResource.data
      .filter((store) => store.isActive)
      .map((store) => mapStoreResponse(store, bags.data))
      .sort(
        (a, b) =>
          (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0),
      )
      .slice(0, 10);
  }, [bags.data, storeResource.data]);
  const isLoading =
    bags.status === "loading" || storeResource.status === "loading";
  const error = storeResource.error || bags.error;

  return (
    <section className="new-stores-section py-5" aria-labelledby="new-stores-title">
      <div className="container">
        <div className="new-stores-section__heading">
          <div>
            <p className="new-stores-section__eyebrow">Discover local businesses</p>
            <h2 id="new-stores-title" className="title mb-1">
              Discover New Stores
            </h2>
            <p className="new-stores-section__description mb-0">
              Meet new stores joining the food rescue community in your area.
            </p>
          </div>
          <Link href="/stores" className="new-stores-section__view-all">
            Browse new stores
            <i className="icon-angle-right" aria-hidden="true"></i>
          </Link>
        </div>

        {isLoading ? (
          <HomeCollectionState state="loading" message="Loading new stores" />
        ) : error ? (
          <HomeCollectionState
            state="error"
            title="New stores are temporarily unavailable"
            message={error}
            onRetry={retry}
          />
        ) : stores.length === 0 ? (
          <HomeCollectionState
            state="empty"
            title="No new stores yet"
            message="Recently joined stores will appear here."
          />
        ) : (
          <DragScrollRow className="drag-scroll-row new-stores-scroll-row" visibleItems={5}>
            {stores.map((store) => (
              <NewStoreCard
                key={store.id}
                store={store}
                imageSrc={store.avatarUrl || STORE_FALLBACK_IMAGE}
              />
            ))}
          </DragScrollRow>
        )}
      </div>
    </section>
  );
}
