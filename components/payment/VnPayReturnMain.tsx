"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  formatPaymentDate,
  formatPaymentPrice,
  getPaymentStatusTone,
} from "@/components/payment/payment-view-utils";
import { ApiClientError } from "@/lib/api/client";
import { getOrder } from "@/lib/api/order";
import {
  getTransactionByOrderId,
  verifyVnPayReturn,
  type TransactionResponse,
  type VnPayReturnVerification,
} from "@/lib/api/payment";
import type { OrderResponse } from "@/lib/api/dashboard-types";

const ORDER_STATUS_LABELS: Record<string, string> = {
  Pending: "Awaiting confirmation",
  InventoryReservationFailed: "Items no longer available",
  PaymentFailed: "Payment unsuccessful",
  Confirmed: "Confirmed",
  Cancelled: "Cancelled",
};

const PAYMENT_STATUS_LABELS: Record<TransactionResponse["status"], string> = {
  Pending: "Awaiting confirmation",
  Success: "Paid",
  Failed: "Unsuccessful",
  Expired: "Payment expired",
  RefundPending: "Refund pending",
  Refunded: "Refunded",
  RefundFailed: "Refund needs attention",
};

function findGuid(value: string | null) {
  if (!value) return null;

  const match = value.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return match?.[0] ?? null;
}

function getStoredOrderId(gatewayRef: string | null) {
  if (typeof window === "undefined") return null;

  if (gatewayRef) {
    const mappedOrderId = window.localStorage.getItem(`vnpay-order:${gatewayRef}`);
    if (mappedOrderId) return mappedOrderId;
  }

  return window.localStorage.getItem("vnpay-last-order-id");
}

function getResultCopy(
  verification: VnPayReturnVerification | null,
  transaction: TransactionResponse | null,
  order: OrderResponse | null,
) {
  if (transaction?.status === "Success" && order?.status === "Confirmed") {
    return {
      tone: "success",
      icon: "OK",
      title: "Payment successful",
      text: "Thank you! Your payment and order are confirmed. View your order for the next steps.",
    };
  }

  if (transaction?.status === "Success") {
    return {
      tone: "success",
      icon: "OK",
      title: "Payment received",
      text: "Your payment was successful. We're updating your order details.",
    };
  }

  if (transaction?.status === "RefundPending") {
    return {
      tone: "warning",
      icon: "!",
      title: "Refund pending",
      text: "We received your payment, but couldn't confirm your order. Your refund is pending. View your order for updates.",
    };
  }

  if (transaction?.status === "Refunded") {
    return {
      tone: "success",
      icon: "OK",
      title: "Payment refunded",
      text: "Your refund has been processed. It may take some time to appear in your account, depending on your bank.",
    };
  }

  if (transaction?.status === "RefundFailed") {
    return {
      tone: "danger",
      icon: "!",
      title: "Your refund needs attention",
      text: "We couldn't complete your refund. Please contact support with your order reference for help.",
    };
  }

  if (transaction && ["Failed", "Expired"].includes(transaction.status)) {
    return {
      tone: "danger",
      icon: "!",
      title: transaction.status === "Expired" ? "Payment expired" : "Payment unsuccessful",
      text: transaction.status === "Expired"
        ? "The time to complete this payment has ended. View your order to see the available payment options."
        : "We couldn't complete your payment. View your order to check its status and available payment options.",
    };
  }

  if (verification && !verification.isValidSignature) {
    return {
      tone: "danger",
      icon: "!",
      title: "We couldn't confirm your payment",
      text: "Please check your order for the latest payment status before trying to pay again.",
    };
  }

  if (verification && !verification.isSuccess) {
    return {
      tone: "danger",
      icon: "!",
      title: "Payment not completed",
      text: "Your payment wasn't completed. View your order to check its status and available payment options.",
    };
  }

  return {
    tone: "pending",
    icon: "...",
    title: "Confirming your payment",
    text: "Please wait a moment while we confirm your payment. You can also check for updates in your order details.",
  };
}

export default function VnPayReturnMain() {
  const searchParams = useSearchParams();
  const { accessToken } = useAuth();
  const [verification, setVerification] = useState<VnPayReturnVerification | null>(null);
  const [transaction, setTransaction] = useState<TransactionResponse | null>(null);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const rawQueryString = useMemo(() => searchParams.toString(), [searchParams]);

  useEffect(() => {
    let active = true;

    async function verifyReturn() {
      setError("");

      try {
        const result = await verifyVnPayReturn(rawQueryString);
        if (!active) return;

        setVerification(result);

        const nextOrderId =
          searchParams.get("orderId")
          ?? getStoredOrderId(result.gatewayRef)
          ?? findGuid(searchParams.get("vnp_OrderInfo"));

        setOrderId(nextOrderId);
      } catch {
        if (!active) return;

        setError("We couldn't confirm your payment right now. Please check your order for updates before trying to pay again.");

        const fallbackOrderId =
          searchParams.get("orderId")
          ?? getStoredOrderId(searchParams.get("vnp_TxnRef"))
          ?? findGuid(searchParams.get("vnp_OrderInfo"));

        setOrderId(fallbackOrderId);
      }
    }

    void verifyReturn();

    return () => {
      active = false;
    };
  }, [rawQueryString, searchParams]);

  useEffect(() => {
    if (!accessToken || !orderId) return;

    let cancelled = false;
    let attempts = 0;
    let timeoutId: number | undefined;

    async function loadPaymentState() {
      if (cancelled || !accessToken || !orderId) return;
      attempts += 1;

      try {
        const [nextOrder, nextTransaction] = await Promise.all([
          getOrder(accessToken, orderId),
          getTransactionByOrderId(accessToken, orderId),
        ]);

        if (cancelled) return;

        setOrder(nextOrder);
        setTransaction(nextTransaction);
        setError("");

        const orderIsSettled = ["Confirmed", "PaymentFailed", "InventoryReservationFailed", "Cancelled"].includes(nextOrder.status);
        const transactionIsSettled = nextTransaction.status !== "Pending";

        if (orderIsSettled && transactionIsSettled) return;
      } catch (requestError) {
        if (cancelled) return;

        if (!(requestError instanceof ApiClientError && requestError.status === 404)) {
          setError("We're having trouble loading your payment details. Please view your order for the latest updates.");
        }
      }

      if (attempts < 10) {
        timeoutId = window.setTimeout(loadPaymentState, 1500);
      }
    }

    void loadPaymentState();

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [accessToken, orderId]);

  const copy = getResultCopy(verification, transaction, order);
  const tone = transaction ? getPaymentStatusTone(transaction.status) : copy.tone;

  return (
    <main className="main payment-page">
      <nav aria-label="Breadcrumb" className="breadcrumb-nav border-0 mb-0">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link href="/">Home</Link></li>
            <li className="breadcrumb-item"><Link href="/orders">Order history</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Payment result</li>
          </ol>
        </div>
      </nav>

      <div className="page-content">
        <div className="container">
          <section className="payment-result-card" aria-live="polite">
            <span className={`payment-result-card__icon is-${tone}`} aria-hidden="true">{copy.icon}</span>
            <p>VNPAY payment</p>
            <h1>{copy.title}</h1>
            <span>{copy.text}</span>

            <dl className="payment-facts">
              {orderId ? <div><dt>Order reference</dt><dd>{orderId}</dd></div> : null}
              {order ? <div><dt>Order status</dt><dd>{ORDER_STATUS_LABELS[order.status] ?? "Updating"}</dd></div> : null}
              {transaction ? (
                <>
                  <div><dt>Payment status</dt><dd>{PAYMENT_STATUS_LABELS[transaction.status] ?? "Updating"}</dd></div>
                  <div><dt>Payment amount</dt><dd>{formatPaymentPrice(transaction.amount)}</dd></div>
                  {transaction.paidAt ? <div><dt>Payment date</dt><dd>{formatPaymentDate(transaction.paidAt)}</dd></div> : null}
                  {transaction.gatewayTransactionNo ? <div><dt>Transaction reference</dt><dd>{transaction.gatewayTransactionNo}</dd></div> : null}
                </>
              ) : verification ? (
                <>
                  {verification.gatewayRef ? <div><dt>Payment reference</dt><dd>{verification.gatewayRef}</dd></div> : null}
                  {verification.amount !== null ? <div><dt>Payment amount</dt><dd>{formatPaymentPrice(verification.amount)}</dd></div> : null}
                </>
              ) : (
                <div><dt>Payment status</dt><dd>Checking your payment</dd></div>
              )}
            </dl>

            {error ? <div className="alert alert-danger" role="alert">{error}</div> : null}

            <div className="payment-result-card__actions">
              {orderId ? (
                <Link href={`/orders/${encodeURIComponent(orderId)}`} className="btn btn-primary">View order details</Link>
              ) : null}
              <Link href="/orders" className="btn btn-outline-primary-2">Back to orders</Link>
            </div>

            <p className="payment-result-card__note">
              You can check the latest payment updates in your order details.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
