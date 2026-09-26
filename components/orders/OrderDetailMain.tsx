"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  canPayTransaction,
  formatPaymentDate,
  formatPaymentPrice,
  formatRemainingSeconds,
  getPaymentStatusTone,
  getRemainingSeconds,
  getTransactionStatusLabel,
  hasPendingCheckoutUrl,
} from "@/components/payment/payment-view-utils";
import { ApiClientError } from "@/lib/api/client";
import { getOrder } from "@/lib/api/order";
import { getTransactionByOrderId, type TransactionResponse } from "@/lib/api/payment";
import type { OrderResponse } from "@/lib/api/dashboard-types";

function getOrderStatusLabel(status: string) {
  if (status === "ReadyForPickup") return "Ready for pickup";
  if (status === "InventoryReservationFailed") return "Inventory unavailable";
  if (status === "PaymentFailed") return "Payment failed";
  return status;
}

function getOrderReference(orderId: string) {
  return `#${orderId.slice(0, 8).toUpperCase()}`;
}

function getPaymentHeadline(order: OrderResponse | null, transaction: TransactionResponse | null) {
  if (!order) return "Loading order";
  if (!transaction) return order.status === "Pending" ? "Preparing payment" : "Payment details";
  if (transaction.status === "Pending") return "Waiting for payment";
  if (transaction.status === "Success" && order.status === "Confirmed") return "Payment confirmed";
  if (transaction.status === "Success") return "Payment received";
  if (transaction.status === "Expired") return "Payment link expired";
  if (transaction.status === "RefundPending") return "Refund pending";
  return getTransactionStatusLabel(transaction.status);
}

function getPaymentDescription(order: OrderResponse | null, transaction: TransactionResponse | null) {
  if (!order) return "Checking the latest order state.";
  if (!transaction && order.status === "Pending") {
    return "Inventory has to be reserved before VNPAY can create a checkout link.";
  }
  if (!transaction) return "No online payment transaction is available for this order.";
  if (transaction.status === "Pending") return "Use the VNPAY link before it expires.";
  if (transaction.status === "Success" && order.status !== "Confirmed") {
    return "VNPAY has accepted the payment. The order confirmation event may still be processing.";
  }
  if (transaction.status === "RefundPending") {
    return "The payment arrived after the order could not be confirmed, so refund handling is pending.";
  }
  if (transaction.failureReason) return transaction.failureReason;
  return "This is the latest payment state from the payment service.";
}

function getPaymentWindowLabel(transaction: TransactionResponse | null, remainingSeconds: number | null) {
  if (!transaction) return "Preparing";
  if (transaction.status === "Pending" && transaction.checkoutUrl) {
    return formatRemainingSeconds(remainingSeconds);
  }
  if (transaction.status === "Pending") return "Waiting for link";
  if (transaction.status === "Success") return "Completed";
  if (transaction.status === "Expired") return "Expired";
  return "Not available";
}

function getPaymentLinkLabel(transaction: TransactionResponse | null, remainingSeconds: number | null) {
  if (!transaction) return "Creating secure link";
  if (transaction.status === "Pending" && transaction.checkoutUrl && remainingSeconds !== 0) return "Ready to open";
  if (transaction.status === "Pending") return "Still being created";
  return "No active payment link";
}

export default function OrderDetailMain({ orderId }: { orderId: string }) {
  const { accessToken } = useAuth();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [transaction, setTransaction] = useState<TransactionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [error, setError] = useState("");
  const [paymentNotice, setPaymentNotice] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const loadOrderDetail = useCallback(async (showPaymentLoader = false) => {
    if (!accessToken) return;

    setError("");
    setPaymentNotice("");
    setIsCheckingPayment(showPaymentLoader);
    setIsLoading((current) => current || !showPaymentLoader);

    try {
      const nextOrder = await getOrder(accessToken, orderId);
      setOrder(nextOrder);

      try {
        const nextTransaction = await getTransactionByOrderId(accessToken, orderId);
        setTransaction(nextTransaction);

        if (nextTransaction.gatewayRef) {
          window.localStorage.setItem(`vnpay-order:${nextTransaction.gatewayRef}`, orderId);
        }
        window.localStorage.setItem("vnpay-last-order-id", orderId);
      } catch (requestError) {
        if (requestError instanceof ApiClientError && requestError.status === 404) {
          setTransaction(null);
          setPaymentNotice("Payment transaction is not ready yet.");
        } else {
          throw requestError;
        }
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load this order.",
      );
    } finally {
      setIsLoading(false);
      setIsCheckingPayment(false);
    }
  }, [accessToken, orderId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOrderDetail();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadOrderDetail]);

  useEffect(() => {
    if (!accessToken || !orderId || !order || transaction) return;
    if (order.status !== "Pending") return;

    const paymentAccessToken = accessToken;
    const paymentOrderId = orderId;

    let cancelled = false;
    let attempts = 0;
    let timeoutId: number | undefined;

    async function pollPaymentCreation() {
      attempts += 1;

      try {
        const nextTransaction = await getTransactionByOrderId(paymentAccessToken, paymentOrderId);
        if (cancelled) return;

        setTransaction(nextTransaction);
        setPaymentNotice("");

        if (nextTransaction.gatewayRef) {
          window.localStorage.setItem(`vnpay-order:${nextTransaction.gatewayRef}`, paymentOrderId);
        }
        window.localStorage.setItem("vnpay-last-order-id", paymentOrderId);
        return;
      } catch (requestError) {
        if (cancelled) return;

        if (!(requestError instanceof ApiClientError && requestError.status === 404)) {
          setPaymentNotice(
            requestError instanceof Error
              ? requestError.message
              : "Unable to check payment status.",
          );
          return;
        }
      }

      if (attempts < 10) {
        timeoutId = window.setTimeout(pollPaymentCreation, 2000);
      }
    }

    timeoutId = window.setTimeout(pollPaymentCreation, 1500);

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [accessToken, order, orderId, transaction]);

  const remainingSeconds = getRemainingSeconds(transaction?.expiresAt ?? null, now);
  const canPay = canPayTransaction(transaction, now);
  const hasCheckoutUrl = hasPendingCheckoutUrl(transaction);
  const paymentTone = transaction ? getPaymentStatusTone(transaction.status) : "pending";
  const orderReference = getOrderReference(orderId);
  const paymentWindowLabel = getPaymentWindowLabel(transaction, remainingSeconds);
  const paymentLinkLabel = getPaymentLinkLabel(transaction, remainingSeconds);
  const paymentAmount = transaction ? transaction.amount : order?.totalAmount ?? 0;

  function handlePayNow() {
    if (!transaction?.checkoutUrl) return;

    if (transaction.gatewayRef) {
      window.localStorage.setItem(`vnpay-order:${transaction.gatewayRef}`, orderId);
    }
    window.localStorage.setItem("vnpay-last-order-id", orderId);
    window.location.href = transaction.checkoutUrl;
  }

  return (
    <main className="main shipping-page order-detail-page">
      <nav aria-label="Breadcrumb" className="breadcrumb-nav border-0 mb-0">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link href="/">Home</Link></li>
            <li className="breadcrumb-item"><Link href="/orders">Order history</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Order details</li>
          </ol>
        </div>
      </nav>

      <div className="page-content">
        <div className="container">
          <header className="shipping-heading">
            <div>
              <p>{order?.deliveryType === "Delivery" ? "Delivery order" : "Pickup order"}</p>
              <h1>Order details</h1>
            </div>
            <Link href="/orders" className="btn btn-outline-primary-2">Back to orders</Link>
          </header>

          {error ? <div className="alert alert-danger" role="alert">{error}</div> : null}

          {isLoading ? (
            <section className="shipping-cancelled" aria-live="polite">
              <h2>Loading order</h2>
              <p>Checking your order and payment status.</p>
            </section>
          ) : order ? (
            <>
              <section className="shipping-order-banner">
                <div>
                  <span>Store</span>
                  <strong>{order.storeNameSnapshot}</strong>
                </div>
                <div>
                  <span>Placed</span>
                  <strong>{formatPaymentDate(order.createdAt)}</strong>
                </div>
                <span className={`order-status order-status--${order.status.toLowerCase()}`}>
                  {getOrderStatusLabel(order.status)}
                </span>
              </section>

              <div className="shipping-layout">
                <div className="shipping-main-column">
                  <section className="shipping-panel payment-panel" aria-labelledby="payment-panel-title">
                    <div className="shipping-panel__heading">
                      <div><p>Payment</p><h2 id="payment-panel-title">{getPaymentHeadline(order, transaction)}</h2></div>
                      <span className={`payment-status-pill is-${paymentTone}`}>
                        {transaction ? getTransactionStatusLabel(transaction.status) : "Creating"}
                      </span>
                    </div>

                    <p className="payment-panel__description">{getPaymentDescription(order, transaction)}</p>

                    <dl className="payment-facts payment-facts--compact">
                      <div><dt>Payment method</dt><dd>{transaction?.paymentMethod ?? "VNPAY"}</dd></div>
                      <div><dt>Amount</dt><dd>{formatPaymentPrice(paymentAmount)}</dd></div>
                      <div><dt>Payment window</dt><dd>{paymentWindowLabel}</dd></div>
                      {transaction?.paidAt ? (
                        <div><dt>Paid at</dt><dd>{formatPaymentDate(transaction.paidAt)}</dd></div>
                      ) : null}
                      {transaction?.failureReason ? (
                        <div className="payment-link-fact"><dt>Issue</dt><dd>{transaction.failureReason}</dd></div>
                      ) : null}
                      <div className="payment-link-fact">
                        <dt>VNPAY link</dt>
                        <dd>
                          {transaction?.checkoutUrl ? (
                            <a href={transaction.checkoutUrl} onClick={() => {
                              if (transaction.gatewayRef) {
                                window.localStorage.setItem(`vnpay-order:${transaction.gatewayRef}`, orderId);
                              }
                              window.localStorage.setItem("vnpay-last-order-id", orderId);
                            }}>
                              Open VNPAY checkout
                            </a>
                          ) : paymentLinkLabel}
                        </dd>
                      </div>
                    </dl>

                    {paymentNotice ? <div className="alert alert-info" role="status">{paymentNotice}</div> : null}

                    <div className="payment-panel__actions">
                      {hasCheckoutUrl ? (
                        <button type="button" className="btn btn-primary order-detail-pay-button" onClick={handlePayNow}>
                          {canPay ? "Pay with VNPAY" : "Open saved VNPAY link"}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="btn btn-outline-primary-2"
                        onClick={() => void loadOrderDetail(true)}
                        disabled={isCheckingPayment}
                      >
                        {isCheckingPayment ? "Checking..." : "Refresh status"}
                      </button>
                    </div>
                  </section>

                  <section className="shipping-panel" aria-labelledby="order-location-title">
                    <div className="shipping-panel__heading">
                      <div><p>{order.deliveryType === "Pickup" ? "Pickup information" : "Delivery information"}</p><h2 id="order-location-title">Where to receive your order</h2></div>
                    </div>
                    <div className="shipping-location">
                      <div><span>{order.deliveryType === "Pickup" ? "Pickup from" : "Delivery to"}</span><strong>{order.deliveryType === "Pickup" ? order.storeNameSnapshot : order.deliveryAddress}</strong></div>
                      <div><span>{order.deliveryType === "Pickup" ? "Pickup address" : "Contact name"}</span><strong>{order.deliveryType === "Pickup" ? order.deliveryAddress || "Store pickup" : order.contactNameSnapshot}</strong></div>
                      <div><span>Contact phone</span><strong>{order.contactPhoneSnapshot}</strong></div>
                    </div>
                    {order.pickupCode ? (
                      <div className="shipping-pickup-code"><span>Pickup code</span><strong>{order.pickupCode}</strong><p>Show this code to the store when collecting your order.</p></div>
                    ) : null}
                  </section>

                  <section className="shipping-panel" aria-labelledby="order-items-title">
                    <div className="shipping-panel__heading">
                      <div><p>Order contents</p><h2 id="order-items-title">Your surprise bags</h2></div>
                    </div>
                    <div className="shipping-items">
                      {order.items.map((item) => (
                        <div key={item.id}>
                          <div><span>{item.quantity} x</span><strong>{item.bagNameSnapshot}</strong></div>
                          <span>{formatPaymentPrice(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <aside className="shipping-summary" aria-labelledby="order-summary-title">
                  <p>Order summary</p>
                  <h2 id="order-summary-title">{formatPaymentPrice(order.totalAmount)}</h2>
                  <div><span>Order reference</span><strong>{orderReference}</strong></div>
                  <div><span>Store</span><strong>{order.storeNameSnapshot}</strong></div>
                  <div><span>Subtotal</span><strong>{formatPaymentPrice(order.totalAmount - order.deliveryFee + order.voucherDiscount)}</strong></div>
                  <div><span>Delivery fee</span><strong>{order.deliveryFee ? formatPaymentPrice(order.deliveryFee) : "Free"}</strong></div>
                  <div><span>Voucher discount</span><strong>{order.voucherDiscount ? `- ${formatPaymentPrice(order.voucherDiscount)}` : "-"}</strong></div>
                  <div className="shipping-summary__total"><span>Total</span><strong>{formatPaymentPrice(order.totalAmount)}</strong></div>
                  <Link href="/products" className="btn btn-primary">Find more bags</Link>
                </aside>
              </div>
            </>
          ) : (
            <section className="shipping-cancelled" aria-live="polite">
              <h2>Order not found</h2>
              <p>Please return to your order history and choose another order.</p>
              <Link href="/orders" className="btn btn-primary">Back to orders</Link>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
