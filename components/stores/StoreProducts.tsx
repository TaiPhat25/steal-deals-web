"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import DragScrollRow from "@/components/home/DragScrollRow";
import SurpriseBagCard, { type SurpriseBag } from "@/components/home/SurpriseBagCard";
import {
  formatPickupWindow,
  getPickupAvailabilityLabel,
  PRODUCT_LISTING_IMAGE,
} from "@/components/products/product-listing-data";
import { isBagAvailable } from "@/lib/bag-availability";
import type { StoreProfile, StoreSurpriseBag } from "@/components/stores/store-types";

function toCardBag(store: StoreProfile, bag: StoreSurpriseBag): SurpriseBag {
  const category = bag.categories[0]?.name ?? "Surprise Bag";
  const discountPercent = bag.originalPrice > 0
    ? Math.round(((bag.originalPrice - bag.salePrice) / bag.originalPrice) * 100)
    : 0;

  return {
    backendId: bag.id,
    storeId: store.id,
    slug: bag.id,
    imageSrc: bag.imageUrl || PRODUCT_LISTING_IMAGE,
    imageAlt: bag.name,
    name: bag.name,
    storeName: store.name,
    category,
    originalPrice: bag.originalPrice,
    salePrice: bag.salePrice,
    discountPercent,
    pickupWindow: formatPickupWindow(bag.pickupStartTime, bag.pickupEndTime),
    distance: "Store pickup",
    remainingQuantity: bag.quantityRemaining,
    availabilityLabel: getPickupAvailabilityLabel(bag.pickupStartTime),
    storeSlug: store.id,
  };
}

export default function StoreProducts({ store }: { store: StoreProfile }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const activeProducts = useMemo(
    () => store.surpriseBags
      .filter((bag) => isBagAvailable(bag))
      .sort(
        (first, second) =>
          new Date(first.pickupEndTime).getTime() -
          new Date(second.pickupEndTime).getTime(),
      ),
    [store.surpriseBags],
  );
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          activeProducts.flatMap((bag) =>
            bag.categories.map((category) => category.name),
          ),
        ),
      ).sort((first, second) => first.localeCompare(second)),
    [activeProducts],
  );
  const filteredProducts = useMemo(
    () => selectedCategory === "all"
      ? activeProducts
      : activeProducts.filter((bag) =>
          bag.categories.some((category) => category.name === selectedCategory),
        ),
    [activeProducts, selectedCategory],
  );

  return (
    <section
      className="store-detail-page__section store-products-section"
      id="store-products"
      aria-labelledby="store-products-title"
    >
      <div className="container">
        <div className="store-detail-page__heading">
          <div>
            <p className="store-detail-page__eyebrow">Available surprise bags</p>
            <h2 id="store-products-title" className="title mb-1">
              Bags From {store.name}
            </h2>
            <div className="store-products__description-row">
              <label className="store-products__filter">
                <span>Category</span>
                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  aria-label="Filter surprise bags by category"
                >
                  <option value="all">All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className="store-products__controls">
            <Link href={`/products?store=${encodeURIComponent(store.id)}`} className="store-detail-page__view-all">
              View in marketplace
              <i className="icon-angle-right" aria-hidden="true"></i>
            </Link>
          </div>
        </div>

        {filteredProducts.length ? (
          <DragScrollRow
            key={selectedCategory}
            className="drag-scroll-row store-products-scroll-row"
            visibleItems={5}
            loop={filteredProducts.length > 5}
            keyboardNavigation
            snap
            role="region"
            aria-label={`${store.name} surprise bags`}
            tabIndex={0}
          >
            {filteredProducts.map((bag) => (
              <SurpriseBagCard key={bag.id} bag={toCardBag(store, bag)} />
            ))}
          </DragScrollRow>
        ) : activeProducts.length ? (
          <div className="store-products__empty">
            <h3>No bags in this category</h3>
            <p>Choose another category to see this store&apos;s available bags.</p>
            <button
              type="button"
              className="btn btn-outline-primary-2"
              onClick={() => setSelectedCategory("all")}
            >
              Show all bags
            </button>
          </div>
        ) : (
          <div className="store-products__empty">
            <h3>No bags available</h3>
            <p>This store does not have active surprise bags right now.</p>
            <Link href="/products" className="btn btn-outline-primary-2">
              Browse all bags
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
