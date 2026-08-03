import Link from "next/link";
import type { StoreProfile } from "@/components/stores/store-profile-data";

export type NewStore = StoreProfile;

export default function NewStoreCard({ store }: { store: NewStore }) {
  const storeHref = `/stores/${encodeURIComponent(store.id)}`;
  const productCount = store.surpriseBags.length;

  return (
    <article className="new-store-card">
      <Link href={storeHref} className="new-store-card__media" aria-label={`View ${store.name}`}>
        {store.avatarUrl ? (
          <img src={store.avatarUrl} width="300" height="200" alt={`${store.name} storefront`} />
        ) : (
          <span className="new-store-card__placeholder" aria-hidden="true">
            {store.name.charAt(0)}
          </span>
        )}
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
