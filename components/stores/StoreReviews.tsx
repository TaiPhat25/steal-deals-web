"use client";

import { useState } from "react";
import type { StoreReview } from "@/components/stores/store-types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function StoreReviews({ reviews }: { reviews: StoreReview[] }) {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const sortedReviews = [...reviews].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
  );
  const visibleReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, 5);

  return (
    <section className="store-detail-page__section store-reviews-section" aria-labelledby="store-reviews-title">
      <div className="container">
        <div className="store-detail-page__heading">
          <div>
            <p className="store-detail-page__eyebrow">Customer feedback</p>
            <h2 id="store-reviews-title" className="title mb-1">
              Store Reviews
            </h2>
            <p className="store-detail-page__description mb-0">
              Recent buyer reviews for this store.
            </p>
          </div>
        </div>

        {reviews.length ? (
          <div className="store-reviews__list">
            {visibleReviews.map((review) => (
              <article className="store-review" key={review.id}>
                <div className="store-review__header">
                  <h3>{review.buyerName}</h3>
                  <strong>{review.ratingScore.toFixed(1)}</strong>
                </div>
                <p>{review.comment ?? "This buyer did not leave a comment."}</p>
                {review.storeReply?.trim() ? (
                  <div className="store-review__reply">
                    <strong>Store reply</strong>
                    <p>{review.storeReply}</p>
                  </div>
                ) : null}
                <time dateTime={review.createdAt}>{formatDate(review.createdAt)}</time>
              </article>
            ))}
            {sortedReviews.length > 5 ? (
              <button
                type="button"
                className="store-reviews__toggle"
                aria-expanded={showAllReviews}
                onClick={() => setShowAllReviews((current) => !current)}
              >
                {showAllReviews ? "Show less" : `Show more (${sortedReviews.length - 5})`}
              </button>
            ) : null}
          </div>
        ) : (
          <div className="store-reviews__empty">
            <h3>No reviews yet</h3>
            <p>Reviews will appear here once buyers share feedback.</p>
          </div>
        )}
      </div>
    </section>
  );
}
