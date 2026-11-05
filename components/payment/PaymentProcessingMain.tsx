"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  formatPaymentPrice,
  getRemainingSeconds,
} from "@/components/payment/payment-view-utils";
import { ApiClientError } from "@/lib/api/client";
import { getTransactionByOrderId, type TransactionResponse } from "@/lib/api/payment";

const POLL_INTERVAL_MS = 1500;
const MAX_WAIT_MS = 120000;

export default function PaymentProcessingMain() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { accessToken } = useAuth();
  const [transaction, setTransaction] = useState<TransactionResponse | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [message, setMessage] = useState("You'll be taken to VNPAY to complete your payment.");
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
            setMessage("Taking you to VNPAY to complete your payment.");
            window.location.href = nextTransaction.checkoutUrl;
            return;
          }
        }

        if (nextTransaction.status === "Success") {
          setMessage("Your payment is complete. Taking you to your order.");
          window.location.replace(`/orders/${encodeURIComponent(orderId)}`);
          return;
        }

        if (["Failed", "Expired", "RefundPending", "Refunded", "RefundFailed"].includes(nextTransaction.status)) {
          setMessage("Please view your order for the latest payment details.");
          return;
        }
      } catch (requestError) {
        if (cancelled) return;

        if (requestError instanceof ApiClientError && requestError.status === 404) {
          setMessage("We're getting your payment ready. You'll be taken to VNPAY shortly.");
        } else {
          setError("We're having trouble checking your payment. Please wait a moment or view your order for updates.");
        }
      }

      if (currentElapsedMs >= MAX_WAIT_MS) {
        setMessage("Your order is saved. Please view your order to continue with payment.");
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
  const isPaymentUnavailable = Boolean(
    transaction && transaction.status !== "Pending" && transaction.status !== "Success",
  );
  const isTimedOut = elapsedMs >= MAX_WAIT_MS
    && !hasRedirected
    && !isPaymentUnavailable
    && transaction?.status !== "Success";
  const isWaitingForRedirect =
    Boolean(orderId)
    && !isTimedOut
    && !hasRedirected
    && (!transaction || transaction.status === "Pending");
  const title = !orderId
    ? "Find your order"
    : transaction?.status === "Success"
      ? "Payment complete"
      : isPaymentUnavailable
        ? "View your payment details"
        : isTimedOut
          ? "This is taking a little longer"
          : hasRedirected
            ? "Continue to VNPAY"
            : "Getting your payment ready";
  const iconTone = !orderId || isTimedOut || isPaymentUnavailable
    ? "warning"
    : transaction?.status === "Success" ? "success" : "pending";

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
            <span className={`payment-result-card__icon is-${iconTone}${isWaitingForRedirect ? " is-spinning" : ""}`} aria-hidden="true">
              {iconTone === "warning" ? "!" : iconTone === "success" ? <i className="icon-check" /> : <i className="icon-refresh" />}
            </span>
            <p>VNPAY payment</p>
            <h1>{title}</h1>
            <span>{orderId ? message : "Choose an order to continue with payment."}</span>

            {isWaitingForRedirect ? (
              <div className="payment-processing-wait" role="status">
                <span className="payment-processing-wait__spinner" aria-hidden="true" />
                <div className="payment-processing-wait__copy">
                  <strong>Connecting to VNPAY</strong>
                  <span>Please keep this page open. You&apos;ll be redirected automatically.</span>
                </div>
              </div>
            ) : null}

            {orderId && transaction ? (
              <dl className="payment-processing-total">
                <div>
                  <dt>{transaction.status === "Pending" ? "Total to pay" : "Order total"}</dt>
                  <dd>{formatPaymentPrice(transaction.amount)}</dd>
                </div>
              </dl>
            ) : null}

            {error ? <div className="alert alert-danger" role="alert">{error}</div> : null}
            {isTimedOut && canOpenOrder ? (
              <div className="alert alert-warning" role="status">
                You can continue with payment from your order once it&apos;s ready.
              </div>
            ) : null}

            <div className="payment-result-card__actions">
              {transaction?.checkoutUrl && transaction.status === "Pending" && remainingSeconds !== 0 ? (
                <a className="btn btn-primary" href={transaction.checkoutUrl}>Pay with VNPAY</a>
              ) : null}
              {canOpenOrder ? (
                <Link href={`/orders/${encodeURIComponent(orderId ?? "")}`} className="btn btn-outline-primary-2">
                  View order details
                </Link>
              ) : (
                <Link href="/orders" className="btn btn-outline-primary-2">Back to orders</Link>
              )}
            </div>

            {hasRedirected ? (
              <p className="payment-result-card__note">
                If VNPAY hasn&apos;t opened, select Pay with VNPAY to continue.
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
