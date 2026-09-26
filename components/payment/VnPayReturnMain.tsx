"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  formatPaymentDate,
  formatPaymentPrice,
  getPaymentStatusTone,
  getTransactionStatusLabel,
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
      text: "Your payment has been confirmed and the store can continue preparing the order.",
    };
  }

  if (transaction?.status === "Success") {
    return {
      tone: "success",
      icon: "OK",
      title: "Payment received",
      text: "VNPAY confirmed the payment. The order status may take a moment to update.",
    };
  }

  if (transaction?.status === "RefundPending") {
    return {
      tone: "warning",
      icon: "!",
      title: "Payment needs review",
      text: "The payment arrived after the order could no longer be confirmed. A refund record is pending.",
    };
  }

  if (transaction && ["Failed", "Expired", "RefundFailed"].includes(transaction.status)) {
    return {
      tone: "danger",
      icon: "!",
      title: "Payment was not completed",
      text: transaction.failureReason ?? "This payment attempt cannot be used anymore.",
    };
  }

  if (verification && !verification.isValidSignature) {
    return {
      tone: "danger",
      icon: "!",
      title: "Unable to verify payment response",
      text: verification.reason ?? "The VNPAY response signature is invalid.",
    };
  }

  if (verification && !verification.isSuccess) {
    return {
      tone: "danger",
      icon: "!",
      title: "Payment was not completed",
      text: verification.reason ?? "VNPAY returned a failed or cancelled transaction.",
    };
  }

  return {
    tone: "pending",
    icon: "...",
    title: "Confirming payment",
    text: "We are checking the payment result from VNPAY.",
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
      } catch (requestError) {
        if (!active) return;

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to verify the VNPAY return response.",
        );

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
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load the order payment status.",
          );
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
              {orderId ? <div><dt>Order ID</dt><dd>{orderId}</dd></div> : null}
              {order ? <div><dt>Order status</dt><dd>{order.status}</dd></div> : null}
              {transaction ? (
                <>
                  <div><dt>Payment status</dt><dd>{getTransactionStatusLabel(transaction.status)}</dd></div>
                  <div><dt>Amount</dt><dd>{formatPaymentPrice(transaction.amount)}</dd></div>
                  <div><dt>Paid at</dt><dd>{formatPaymentDate(transaction.paidAt)}</dd></div>
                  <div><dt>VNPAY transaction</dt><dd>{transaction.gatewayTransactionNo ?? "-"}</dd></div>
                </>
              ) : verification ? (
                <>
                  <div><dt>Gateway ref</dt><dd>{verification.gatewayRef ?? "-"}</dd></div>
                  <div><dt>Amount</dt><dd>{verification.amount ? formatPaymentPrice(verification.amount) : "-"}</dd></div>
                  <div><dt>VNPAY response</dt><dd>{verification.gatewayResponseCode ?? "-"}</dd></div>
                </>
              ) : (
                <div><dt>Payment status</dt><dd>Checking</dd></div>
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
              Final payment state is updated by VNPAY IPN, so this page may take a few seconds to catch up.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
