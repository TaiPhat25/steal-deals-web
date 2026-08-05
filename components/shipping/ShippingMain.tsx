"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  demoOrders,
  formatOrderDate,
  formatOrderPrice,
  getOrderStatusLabel,
  type StoreOrder,
} from "@/components/orders/order-data";

const progressSteps: Array<{ key: StoreOrder["status"]; label: string; description: string }> = [
  { key: "Pending", label: "Order placed", description: "Your order has been received." },
  { key: "Confirmed", label: "Store confirmed", description: "The store is preparing your rescue bags." },
  { key: "Preparing", label: "Being prepared", description: "Your bags are being prepared for you." },
  { key: "ReadyForPickup", label: "Ready", description: "Your order is ready for pickup or dispatch." },
];

function getProgressIndex(status: StoreOrder["status"]) {
  if (status === "Completed") return progressSteps.length;
  const index = progressSteps.findIndex((step) => step.key === status);
  return index >= 0 ? index : 0;
}

export default function ShippingMain() {
  const searchParams = useSearchParams();
  const selectedOrderId = searchParams.get("order");
  const order = demoOrders.find((item) => item.id === selectedOrderId) ?? demoOrders[0];
  const progressIndex = getProgressIndex(order.status);
  const isCancelled = order.status === "Cancelled";

  return (
    <main className="main shipping-page">
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
              <p>{order.deliveryType === "Pickup" ? "Pickup details" : "Delivery details"}</p>
              <h1>Order details</h1>
            </div>
            <Link href="/orders" className="btn btn-outline-primary-2">Back to order history</Link>
          </header>

          <section className="shipping-order-banner">
            <div>
              <span>Order ID</span>
              <strong>{order.id}</strong>
            </div>
            <div>
              <span>Placed</span>
              <strong>{formatOrderDate(order.createdAt)}</strong>
            </div>
            <span className={`order-status order-status--${order.status.toLowerCase()}`}>
              {getOrderStatusLabel(order.status)}
            </span>
          </section>

          {isCancelled ? (
            <section className="shipping-cancelled" aria-live="polite">
              <h2>This order was cancelled</h2>
              <p>Please return to your order history to review another order.</p>
            </section>
          ) : (
            <div className="shipping-layout">
              <div className="shipping-main-column">
                <section className="shipping-panel" aria-labelledby="shipping-progress-title">
                  <div className="shipping-panel__heading">
                    <div><p>Order progress</p><h2 id="shipping-progress-title">Track your rescue</h2></div>
                  </div>
                  <ol className="shipping-progress">
                    {progressSteps.map((step, index) => (
                      <li className={index <= progressIndex ? "is-complete" : ""} key={step.key}>
                        <span className="shipping-progress__marker" aria-hidden="true">{index < progressIndex ? "✓" : index + 1}</span>
                        <div><strong>{step.label}</strong><p>{step.description}</p></div>
                      </li>
                    ))}
                  </ol>
                </section>

                <section className="shipping-panel" aria-labelledby="shipping-location-title">
                  <div className="shipping-panel__heading">
                    <div><p>{order.deliveryType === "Pickup" ? "Pickup information" : "Delivery information"}</p><h2 id="shipping-location-title">Where to receive your order</h2></div>
                  </div>
                  <div className="shipping-location">
                    <div><span>{order.deliveryType === "Pickup" ? "Pickup from" : "Delivery to"}</span><strong>{order.deliveryType === "Pickup" ? order.storeNameSnapshot : order.deliveryAddress}</strong></div>
                    <div><span>{order.deliveryType === "Pickup" ? "Pickup address" : "Order status"}</span><strong>{order.deliveryType === "Pickup" ? order.deliveryAddress : getOrderStatusLabel(order.status)}</strong></div>
                    {order.pickupDeadline ? <div><span>Pickup deadline</span><strong>{formatOrderDate(order.pickupDeadline)}</strong></div> : null}
                  </div>
                  {order.pickupCode ? (
                    <div className="shipping-pickup-code"><span>Pickup code</span><strong>{order.pickupCode}</strong><p>Show this code to the store when collecting your order.</p></div>
                  ) : null}
                </section>

                <section className="shipping-panel" aria-labelledby="shipping-items-title">
                  <div className="shipping-panel__heading">
                    <div><p>Order contents</p><h2 id="shipping-items-title">Your surprise bags</h2></div>
                  </div>
                  <div className="shipping-items">
                    {order.items.map((item) => (
                      <div key={item.id}><div><span>{item.quantity} x</span><strong>{item.bagNameSnapshot}</strong></div><span>{formatOrderPrice(item.subtotal)}</span></div>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="shipping-summary" aria-labelledby="shipping-summary-title">
                <p>Order summary</p>
                <h2 id="shipping-summary-title">{formatOrderPrice(order.totalAmount)}</h2>
                <div><span>Subtotal</span><strong>{formatOrderPrice(order.totalAmount - order.deliveryFee + order.voucherDiscount)}</strong></div>
                <div><span>Delivery fee</span><strong>{order.deliveryFee ? formatOrderPrice(order.deliveryFee) : "Free"}</strong></div>
                <div><span>Voucher discount</span><strong>{order.voucherDiscount ? `- ${formatOrderPrice(order.voucherDiscount)}` : "-"}</strong></div>
                <div className="shipping-summary__total"><span>Total</span><strong>{formatOrderPrice(order.totalAmount)}</strong></div>
                <Link href="/products" className="btn btn-primary">Find more bags</Link>
              </aside>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
