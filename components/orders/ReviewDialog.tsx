"use client";

import { useRef, useState, type FormEvent } from "react";
import { useDialogFocusTrap } from "@/components/login/use-dialog-focus-trap";
import { createReview } from "@/lib/api/store";
import type { OrderItemResponse } from "@/lib/api/dashboard-types";

export default function ReviewDialog({
  accessToken,
  orderId,
  item,
  onClose,
  onSubmitted,
}: {
  accessToken: string;
  orderId: string;
  item: OrderItemResponse;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useDialogFocusTrap({
    dialogRef,
    initialFocusSelector: ".review-dialog__close",
    onEscape: onClose,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await createReview(accessToken, {
        orderId,
        bagId: item.bagId,
        ratingScore,
        comment: comment.trim() || null,
      });
      onSubmitted();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to submit your review.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="modal-backdrop fade show" aria-hidden="true" />
      <div
        ref={dialogRef}
        className="modal fade show review-dialog-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-dialog-title"
        tabIndex={-1}
        style={{ display: "block" }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content review-dialog">
            <button
              type="button"
              className="review-dialog__close"
              onClick={onClose}
              aria-label="Close review dialog"
            >
              <span aria-hidden="true">&times;</span>
            </button>

            <form onSubmit={handleSubmit}>
              <h2 id="review-dialog-title">Review {item.bagNameSnapshot}</h2>
              <fieldset className="review-dialog__rating">
                <legend>Rating</legend>
                <div role="group" aria-label="Choose a rating from 1 to 5">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      className={score <= ratingScore ? "is-selected" : ""}
                      aria-label={`${score} out of 5 stars`}
                      aria-pressed={score === ratingScore}
                      onClick={() => setRatingScore(score)}
                    >
                      <span aria-hidden="true">
                        {score <= ratingScore ? "\u2605" : "\u2606"}
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="review-dialog__comment">
                Comment <span>(optional)</span>
                <textarea
                  value={comment}
                  maxLength={1000}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Share your experience"
                  rows={4}
                />
              </label>

              {error ? <p className="alert alert-danger" role="alert">{error}</p> : null}

              <div className="review-dialog__actions">
                <button type="button" className="btn btn-outline-primary-2" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
