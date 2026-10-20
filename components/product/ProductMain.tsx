"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useCart } from "@/components/cart/CartProvider";
import AddToCartDialog from "@/components/cart/AddToCartDialog";
import DragScrollRow from "@/components/home/DragScrollRow";
import { BRAND_NAME } from "@/lib/brand";
import { listBagReviews } from "@/lib/api/store";
import type { StoreProfileResponse, StoreReviewResponse } from "@/lib/api/dashboard-types";
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
  storeProfile,
}: {
  bag: ListingBag;
  relatedBags: ListingBag[];
  storeProfile: StoreProfileResponse | null;
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"pickup" | "reviews">("pickup");
  const [reviews, setReviews] = useState<StoreReviewResponse[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(() => Boolean(bag.backendId));
  const [reviewsError, setReviewsError] = useState("");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const tabRefs = useRef<Record<"pickup" | "reviews", HTMLButtonElement | null>>({
    pickup: null,
    reviews: null,
  });
  const isAvailable = bag.remainingQuantity > 0;
  const storeAddress = [
    storeProfile?.address,
    storeProfile?.commune,
    storeProfile?.province,
  ].filter(Boolean).join(", ");
  // const wishlistHref = `/wishlist?bag=${encodeURIComponent(bag.slug)}`;
  const description = bag.description?.trim();

  useEffect(() => {
    if (!bag.backendId) return;

    let cancelled = false;

    void listBagReviews(bag.backendId, { page: 1, pageSize: 50 })
      .then((result) => {
        if (!cancelled) {
          setShowAllReviews(false);
          setReviews(
            [...result.items].sort(
              (first, second) =>
                new Date(second.createdAt).getTime() -
                new Date(first.createdAt).getTime(),
            ),
          );
          setReviewsError("");
        }
      })
      .catch(() => {
        if (!cancelled) setReviewsError("Reviews are temporarily unavailable.");
      })
      .finally(() => {
        if (!cancelled) setReviewsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bag.backendId]);

  function updateQuantity(value: number) {
    setQuantity(clampQuantity(value, bag.remainingQuantity));
  }

  function addToCart() {
    addItem(bag, quantity);
    setIsAdded(true);
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const tabOrder: Array<"pickup" | "reviews"> = ["pickup", "reviews"];
    const currentIndex = tabOrder.indexOf(activeTab);
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabOrder.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabOrder.length) % tabOrder.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabOrder.length - 1;
    if (nextIndex === currentIndex) return;

    event.preventDefault();
    const nextTab = tabOrder[nextIndex];
    setActiveTab(nextTab);
    tabRefs.current[nextTab]?.focus();
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

                  <div className="product-content product-detail-page__description">
                    <p>{description || "No description."}</p>
                  </div>

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
                            min={1}
                            max={bag.remainingQuantity}
                            step={1}
                            id="product-quantity"
                            aria-label={`Quantity of ${bag.name}`}
                            value={quantity}
                            disabled={!isAvailable}
                            onChange={(event) => {
                              const rawValue = event.target.value;
                              if (!/^\d*$/.test(rawValue) || rawValue === "") return;
                              updateQuantity(Number(rawValue));
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
                  <p className="sr-only" role="status" aria-live="polite">
                    {isAdded ? `${bag.name} was added to your cart.` : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="product-details-tab">
            <ul className="nav nav-pills justify-content-center" role="tablist" aria-label="Bag details">
              <li className="nav-item">
                <button
                  type="button"
                  ref={(element) => {
                    tabRefs.current.pickup = element;
                  }}
                  className={`nav-link${activeTab === "pickup" ? " active" : ""}`}
                  id="product-info-link"
                  role="tab"
                  aria-controls="product-info-tab"
                  aria-selected={activeTab === "pickup"}
                  tabIndex={activeTab === "pickup" ? 0 : -1}
                  onClick={() => setActiveTab("pickup")}
                  onKeyDown={handleTabKeyDown}
                >
                  Pickup information
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  ref={(element) => {
                    tabRefs.current.reviews = element;
                  }}
                  className={`nav-link${activeTab === "reviews" ? " active" : ""}`}
                  id="product-review-link"
                  role="tab"
                  aria-controls="product-review-tab"
                  aria-selected={activeTab === "reviews"}
                  tabIndex={activeTab === "reviews" ? 0 : -1}
                  onClick={() => setActiveTab("reviews")}
                  onKeyDown={handleTabKeyDown}
                >
                  Reviews
                </button>
              </li>
            </ul>

            <div className="tab-content">
              <div
                className={`tab-pane${activeTab === "pickup" ? " active show" : ""}`}
                id="product-info-tab"
                role="tabpanel"
                aria-labelledby="product-info-link"
                hidden={activeTab !== "pickup"}
              >
                <div className="product-desc-content">
                  <h3 className="product-detail-page__tab-heading">Pickup details</h3>
                  <p>
                    Collect this bag from {bag.storeName} during the listed
                    pickup window.
                  </p>
                  <dl className="product-detail-page__tab-details">
                    {storeAddress ? (
                      <div>
                        <dt>Store address</dt>
                        <dd>{storeAddress}</dd>
                      </div>
                    ) : null}
                    {storeProfile?.phone ? (
                      <div>
                        <dt>Store phone</dt>
                        <dd><a href={`tel:${storeProfile.phone}`}>{storeProfile.phone}</a></dd>
                      </div>
                    ) : null}
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
                className={`tab-pane${activeTab === "reviews" ? " active show" : ""}`}
                id="product-review-tab"
                role="tabpanel"
                aria-labelledby="product-review-link"
                hidden={activeTab !== "reviews"}
              >
                <div className="reviews">
                  <h3 className="product-detail-page__tab-heading">Reviews</h3>
                  {reviewsLoading && <p>Loading reviews...</p>}
                  {!reviewsLoading && reviewsError && <p>{reviewsError}</p>}
                  {!reviewsLoading && !reviewsError && reviews.length === 0 && (
                    <p>No reviews yet.</p>
                  )}
                  {!reviewsLoading && !reviewsError && reviews.length > 0 && (
                    <>
                      <div className="store-reviews__list">
                        {reviews.slice(0, showAllReviews ? reviews.length : 5).map((review) => (
                        <article className="store-review" key={review.id}>
                          <div className="store-review__header">
                            <h3>{review.buyerName}</h3>
                            <strong>{review.ratingScore}/5</strong>
                          </div>
                          <p>{review.comment ?? "This buyer did not leave a comment."}</p>
                          {review.storeReply ? (
                            <div className="store-review__reply">
                              <strong>Store reply</strong>
                              <p>{review.storeReply}</p>
                            </div>
                          ) : null}
                          <time dateTime={review.createdAt}>
                            {formatDate(review.createdAt)}
                          </time>
                        </article>
                        ))}
                      </div>
                      {reviews.length > 5 ? (
                        <button
                          type="button"
                          className="store-reviews__toggle"
                          aria-expanded={showAllReviews}
                          onClick={() => setShowAllReviews((current) => !current)}
                        >
                          {showAllReviews ? "Show less" : `Show more (${reviews.length - 5})`}
                        </button>
                      ) : null}
                    </>
                  )}
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
                  View more {bag.category} bags
                </Link>
              </div>

              <DragScrollRow
                className="drag-scroll-row product-detail-related-scroll-row"
                visibleItems={5}
                role="region"
                aria-label="Related surprise bags"
                tabIndex={0}
              >
                {relatedBags.map((relatedBag) => (
                  <SurpriseBagCard key={relatedBag.slug} bag={relatedBag} />
                ))}
              </DragScrollRow>
            </section>
          )}
        </div>
      </div>
      {isAdded && (
        <AddToCartDialog
          bag={bag}
          quantity={quantity}
          onClose={() => setIsAdded(false)}
        />
      )}
    </main>
  );
}
