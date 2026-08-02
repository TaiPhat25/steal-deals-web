import Link from "next/link";

export type NewStore = {
  slug: string;
  imageSrc: string;
  imageAlt: string;
  name: string;
  category: string;
  description: string;
  distance: string;
  pickupWindow: string;
  statusLabel: string;
};

export default function NewStoreCard({ store }: { store: NewStore }) {
  const storeHref = `/category?store=${encodeURIComponent(store.slug)}`;

  return (
    <article className="new-store-card">
      <Link href={storeHref} className="new-store-card__media" aria-label={`View ${store.name}`}>
        <img src={store.imageSrc} width="300" height="200" alt={store.imageAlt} />
        <span className="new-store-card__badge">{store.statusLabel}</span>
      </Link>
      <div className="new-store-card__body">
        <p className="new-store-card__category">{store.category}</p>
        <h3 className="new-store-card__title">
          <Link href={storeHref}>{store.name}</Link>
        </h3>
        <p className="new-store-card__description">{store.description}</p>
        <dl className="new-store-card__details">
          <div>
            <dt>Location</dt>
            <dd>{store.distance}</dd>
          </div>
          <div>
            <dt>Pickup</dt>
            <dd>{store.pickupWindow}</dd>
          </div>
        </dl>
        <Link href={storeHref} className="btn btn-outline-primary-2 new-store-card__action">
          View Store
        </Link>
      </div>
    </article>
  );
}
