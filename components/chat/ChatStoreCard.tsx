"use client";

import Image from "next/image";
import Link from "next/link";
import type { StoreProfileResponse } from "@/lib/api/dashboard-types";
import {
  STORE_FALLBACK_IMAGE,
  shouldUseUnoptimizedImage,
} from "@/lib/image-assets";

export default function ChatStoreCard({ store }: { store: StoreProfileResponse }) {
  const avatarSrc = store.avatarUrl || STORE_FALLBACK_IMAGE;
  const storeHref = `/stores/${encodeURIComponent(store.id)}`;
  const displayAddress =
    store.address ||
    [store.commune, store.province].filter(Boolean).join(", ") ||
    "Local Partner Store";
  const reviewCount = store.reviewCount ?? 0;

  return (
    <article className="chat-card chat-card--store">
      <div className="chat-card__media">
        <Link href={storeHref} aria-label={`View ${store.name}`}>
          <Image
            src={avatarSrc}
            alt={store.name}
            width={240}
            height={150}
            className="chat-card__image"
            unoptimized={shouldUseUnoptimizedImage(avatarSrc)}
          />
        </Link>
        {store.distanceKm != null && Number.isFinite(store.distanceKm) && (
          <span className="chat-card__distance">
            <i className="las la-map-marker-alt" aria-hidden="true"></i>{" "}
            {store.distanceKm.toFixed(1)} km
          </span>
        )}
      </div>

      <div className="chat-card__body">
        <div className="chat-card__rating">
          <i className="las la-star text-warning" aria-hidden="true"></i>
          {reviewCount > 0 ? (
            <span>
              <strong>{store.ratingScore.toFixed(1)}</strong> ({reviewCount})
            </span>
          ) : (
            <span>No reviews</span>
          )}
        </div>

        <h4 className="chat-card__title">
          <Link href={storeHref}>{store.name}</Link>
        </h4>

        <p className="chat-card__address">{displayAddress}</p>

        <div className="chat-card__actions">
          <Link href={storeHref} className="btn btn-outline-primary-2 btn-sm w-100 text-center">
            View Store
          </Link>
        </div>
      </div>
    </article>
  );
}
