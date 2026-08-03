import type { StoreProfile } from "@/components/stores/store-profile-data";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatCoordinate(value: number) {
  return value.toFixed(4);
}

export default function StoreInfo({ store }: { store: StoreProfile }) {
  const productCount = store.surpriseBags.length;
  const reviewCount = store.storeReviews.length;

  return (
    <section className="store-detail-page__section store-info-section" aria-labelledby="store-info-title">
      <div className="container">
        <article className="store-info">
          <div className="store-info__media">
            {store.avatarUrl ? (
              <img src={store.avatarUrl} width="570" height="380" alt={`${store.name} storefront`} />
            ) : (
              <div className="store-info__placeholder" aria-hidden="true">
                {store.name.charAt(0)}
              </div>
            )}
            <span className="store-info__badge">{store.isVerify ? "Verified Store" : "New Store"}</span>
          </div>

          <div className="store-info__body">
            <p className="store-detail-page__eyebrow">Store information</p>
            <h2 id="store-info-title" className="store-info__title">
              {store.name}
            </h2>
            {store.description ? <p className="store-info__description">{store.description}</p> : null}

            <dl className="store-info__details">
              {store.address ? (
                <div>
                  <dt>Address</dt>
                  <dd>{store.address}</dd>
                </div>
              ) : null}
              {store.phone ? (
                <div>
                  <dt>Phone</dt>
                  <dd>{store.phone}</dd>
                </div>
              ) : null}
              <div>
                <dt>Joined</dt>
                <dd>{formatDate(store.createdAt)}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{store.isActive ? "Active" : "Inactive"}</dd>
              </div>
              <div>
                <dt>Coordinates</dt>
                <dd>
                  {formatCoordinate(store.latitude)}, {formatCoordinate(store.longitude)}
                </dd>
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
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
