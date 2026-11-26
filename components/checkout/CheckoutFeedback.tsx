"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDialogFocusTrap } from "@/components/login/use-dialog-focus-trap";
import type { OrderResponse } from "@/lib/api/dashboard-types";
import type { CheckoutFailure } from "./checkout-results";

type CheckoutFeedbackProps = {
  orders: OrderResponse[];
  failures: CheckoutFailure[];
};

function formatRestriction(value?: string) {
  if (!value || !Number.isFinite(new Date(value).getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function failureMessage(failure: CheckoutFailure) {
  if (failure.reasonCode === "PendingOrderLimitReached") {
    const limit = failure.maxPendingOrders ?? 1;
    return `You can have up to ${limit} unpaid ${limit === 1 ? "order" : "orders"} at a time. Please pay your existing ${limit === 1 ? "order" : "orders"} first.`;
  }
  if (failure.reasonCode === "TrustScorePurchaseSuspended") {
    return "Ordering is temporarily paused due to missed pickups.";
  }
  if (failure.requiresOrderCheck) {
    return "We couldn't confirm this order. Check your orders before trying again.";
  }
  if (failure.reasonCode === "DependencyUnavailable") {
    return "Checkout is temporarily unavailable. Please try again shortly.";
  }
  return "Unable to place this order. Please check your cart and try again.";
}

function CreatedOrders({ orders }: { orders: OrderResponse[] }) {
  if (orders.length === 0) return null;

  return (
    <section className="checkout-feedback-orders" aria-label="Created orders">
      <strong>Your orders are ready for payment</strong>
      <p>Choose an order to pay.</p>
      <div>
        {orders.map((order) => (
          <Link key={order.id} href={`/checkout/payment-processing?orderId=${encodeURIComponent(order.id)}`}>
            Pay for {order.storeNameSnapshot} &middot; #{order.id.slice(0, 8)}
          </Link>
        ))}
      </div>
    </section>
  );
}

function CheckoutNotice({ orders, failures, onClose }: CheckoutFeedbackProps & { onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const needsOrderCheck = failures.some((failure) => failure.requiresOrderCheck);
  const showOrdersLink = orders.length > 0 || needsOrderCheck
    || failures.some((failure) => failure.reasonCode === "PendingOrderLimitReached");
  const allPending = failures.every((failure) => failure.reasonCode === "PendingOrderLimitReached");
  const allSuspended = failures.every((failure) => failure.reasonCode === "TrustScorePurchaseSuspended");
  const title = orders.length > 0 ? "Some orders need your attention"
    : allPending ? "Pending order limit reached"
      : allSuspended ? "Ordering is temporarily paused"
        : needsOrderCheck ? "Please check your orders"
          : "We couldn't place your order";

  // A user-wide policy can reject several stores with exactly the same explanation.
  const groups = new Map<string, { failure: CheckoutFailure; stores: string[] }>();
  for (const failure of failures) {
    const key = JSON.stringify([failure.reasonCode, failure.message, failure.score,
      failure.restrictedUntilUtc, failure.maxPendingOrders, failure.requiresOrderCheck]);
    const group = groups.get(key);
    if (group) group.stores.push(failure.storeName);
    else groups.set(key, { failure, stores: [failure.storeName] });
  }

  useDialogFocusTrap({
    dialogRef,
    initialFocusSelector: ".checkout-notice__close",
    onEscape: onClose,
  });

  return createPortal(
    <>
      <div className="modal-backdrop fade show checkout-notice-backdrop" aria-hidden="true" />
      <div
        ref={dialogRef}
        className="modal fade show checkout-notice-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        style={{ display: "block" }}
        onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content checkout-notice">
            <button type="button" className="checkout-notice__close" onClick={onClose} aria-label="Close checkout notice">
              <span aria-hidden="true">&times;</span>
            </button>
            <header className="checkout-notice__header">
              <span className="checkout-notice__icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.3 4.2 2.7 17.4A2 2 0 0 0 4.4 20h15.2a2 2 0 0 0 1.7-2.6L13.7 4.2a2 2 0 0 0-3.4 0Z" />
                  <path d="M12 9v4m0 3h.01" />
                </svg>
              </span>
              <p className="checkout-notice__eyebrow">Checkout notice</p>
              <h2 id={titleId}>{title}</h2>

            </header>
            <div id={descriptionId} className="checkout-notice__body">
              {Array.from(groups.entries()).map(([key, { failure, stores }]) => {
                const until = formatRestriction(failure.restrictedUntilUtc);
                return (
                  <section key={key} className="checkout-notice__reason">
                    <p className="checkout-notice__stores">{stores.join(" · ")}</p>
                    <p className="checkout-notice__message">{failureMessage(failure)}</p>
                    {failure.score !== undefined && <p className="checkout-notice__restriction">Trust score: <strong>{failure.score}/100</strong></p>}

                    {until && <p className="checkout-notice__restriction">Try again after <strong>{until}</strong> (local time).</p>}
                  </section>
                );
              })}

              <CreatedOrders orders={orders} />
            </div>
            <footer className="checkout-notice__actions">
              <button type="button" className={`btn ${showOrdersLink ? "btn-outline-primary-2" : "btn-primary"}`} onClick={onClose}>
                {showOrdersLink ? "Back to checkout" : "Got it"}
              </button>
              {showOrdersLink && <Link className="btn btn-primary" href="/orders" onClick={onClose}>View my orders</Link>}
            </footer>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

export default function CheckoutFeedback({ orders, failures }: CheckoutFeedbackProps) {
  const [dismissedFailures, setDismissedFailures] = useState<CheckoutFailure[] | null>(null);
  // Each submit supplies a new result array; a dismissed notice stays closed during cart timers/refreshes.
  const isOpen = failures.length > 0 && dismissedFailures !== failures;

  if (orders.length === 0 && failures.length === 0) return null;

  return (
    <section aria-label="Checkout results" className="checkout-feedback">
      <CreatedOrders orders={orders} />
      {failures.length > 0 && !isOpen && (
        <button type="button" className="checkout-feedback__reopen" onClick={() => setDismissedFailures(null)}>
          View checkout notice <span aria-hidden="true">&rarr;</span>
        </button>
      )}
      {isOpen && <CheckoutNotice orders={orders} failures={failures} onClose={() => setDismissedFailures(failures)} />}
    </section>
  );
}
