"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  canPayTransaction,
  formatPaymentPrice,
  formatRemainingSeconds,
  getPaymentStatusTone,
  getRemainingSeconds,
  getTransactionStatusLabel,
} from "@/components/payment/payment-view-utils";
import { listMyOrders } from "@/lib/api/order";
import { getMyTransactions, type TransactionResponse } from "@/lib/api/payment";
import type { OrderResponse } from "@/lib/api/dashboard-types";

type OrderFilter = "all" | string;

const ORDERS_PER_PAGE = 5;

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatOrderDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getOrderStatusLabel(status: string) {
  if (status === "ReadyForPickup") return "Ready for pickup";
  if (status === "InventoryReservationFailed") return "Inventory unavailable";
  if (status === "PaymentFailed") return "Payment failed";
  return status;
}

function getOrderPaymentText(order: OrderResponse, transaction: TransactionResponse | null) {
  if (transaction?.status === "Pending" && transaction.checkoutUrl) return "Ready to pay";
  if (transaction?.status) return getTransactionStatusLabel(transaction.status);
  if (order.status === "Pending") return "Preparing payment";
  return "No online payment";
}

function getOrderItemCount(order: OrderResponse) {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

function getFulfillmentLabel(order: OrderResponse) {
  return order.deliveryType === "Pickup" ? "Store pickup" : "Delivery";
}

function getFulfillmentDetail(order: OrderResponse) {
  if (order.deliveryType === "Pickup") {
    return order.deliveryAddress || order.storeNameSnapshot;
  }

  return order.deliveryAddress || "Delivery address saved";
}

export default function OrderHistoryMain() {
  const searchParams = useSearchParams();
  const { accessToken } = useAuth();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [transactionsByOrderId, setTransactionsByOrderId] = useState<Record<string, TransactionResponse>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  const paymentNotice = searchParams.get("payment") === "multiple";

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    const orderAccessToken = accessToken;
    let active = true;

    async function loadOrders() {
      setIsLoading(true);
      setError("");

      try {
        const [nextOrders, nextTransactions] = await Promise.all([
          listMyOrders(orderAccessToken),
          getMyTransactions(orderAccessToken).catch(() => [] as TransactionResponse[]),
        ]);

        if (!active) return;

        setOrders([...nextOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setTransactionsByOrderId(
          Object.fromEntries(nextTransactions.map((transaction) => [transaction.orderId, transaction])),
        );
      } catch (requestError) {
        if (!active) return;

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load your orders.",
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      active = false;
    };
  }, [accessToken]);

  const visibleOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      const transaction = transactionsByOrderId[order.id];
      const paymentLabel = transaction ? getTransactionStatusLabel(transaction.status).toLowerCase() : "";
      const matchesFilter = filter === "all" || order.status === filter;
      const matchesQuery = !normalizedQuery
        || order.id.toLowerCase().includes(normalizedQuery)
        || order.storeNameSnapshot.toLowerCase().includes(normalizedQuery)
        || paymentLabel.includes(normalizedQuery)
        || order.items.some((item) => item.bagNameSnapshot.toLowerCase().includes(normalizedQuery));

      return matchesFilter && matchesQuery;
    });
  }, [filter, orders, query, transactionsByOrderId]);

  const statusOptions = useMemo(
    () => Array.from(new Set(orders.map((order) => order.status))).sort(),
    [orders],
  );
  const pageCount = Math.max(1, Math.ceil(visibleOrders.length / ORDERS_PER_PAGE));
  const activePage = Math.min(page, pageCount);
  const paginationStart = visibleOrders.length ? (activePage - 1) * ORDERS_PER_PAGE + 1 : 0;
  const paginationEnd = Math.min(activePage * ORDERS_PER_PAGE, visibleOrders.length);
  const paginatedOrders = visibleOrders.slice(paginationStart - 1, paginationEnd);

  return (
    <main className="main order-history-page">
      <nav aria-label="Breadcrumb" className="breadcrumb-nav border-0 mb-0">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link href="/">Home</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Order history</li>
          </ol>
        </div>
      </nav>

      <div className="page-content">
        <div className="container">
          <header className="order-history-heading">
            <div>
              <p>Your rescued food</p>
              <h1>Order history</h1>
            </div>
            <Link href="/products" className="btn btn-outline-primary-2">Find more bags</Link>
          </header>

          {paymentNotice ? (
            <div className="alert alert-info order-history-payment-notice" role="status">
              Multiple store orders were created. Pay each order separately when its VNPAY link is ready.
            </div>
          ) : null}

          {error ? <div className="alert alert-danger" role="alert">{error}</div> : null}

          <section className="order-history-controls" aria-label="Order history filters">
            <label className="order-history-search">
              <span className="sr-only">Search orders</span>
              <i className="icon-search" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search store, surprise bag, or payment"
              />
            </label>
            <label className="order-history-status-filter">
              <span>Filter by status</span>
              <select value={filter} onChange={(event) => {
                setFilter(event.target.value);
                setPage(1);
              }}>
                <option value="all">All orders</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{getOrderStatusLabel(status)}</option>
                ))}
              </select>
            </label>
          </section>

          <div className="order-history-result-count">
            {isLoading
              ? "Loading orders"
              : visibleOrders.length
                ? `Showing ${paginationStart}-${paginationEnd} of ${visibleOrders.length} ${visibleOrders.length === 1 ? "order" : "orders"}`
                : "Showing 0 orders"}
          </div>

          {isLoading ? (
            <section className="order-history-empty" aria-live="polite">
              <i className="icon-shopping-cart" aria-hidden="true" />
              <h2>Loading your orders</h2>
              <p>Checking your latest order and payment activity.</p>
            </section>
          ) : visibleOrders.length ? (
            <>
            <section className="order-history-list" aria-label="Orders">
              {paginatedOrders.map((order) => {
                const transaction = transactionsByOrderId[order.id] ?? null;
                const remainingSeconds = getRemainingSeconds(transaction?.expiresAt ?? null, now);
                const canPay = canPayTransaction(transaction, now);
                const itemCount = getOrderItemCount(order);

                return (
                  <article className="order-history-card" key={order.id}>
                    <header className="order-history-card__header">
                      <div>
                        <span>Order placed {formatOrderDate(order.createdAt)}</span>
                        <h2>{order.storeNameSnapshot}</h2>
                      </div>
                      <span className={`order-status order-status--${order.status.toLowerCase()}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </header>
                    <div className="order-history-card__body">
                      <div className="order-history-card__items">
                        {order.items.map((item) => (
                          <div key={item.id}>
                            <span>{item.quantity} x</span>
                            <strong>{item.bagNameSnapshot}</strong>
                            <span>{formatPaymentPrice(item.subtotal)}</span>
                          </div>
                        ))}
                      </div>
                      <dl className="order-history-card__facts">
                        <div><dt>Items</dt><dd>{itemCount} {itemCount === 1 ? "bag" : "bags"}</dd></div>
                        <div><dt>Receive by</dt><dd>{getFulfillmentLabel(order)}</dd></div>
                        <div><dt>Location</dt><dd>{getFulfillmentDetail(order)}</dd></div>
                        {order.pickupDeadline ? (
                          <div><dt>Pickup before</dt><dd>{formatOrderDateTime(order.pickupDeadline)}</dd></div>
                        ) : null}
                        <div><dt>Total</dt><dd>{formatPaymentPrice(order.totalAmount)}</dd></div>
                      </dl>
                    </div>
                    <footer className="order-history-card__footer order-history-card__footer--payment">
                      <div className="order-history-payment-state">
                        <span className={`payment-status-pill is-${transaction ? getPaymentStatusTone(transaction.status) : "pending"}`}>
                          {getOrderPaymentText(order, transaction)}
                        </span>
                        {transaction?.status === "Pending" ? (
                          <small>Expires in {formatRemainingSeconds(remainingSeconds)}</small>
                        ) : null}
                      </div>
                      <div className="order-history-card__actions">
                        {canPay ? (
                          <a
                            href={transaction?.checkoutUrl ?? "#"}
                            className="btn btn-primary order-history-pay-button"
                            onClick={() => {
                              if (transaction?.gatewayRef) {
                                window.localStorage.setItem(`vnpay-order:${transaction.gatewayRef}`, order.id);
                              }
                              window.localStorage.setItem("vnpay-last-order-id", order.id);
                            }}
                          >
                            Pay now
                          </a>
                        ) : null}
                        <Link href={`/orders/${encodeURIComponent(order.id)}`}>
                          View order details <span aria-hidden="true">&rarr;</span>
                        </Link>
                      </div>
                    </footer>
                  </article>
                );
              })}
            </section>
            {pageCount > 1 ? (
              <nav className="order-history-pagination" aria-label="Order history pagination">
                <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={activePage === 1}>
                  Previous
                </button>
                <span>Page {activePage} of {pageCount}</span>
                <button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={activePage === pageCount}>
                  Next
                </button>
              </nav>
            ) : null}
            </>
          ) : (
            <section className="order-history-empty" aria-live="polite">
              <i className="icon-shopping-cart" aria-hidden="true" />
              <h2>No orders found</h2>
              <p>Try another search or browse the available surprise bags.</p>
              <Link href="/products" className="btn btn-primary">Browse surprise bags</Link>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
