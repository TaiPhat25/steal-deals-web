"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { BRAND_NAME } from "@/lib/brand";
import SurpriseBagCard from "@/components/home/SurpriseBagCard";
import type { ListingBag } from "@/components/products/product-listing-data";

/*
const galleryImagesBySlug: Record<string, string[]> = {
  "bakery-breakfast-box": [
    "/assets/images/demos/demo-28/flash/1.jpg",
    "/assets/images/demos/demo-28/flash/7.jpg",
    "/assets/images/demos/demo-28/banners/banner-1.jpg",
  ],
  "bakery-mix-bag": [
    "/assets/images/demos/demo-28/flash/7.jpg",
    "/assets/images/demos/demo-28/flash/1.jpg",
    "/assets/images/demos/demo-28/banners/banner-1.jpg",
  ],
  "fresh-produce-box": [
    "/assets/images/demos/demo-28/flash/2.jpg",
    "/assets/images/demos/demo-28/flash/10.jpg",
    "/assets/images/demos/demo-28/banners/banner-3.jpg",
  ],
  "vegetable-harvest-box": [
    "/assets/images/demos/demo-28/flash/10.jpg",
    "/assets/images/demos/demo-28/flash/2.jpg",
    "/assets/images/demos/demo-28/banners/banner-3.jpg",
  ],
  "seafood-family-box": [
    "/assets/images/demos/demo-28/flash/3.jpg",
    "/assets/images/demos/demo-28/flash/8.jpg",
    "/assets/images/demos/demo-28/banners/5.jpg",
  ],
  "seafood-weekend-box": [
    "/assets/images/demos/demo-28/flash/8.jpg",
    "/assets/images/demos/demo-28/flash/3.jpg",
    "/assets/images/demos/demo-28/banners/5.jpg",
  ],
};
*/

type StaticReview = {
  author: string;
  rating: number;
  comment: string;
  date: string;
};

const staticReviewsBySlug: Record<string, StaticReview[]> = {
  "bakery-breakfast-box": [
    {
      author: "Minh N.",
      rating: 5,
      comment: "The bakery bag had a generous mix and pickup was quick.",
      date: "July 30, 2026",
    },
  ],
  "bakery-mix-bag": [
    {
      author: "Lan T.",
      rating: 5,
      comment: "Good variety and a convenient pickup window.",
      date: "July 31, 2026",
    },
  ],
  "fresh-produce-box": [
    {
      author: "Duy P.",
      rating: 5,
      comment: "Fresh vegetables with clear pickup instructions.",
      date: "July 28, 2026",
    },
  ],
  "seafood-family-box": [
    {
      author: "Huy T.",
      rating: 4,
      comment: "Great value for seafood. The pickup window was accurate.",
      date: "July 29, 2026",
    },
  ],
};

const productDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh",
});
const productCalendarDateFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh",
});
const productTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Ho_Chi_Minh",
});

function formatPrice(value: number) {
  return `${value.toLocaleString("en-US")} VND`;
}

function clampQuantity(value: number, maximum: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(maximum, Math.max(1, Math.floor(value)));
}

function formatDate(value: string) {
  return productDateFormatter.format(new Date(value));
}

function formatTime(value: string) {
  return productTimeFormatter.format(new Date(value));
}

function formatPickupRange(bag: ListingBag) {
  const start = new Date(bag.pickupStartTime);
  const end = new Date(bag.pickupEndTime);
  const sameDay =
    productCalendarDateFormatter.format(start) ===
    productCalendarDateFormatter.format(end);

  if (sameDay) {
    return `${formatDate(bag.pickupStartTime)}, ${formatTime(bag.pickupStartTime)} - ${formatTime(bag.pickupEndTime)}`;
  }

  return `${formatDate(bag.pickupStartTime)}, ${formatTime(bag.pickupStartTime)} - ${formatDate(bag.pickupEndTime)}, ${formatTime(bag.pickupEndTime)}`;
}

function formatAvailability(bag: ListingBag) {
  return `${bag.remainingQuantity} ${bag.remainingQuantity === 1 ? "bag" : "bags"} left`;
}

export default function ProductMain({
  bag,
  relatedBags,
}: {
  bag: ListingBag;
  relatedBags: ListingBag[];
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const isAvailable = bag.remainingQuantity > 0;
  const reviews = staticReviewsBySlug[bag.slug] ?? [
    {
      author: "Local shopper",
      rating: 5,
      comment: `Good value from ${bag.storeName} with a straightforward pickup experience.`,
      date: "July 31, 2026",
    },
  ];
  // const wishlistHref = `/wishlist?bag=${encodeURIComponent(bag.slug)}`;
  const description = bag.description?.trim();

  function updateQuantity(value: number) {
    setQuantity(clampQuantity(value, bag.remainingQuantity));
  }

  function addToCart() {
    addItem(bag, quantity);
    router.push("/newcart");
  }

  return (
    <main className="main product-detail-page">
      <nav aria-label="Breadcrumb" className="breadcrumb-nav border-0 mb-0">
        <div className="container d-flex align-items-center">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/products">Surprise Bags</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {bag.name}
            </li>
          </ol>
        </div>
      </nav>

      <div className="page-content">
        <div className="container">
          <div className="product-details-top">
            <div className="row">
              <div className="col-md-6">
                <div className="product-gallery product-gallery-single">
                  <figure className="product-main-image product-detail-page__main-image">
                    <Image
                      src={bag.imageSrc}
                      alt={bag.imageAlt}
                      width={900}
                      height={675}
                      sizes="(max-width: 767px) 100vw, 50vw"
                      loading="eager"
                    />
                    <span className="product-detail-page__discount-badge">
                      Save {bag.discountPercent}%
                    </span>
                  </figure>
                  {/*
                  Multiple-image gallery is deferred until the backend supports
                  uploading and returning multiple images for one bag.
                  */}
                </div>
              </div>

              <div className="col-md-6">
                <div className="product-details">
                  <p className="product-detail-page__eyebrow">
                    Near-expiry surprise bag
                  </p>
                  <h1 className="product-title">{bag.name}</h1>

                  <div className="product-price product-detail-page__price">
                    <span>{formatPrice(bag.salePrice)}</span>
                    <del>{formatPrice(bag.originalPrice)}</del>
                  </div>

                  {description && (
                    <div className="product-content">
                      <p>{description}</p>
                    </div>
                  )}

                  <dl className="product-detail-page__summary">
                    <div>
                      <dt>Store</dt>
                      <dd>
                        {bag.storeId || bag.storeSlug ? (
                          <Link
                            href={`/stores/${encodeURIComponent(bag.storeId ?? bag.storeSlug ?? "")}`}
                          >
                            {bag.storeName}
                          </Link>
                        ) : (
                          bag.storeName
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>Category</dt>
                      <dd className="product-detail-page__categories">
                        <Link
                          href={`/products?category=${encodeURIComponent(bag.category)}`}
                        >
                          {bag.category}
                        </Link>
                      </dd>
                    </div>
                    <div>
                      <dt>Pickup window</dt>
                      <dd>{formatPickupRange(bag)}</dd>
                    </div>
                    <div>
                      <dt>Expires</dt>
                      <dd>
                        {formatDate(bag.expiryDate)},{" "}
                        {formatTime(bag.expiryDate)}
                      </dd>
                    </div>
                    <div className="product-detail-page__quantity-fact">
                      <dt>Quantity</dt>
                      <dd>
                        <div className="cart-line__quantity product-details-quantity">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${bag.name}`}
                            onClick={() => updateQuantity(quantity - 1)}
                            disabled={!isAvailable || quantity <= 1}
                          >
                            -
                          </button>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            id="product-quantity"
                            aria-label={`Quantity of ${bag.name}`}
                            value={quantity}
                            disabled={!isAvailable}
                            onChange={(event) => {
                              const digits = event.target.value.replace(/\D/g, "");
                              updateQuantity(Number(digits || 1));
                            }}
                          />
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${bag.name}`}
                            onClick={() => updateQuantity(quantity + 1)}
                            disabled={
                              !isAvailable || quantity >= bag.remainingQuantity
                            }
                          >
                            +
                          </button>
                        </div>
                      </dd>
                    </div>
                    <div className="product-detail-page__availability-fact">
                      <dt>Availability</dt>
                      <dd>{formatAvailability(bag)}</dd>
                    </div>
                  </dl>

                  <div className="product-details-action">
                    {isAvailable ? (
                      <button
                        type="button"
                        onClick={addToCart}
                        className="btn-outline-primary-2 btn-product btn-cart product-detail-page__cart"
                      >
                        <span>Add to cart</span>
                      </button>
                    ) : (
                      <span
                        className="btn-product btn-cart disabled"
                        aria-disabled="true"
                      >
                        <span>Sold out</span>
                      </span>
                    )}
                    {/* Wishlist is intentionally disabled for near-expiry surprise bags. */}
                    {/*
                    <div className="details-action-wrapper">
                      <Link href={wishlistHref} className="btn-product btn-wishlist"><span>Add to Wishlist</span></Link>
                    </div>
                    */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="product-details-tab">
            <ul className="nav nav-pills justify-content-center" role="tablist">
              <li className="nav-item">
                <a
                  className="nav-link active"
                  id="product-desc-link"
                  data-toggle="tab"
                  href="#product-desc-tab"
                  role="tab"
                  aria-controls="product-desc-tab"
                  aria-selected="true"
                >
                  Bag information
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  id="product-info-link"
                  data-toggle="tab"
                  href="#product-info-tab"
                  role="tab"
                  aria-controls="product-info-tab"
                  aria-selected="false"
                >
                  Pickup information
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  id="product-review-link"
                  data-toggle="tab"
                  href="#product-review-tab"
                  role="tab"
                  aria-controls="product-review-tab"
                  aria-selected="false"
                >
                  Reviews
                </a>
              </li>
            </ul>

            <div className="tab-content">
              <div
                className="tab-pane fade show active"
                id="product-desc-tab"
                role="tabpanel"
                aria-labelledby="product-desc-link"
              >
                <div className="product-desc-content">
                  <h3>About this surprise bag</h3>
                  <p>
                    This discounted bag helps {bag.storeName} sell good food
                    before it goes to waste. The exact contents are selected by
                    the store and may vary depending on the day&apos;s surplus.
                  </p>
                  <ul>
                    <li>Category: {bag.category}.</li>
                    <li>
                      Discount: {bag.discountPercent}% off the original value.
                    </li>
                    <li>{formatAvailability(bag)}.</li>
                  </ul>
                </div>
              </div>
              <div
                className="tab-pane fade"
                id="product-info-tab"
                role="tabpanel"
                aria-labelledby="product-info-link"
              >
                <div className="product-desc-content">
                  <h3>Pickup details</h3>
                  <p>
                    Collect this bag from {bag.storeName} during the listed
                    pickup window.
                  </p>
                  <dl className="product-detail-page__tab-details">
                    <div>
                      <dt>Pickup window</dt>
                      <dd>{formatPickupRange(bag)}</dd>
                    </div>
                    <div>
                      <dt>Expires</dt>
                      <dd>
                        {formatDate(bag.expiryDate)},{" "}
                        {formatTime(bag.expiryDate)}
                      </dd>
                    </div>
                    <div>
                      <dt>Availability</dt>
                      <dd>{formatAvailability(bag)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              <div
                className="tab-pane fade"
                id="product-review-tab"
                role="tabpanel"
                aria-labelledby="product-review-link"
              >
                <div className="reviews">
                  <h3>Reviews</h3>
                  <div className="store-reviews__list">
                    {reviews.map((review) => (
                      <article
                        className="store-review"
                        key={`${review.author}-${review.date}`}
                      >
                        <div className="store-review__header">
                          <h3>{review.author}</h3>
                          <strong>{review.rating}/5</strong>
                        </div>
                        <p>{review.comment}</p>
                        <time dateTime={review.date}>{review.date}</time>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {relatedBags.length > 0 && (
            <section
              className="product-detail-related"
              aria-labelledby="related-bags-title"
            >
              <div className="product-detail-section-heading">
                <div>
                  <p>More from {BRAND_NAME}</p>
                  <h2 id="related-bags-title">You may also like</h2>
                </div>
                <Link
                  href={`/products?category=${encodeURIComponent(bag.category)}`}
                >
                  View more {bag.category.toLowerCase()} bags
                </Link>
              </div>

              <div className="product-detail-page__related-grid">
                {relatedBags.map((relatedBag) => (
                  <div key={relatedBag.slug}>
                    <SurpriseBagCard bag={relatedBag} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
