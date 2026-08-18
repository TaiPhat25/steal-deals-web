"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  formatOrderDate,
  formatOrderPrice,
} from "@/components/orders/order-data";
import { listMyOrders } from "@/lib/api/order";
import type { OrderResponse } from "@/lib/api/dashboard-types";

type OrderFilter = "all" | OrderResponse["status"];

function getOrderStatusLabel(status: string) {
  if (status === "ReadyForPickup") return "Ready for pickup";
  if (status === "InventoryReservationFailed") return "Inventory unavailable";
  if (status === "PaymentFailed") return "Payment failed";
  return status;
}

export default function OrderHistoryMain() {
  const { accessToken } = useAuth();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    if (!accessToken) return;

    setLoading(true);
    setError("");

    try {
      setOrders(await listMyOrders(accessToken));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load your order history.",
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void Promise.resolve().then(loadOrders);
  }, [loadOrders]);

  const visibleOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter = filter === "all" || order.status === filter;
      const matchesQuery = !normalizedQuery
        || order.id.toLowerCase().includes(normalizedQuery)
        || order.storeNameSnapshot.toLowerCase().includes(normalizedQuery)
        || order.items.some((item) => item.bagNameSnapshot.toLowerCase().includes(normalizedQuery));

      return matchesFilter && matchesQuery;
    });
  }, [filter, orders, query]);

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

          <section className="order-history-controls" aria-label="Order history filters">
            <label className="order-history-search">
              <span className="sr-only">Search orders</span>
              <i className="icon-search" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search order, store, or surprise bag"
              />
            </label>
            <label className="order-history-status-filter">
              <span>Filter by status</span>
              <select value={filter} onChange={(event) => setFilter(event.target.value as OrderFilter)}>
                <option value="all">All orders</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="InventoryReservationFailed">Inventory unavailable</option>
                <option value="PaymentFailed">Payment failed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </label>
          </section>

          <div className="order-history-result-count">
            {loading
              ? "Loading your orders..."
              : `Showing ${visibleOrders.length} ${visibleOrders.length === 1 ? "order" : "orders"}`}
          </div>

          {error ? (
            <section className="order-history-empty" aria-live="polite">
              <i className="icon-warning" aria-hidden="true" />
              <h2>Unable to load orders</h2>
              <p>{error}</p>
              <button type="button" className="btn btn-outline-primary-2" onClick={() => void loadOrders()}>
                Try again
              </button>
            </section>
          ) : loading ? (
            <section className="order-history-empty" aria-live="polite">
              <h2>Loading orders...</h2>
              <p>We are retrieving your latest rescue orders.</p>
            </section>
          ) : visibleOrders.length ? (
            <section className="order-history-list" aria-label="Orders">
              {visibleOrders.map((order) => (
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
                          <span>{formatOrderPrice(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                    <dl className="order-history-card__facts">
                      <div><dt>Order ID</dt><dd>{order.id}</dd></div>
                      <div><dt>Type</dt><dd>{order.deliveryType}</dd></div>
                      <div><dt>Total</dt><dd>{formatOrderPrice(order.totalAmount)}</dd></div>
                    </dl>
                  </div>
                  <footer className="order-history-card__footer">
                    <span>{order.deliveryType === "Pickup" ? "Pickup order" : "Delivery order"}</span>
                    <Link href={`/shipping?order=${encodeURIComponent(order.id)}`}>View order details <span aria-hidden="true">&#8594;</span></Link>
                  </footer>
                </article>
              ))}
            </section>
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
