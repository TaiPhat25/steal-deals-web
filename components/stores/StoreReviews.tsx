import type { StoreReview } from "@/components/stores/store-profile-data";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function StoreReviews({ reviews }: { reviews: StoreReview[] }) {
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
            {reviews.map((review) => (
              <article className="store-review" key={review.id}>
                <div className="store-review__header">
                  <h3>Buyer {review.buyerId.slice(0, 8)}</h3>
                  <strong>{review.ratingScore}.0</strong>
                </div>
                <p>{review.comment}</p>
                <time dateTime={review.createdAt}>{formatDate(review.createdAt)}</time>
              </article>
            ))}
          </div>
        ) : (
          <div className="store-products__empty">
            <h3>No reviews yet</h3>
            <p>Reviews will appear here once buyers share feedback.</p>
          </div>
        )}
      </div>
    </section>
  );
}
