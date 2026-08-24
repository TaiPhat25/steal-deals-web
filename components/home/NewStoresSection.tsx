"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listBags, listStores } from "@/lib/api/store";
import { mapStoreResponse } from "@/components/stores/store-api-mappers";
import { newStoreProfiles, type StoreProfile } from "@/components/stores/store-profile-data";
import DragScrollRow from "./DragScrollRow";
import NewStoreCard from "./NewStoreCard";

const STORE_LISTING_IMAGE = "/assets/images/demos/demo-28/banners/store.jpg";

export default function NewStoresSection() {
  const [stores, setStores] = useState<StoreProfile[]>(newStoreProfiles);

  useEffect(() => {
    let active = true;

    Promise.all([listStores(), listBags()])
      .then(([storesResponse, bagsResponse]) => {
        if (!active) return;

        const activeStores = storesResponse
          .filter((store) => store.isActive)
          .map((store) => mapStoreResponse(store, bagsResponse))
          .sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));

        if (activeStores.length > 0) {
          setStores(activeStores.slice(0, 10));
        }
      })
      .catch(() => {
        // keep fallback newStoreProfiles
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="new-stores-section py-5" aria-labelledby="new-stores-title">
      <div className="container">
        <div className="new-stores-section__heading">
          <div>
            <p className="new-stores-section__eyebrow">Discover local businesses</p>
            <h2 id="new-stores-title" className="title mb-1">
              New on StealDeals
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

        <DragScrollRow className="drag-scroll-row new-stores-scroll-row" visibleItems={5}>
          {stores.map((store) => (
            <NewStoreCard
              key={store.id}
              store={store}
              imageSrc={store.avatarUrl || STORE_LISTING_IMAGE}
            />
          ))}
        </DragScrollRow>
      </div>
    </section>
  );
}
