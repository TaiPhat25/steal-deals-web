import Image from "next/image";
import type { StoreProfile } from "@/components/stores/store-types";
import { isBagAvailable } from "@/lib/bag-availability";
import {
  shouldUseUnoptimizedImage,
  STORE_FALLBACK_IMAGE,
} from "@/lib/image-assets";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function StoreInfo({ store }: { store: StoreProfile }) {
  const productCount = store.surpriseBags.filter((bag) =>
    isBagAvailable(bag),
  ).length;
  const reviewCount = store.reviewCount ?? store.storeReviews.length;
  const storeImage = store.avatarUrl || STORE_FALLBACK_IMAGE;
  const hasCoordinates = Number.isFinite(store.latitude) && Number.isFinite(store.longitude);
  const fullAddress = [store.address, store.commune, store.province]
    .filter(Boolean)
    .join(", ");
  const mapHref = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${store.latitude},${store.longitude}`)}`
    : null;

  return (
    <section className="store-detail-page__section store-info-section" aria-labelledby="store-info-title">
      <div className="container">
        <article className="store-info">
          <div className="store-info__media">
            <Image
              src={storeImage}
              width={570}
              height={380}
              sizes="(max-width: 767px) 100vw, 50vw"
              alt={store.avatarUrl ? `${store.name} storefront` : "Store image placeholder"}
              loading="eager"
              unoptimized={shouldUseUnoptimizedImage(storeImage)}
            />
          </div>

          <div className="store-info__body">
            <p className="store-detail-page__eyebrow">Store information</p>
            <h2 id="store-info-title" className="store-info__title">
              {store.name}
            </h2>
            <p className="store-info__description">
              {store.description || "This store has not added a description yet."}
            </p>

            <dl className="store-info__details">
              {fullAddress ? (
                <div>
                  <dt>Address</dt>
                  <dd>{fullAddress}</dd>
                </div>
              ) : null}
              {store.phone ? (
                <div>
                  <dt>Phone</dt>
                  <dd>{store.phone}</dd>
                </div>
              ) : null}
              <div className="store-info__details-item--bordered">
                <dt>Joined</dt>
                <dd>{formatDate(store.createdAt)}</dd>
              </div>
              <div className="store-info__details-item--bordered store-info__details-item--row-end">
                <dt>Status</dt>
                <dd>{store.isActive ? "Open" : "Closed"}</dd>
              </div>
            </dl>

            <div className="store-info__stats" aria-label="Store summary">
              <div>
                <strong>{store.ratingScore.toFixed(1)}</strong>
                <span>Rating</span>
              </div>
              <div>
                <strong>{productCount}</strong>
                <span>{productCount === 1 ? "Bag" : "Bags"}</span>
              </div>
              <div>
                <strong>{reviewCount}</strong>
                <span>{reviewCount === 1 ? "Review" : "Reviews"}</span>
              </div>
            </div>

            <div className="store-info__actions">
              <a href="#store-products" className="btn btn-primary">
                View Bags
              </a>
              {store.phone ? (
                <a href={`tel:${store.phone.replace(/\s/g, "")}`} className="btn btn-outline-primary-2">
                  Call Store
                </a>
              ) : null}
              {mapHref ? (
                <a
                  href={mapHref}
                  className="btn btn-outline-primary-2 store-info__map-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  View on Map
                </a>
              ) : null}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
