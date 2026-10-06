import Image from "next/image";
import Link from "next/link";
import type { StoreProfile } from "@/components/stores/store-profile-data";
import { getAvailableBagQuantity } from "@/components/stores/store-listing-data";
import {
  shouldUseUnoptimizedImage,
  STORE_FALLBACK_IMAGE,
} from "@/lib/image-assets";

export type NewStore = StoreProfile;

const DEFAULT_STORE_IMAGE_SIZES = "(max-width: 575px) 78vw, (max-width: 991px) 40vw, (max-width: 1199px) 30vw, 228px";

export default function NewStoreCard({
  store,
  imageSizes = DEFAULT_STORE_IMAGE_SIZES,
}: {
  store: NewStore;
  imageSizes?: string;
}) {
  const storeHref = `/stores/${encodeURIComponent(store.id)}`;
  const availableBagQuantity = getAvailableBagQuantity(store.surpriseBags);
  const reviewCount = store.reviewCount ?? store.storeReviews.length;
  const storeImage = store.avatarUrl || STORE_FALLBACK_IMAGE;
  const availabilityLabel = !store.isActive
    ? "Currently unavailable"
    : availableBagQuantity > 0
      ? "Bags available"
      : "No bags available";

  return (
    <article className="new-store-card">
      <Link href={storeHref} className="new-store-card__media" aria-label={`View ${store.name}`}>
        <Image
          src={storeImage}
          width={300}
          height={200}
          sizes={imageSizes}
          alt={`${store.name} storefront`}
          unoptimized={shouldUseUnoptimizedImage(storeImage)}
        />
      </Link>
      <div className="new-store-card__body">
        <p className="new-store-card__category">{availabilityLabel}</p>
        <h3 className="new-store-card__title">
          <Link href={storeHref}>{store.name}</Link>
        </h3>
        <p className="new-store-card__description">{store.description}</p>
        <dl className="new-store-card__details">
          <div>
            <dt>Rating</dt>
            <dd>
              {reviewCount > 0
                ? `${store.ratingScore.toFixed(1)} (${reviewCount})`
                : "No reviews"}
            </dd>
          </div>
          <div>
            <dt>Available</dt>
            <dd>
              {availableBagQuantity} {availableBagQuantity === 1 ? "bag" : "bags"}
            </dd>
          </div>
        </dl>
        <Link href={storeHref} className="btn btn-outline-primary-2 new-store-card__action">
          View Store
        </Link>
      </div>
    </article>
  );
}
