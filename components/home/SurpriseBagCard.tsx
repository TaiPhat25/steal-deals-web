import Link from "next/link";

export type SurpriseBag = {
  slug: string;
  imageSrc: string;
  imageAlt: string;
  name: string;
  storeName: string;
  category: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  pickupWindow: string;
  distance: string;
  remainingQuantity: number;
  availabilityLabel: string;
  storeSlug?: string;
};

function formatPrice(value: number) {
  return `${value.toLocaleString("en-US")} VND`;
}

export default function SurpriseBagCard({ bag }: { bag: SurpriseBag }) {
  const productHref = `/product?bag=${encodeURIComponent(bag.slug)}`;
  const categoryHref = `/products?category=${encodeURIComponent(bag.category)}`;

  return (
    <article className="surprise-bag-card">
      <div className="surprise-bag-card__media">
        <Link href={productHref} aria-label={`View ${bag.name}`}>
          <img src={bag.imageSrc} width="300" height="225" alt={bag.imageAlt} />
        </Link>
        <span className="surprise-bag-card__badge">Save {bag.discountPercent}%</span>
        <span className="surprise-bag-card__expiry">{bag.availabilityLabel}</span>
      </div>

      <div className="surprise-bag-card__body">
        <Link href={categoryHref} className="surprise-bag-card__category">
          {bag.category}
        </Link>
        <h3 className="surprise-bag-card__title">
          <Link href={productHref}>{bag.name}</Link>
        </h3>
        <div className="surprise-bag-card__store-row">
          <p className="surprise-bag-card__store">{bag.storeName}</p>
          {bag.storeSlug ? (
            <Link
              href={`/stores/${encodeURIComponent(bag.storeSlug)}`}
              className="surprise-bag-card__store-link"
            >
              View Store
            </Link>
          ) : null}
        </div>

        <div className="surprise-bag-card__pricing">
          <strong>{formatPrice(bag.salePrice)}</strong>
          <del>{formatPrice(bag.originalPrice)}</del>
        </div>

        <dl className="surprise-bag-card__details">
          <div>
            <dt>Pickup</dt>
            <dd>{bag.pickupWindow}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{bag.distance}</dd>
          </div>
          <div>
            <dt>Available</dt>
            <dd>{bag.remainingQuantity} bags left</dd>
          </div>
        </dl>

        <div className="surprise-bag-card__actions">
          <Link href={productHref} className="btn btn-outline-primary-2">
            View Details
          </Link>
          <Link href={`/cart?bag=${encodeURIComponent(bag.slug)}`} className="btn btn-primary">
            Add to Cart
          </Link>
        </div>

        <Link href={`/wishlist?bag=${encodeURIComponent(bag.slug)}`} className="surprise-bag-card__wishlist">
          <i className="icon-heart-o" aria-hidden="true"></i>
          Add to wishlist
        </Link>
      </div>
    </article>
  );
}
