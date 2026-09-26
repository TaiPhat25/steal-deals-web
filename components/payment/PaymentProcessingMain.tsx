"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  formatPaymentPrice,
  formatRemainingSeconds,
  getRemainingSeconds,
} from "@/components/payment/payment-view-utils";
import { ApiClientError } from "@/lib/api/client";
import { getTransactionByOrderId, type TransactionResponse } from "@/lib/api/payment";

const POLL_INTERVAL_MS = 1500;
const MAX_WAIT_MS = 120000;

function formatElapsedTime(milliseconds: number) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${String(rest).padStart(2, "0")}s`;
  }

  return `${seconds}s`;
}

export default function PaymentProcessingMain() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { accessToken } = useAuth();
  const [transaction, setTransaction] = useState<TransactionResponse | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [message, setMessage] = useState("Waiting for the payment gateway to prepare your checkout link.");
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [hasRedirected, setHasRedirected] = useState(false);
  const redirectedRef = useRef(false);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!accessToken || !orderId || redirectedRef.current) return;

    let cancelled = false;
    let timeoutId: number | undefined;
    const startedAt = Date.now();

    async function pollTransaction() {
      if (cancelled || !accessToken || !orderId || redirectedRef.current) return;

      const currentElapsedMs = Date.now() - startedAt;
      setElapsedMs(currentElapsedMs);

      try {
        const nextTransaction = await getTransactionByOrderId(accessToken, orderId);
        if (cancelled) return;

        setTransaction(nextTransaction);
        setError("");

        if (nextTransaction.gatewayRef) {
          window.localStorage.setItem(`vnpay-order:${nextTransaction.gatewayRef}`, orderId);
        }
        window.localStorage.setItem("vnpay-last-order-id", orderId);

        if (nextTransaction.status === "Pending" && nextTransaction.checkoutUrl) {
          const remainingSeconds = getRemainingSeconds(nextTransaction.expiresAt);

          if (remainingSeconds === null || remainingSeconds > 0) {
            redirectedRef.current = true;
            setHasRedirected(true);
            setMessage("Redirecting you to VNPAY.");
            window.location.href = nextTransaction.checkoutUrl;
            return;
          }
        }

        if (nextTransaction.status === "Success") {
          setMessage("Payment is already completed. Opening your order details.");
          window.location.replace(`/orders/${encodeURIComponent(orderId)}`);
          return;
        }

        if (["Failed", "Expired", "RefundPending", "Refunded", "RefundFailed"].includes(nextTransaction.status)) {
          setMessage("This payment attempt can no longer be used.");
          return;
        }
      } catch (requestError) {
        if (cancelled) return;

        if (requestError instanceof ApiClientError && requestError.status === 404) {
          setMessage("Your order is saved. Waiting for inventory reservation and payment creation.");
        } else {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to check the payment transaction.",
          );
        }
      }

      if (currentElapsedMs >= MAX_WAIT_MS) {
        setMessage("The order was created, but the payment gateway is taking longer than expected.");
        return;
      }

      timeoutId = window.setTimeout(pollTransaction, POLL_INTERVAL_MS);
    }

    void pollTransaction();

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [accessToken, orderId]);

  const remainingSeconds = getRemainingSeconds(transaction?.expiresAt ?? null, now);
  const canOpenOrder = Boolean(orderId);
  const isTimedOut = elapsedMs >= MAX_WAIT_MS && !hasRedirected;
  const elapsedLabel = formatElapsedTime(elapsedMs);
  const maxWaitLabel = formatElapsedTime(MAX_WAIT_MS);
  const isWaitingForRedirect =
    !isTimedOut
    && !hasRedirected
    && (!transaction || transaction.status === "Pending");
  const nextStepLabel = transaction
    ? transaction.status === "Pending"
      ? transaction.checkoutUrl
        ? "Redirecting to VNPAY"
        : "Waiting for VNPAY checkout"
      : "Review this order"
    : "Preparing VNPAY checkout";
  const checkoutLinkLabel = transaction
    ? transaction.status === "Pending"
      ? transaction.checkoutUrl
        ? "Ready"
        : "Still being created"
      : "No active checkout link"
    : "Creating secure link";
  const paymentWindowLabel = transaction?.status === "Pending" && transaction.checkoutUrl
    ? formatRemainingSeconds(remainingSeconds)
    : transaction
      ? "Not available"
      : "Starts once the link is ready";

  return (
    <main className="main payment-page">
      <nav aria-label="Breadcrumb" className="breadcrumb-nav border-0 mb-0">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link href="/">Home</Link></li>
            <li className="breadcrumb-item"><Link href="/orders">Order history</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Payment</li>
          </ol>
        </div>
      </nav>

      <div className="page-content">
        <div className="container">
          <section className="payment-result-card" aria-live="polite">
            <span className={`payment-result-card__icon is-pending${isWaitingForRedirect ? " is-spinning" : ""}`} aria-hidden="true">
              <i className="icon-refresh" />
            </span>
            <p>VNPAY payment</p>
            <h1>Preparing secure checkout</h1>
            <span>{message}</span>

            <div className="payment-processing-wait" role="status">
              <span className="payment-processing-wait__spinner" aria-hidden="true" />
              <div className="payment-processing-wait__copy">
                <strong>Waiting for VNPAY</strong>
                <span>Keep this page open. We will redirect you automatically when checkout is ready.</span>
              </div>
              <span className="payment-processing-wait__time">{elapsedLabel} / {maxWaitLabel}</span>
            </div>

            {orderId ? (
              <dl className="payment-facts">
                <div><dt>Order</dt><dd>Created and saved</dd></div>
                <div><dt>Next step</dt><dd>{nextStepLabel}</dd></div>
                {transaction ? (
                  <>
                    <div><dt>Total to pay</dt><dd>{formatPaymentPrice(transaction.amount)}</dd></div>
                    <div><dt>VNPAY link</dt><dd>{checkoutLinkLabel}</dd></div>
                    <div><dt>Payment window</dt><dd>{paymentWindowLabel}</dd></div>
                  </>
                ) : (
                  <div><dt>VNPAY link</dt><dd>{checkoutLinkLabel}</dd></div>
                )}
              </dl>
            ) : (
              <div className="alert alert-danger" role="alert">
                Missing order id. Please open this payment from your order details.
              </div>
            )}

            {error ? <div className="alert alert-danger" role="alert">{error}</div> : null}
            {isTimedOut && canOpenOrder ? (
              <div className="alert alert-warning" role="status">
                VNPAY is taking longer than expected. You can open the order details page and use the VNPAY payment link manually when it appears.
              </div>
            ) : null}

            <div className="payment-result-card__actions">
              {transaction?.checkoutUrl && transaction.status === "Pending" && remainingSeconds !== 0 ? (
                <a className="btn btn-primary" href={transaction.checkoutUrl}>Open VNPAY</a>
              ) : null}
              {canOpenOrder ? (
                <Link href={`/orders/${encodeURIComponent(orderId ?? "")}`} className="btn btn-outline-primary-2">
                  View order details
                </Link>
              ) : (
                <Link href="/orders" className="btn btn-outline-primary-2">Back to orders</Link>
              )}
            </div>

            {isTimedOut ? (
              <p className="payment-result-card__note">
                You can safely leave this page. The order detail page will keep checking and show the VNPAY link as soon as it is ready.
              </p>
            ) : (
              <p className="payment-result-card__note">
                You can wait here for automatic redirect, or open the order detail page and pay from the saved link.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
