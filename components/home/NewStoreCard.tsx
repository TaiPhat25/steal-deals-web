import Image from "next/image";
import Link from "next/link";
import type { StoreProfile } from "@/components/stores/store-profile-data";
import {
  shouldUseUnoptimizedImage,
  STORE_FALLBACK_IMAGE,
} from "@/lib/image-assets";

export type NewStore = StoreProfile;

export default function NewStoreCard({ store }: { store: NewStore }) {
  const storeHref = `/stores/${encodeURIComponent(store.id)}`;
  const productCount = store.surpriseBags.length;
  const storeImage = store.avatarUrl || STORE_FALLBACK_IMAGE;

  return (
    <article className="new-store-card">
      <Link href={storeHref} className="new-store-card__media" aria-label={`View ${store.name}`}>
        <Image
          src={storeImage}
          width={300}
          height={200}
          sizes="(max-width: 575px) 78vw, (max-width: 991px) 40vw, (max-width: 1199px) 30vw, 228px"
          alt={`${store.name} storefront`}
          unoptimized={shouldUseUnoptimizedImage(storeImage)}
        />
        <span className="new-store-card__badge">{store.isVerify ? "Verified" : "New store"}</span>
      </Link>
      <div className="new-store-card__body">
        <p className="new-store-card__category">{store.isActive ? "Open for pickup" : "Inactive"}</p>
        <h3 className="new-store-card__title">
          <Link href={storeHref}>{store.name}</Link>
        </h3>
        <p className="new-store-card__description">{store.description}</p>
        <dl className="new-store-card__details">
          <div>
            <dt>Rating</dt>
            <dd>{store.ratingScore.toFixed(1)}</dd>
          </div>
          <div>
            <dt>Available</dt>
            <dd>
              {productCount} {productCount === 1 ? "bag" : "bags"}
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
