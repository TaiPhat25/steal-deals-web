"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DashboardButton, DashboardCard, ProductImage, StatusBadge } from "@/components/dashboard/ui";
import { DashboardDialog, DashboardToast, DialogActions } from "@/components/dashboard/Dialog";
import { DEMO_CUSTOMER_NAMES, useSellerDemo, type OrderStatus } from "@/components/seller/SellerDemoProvider";

const money = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
const dateTime = (value: string | null) => value ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Not set";
const tone = (status: OrderStatus) => status === "Confirmed" ? "success" : status === "Pending" ? "warning" : "error";

function OrderDetailsContent() {
  const id = useSearchParams().get("id");
  const { orders, setOrders } = useSellerDemo();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [toast, setToast] = useState("");
  const order = orders.find((item) => item.id === id);
  if (!order) return <DashboardCard className="p-8 text-center"><h1 className="text-xl font-bold">Order not found</h1><p className="mt-2 text-sm text-light-secondary-text">The selected dummy order does not exist.</p><Link href="/seller/orders" className="mt-5 inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-bold text-white">Back to orders</Link></DashboardCard>;
  const currentOrder = order;

  function changeStatus(status: OrderStatus) {
    setOrders((items) => items.map((item) => item.id === currentOrder.id ? { ...item, status, updatedAt: new Date().toISOString() } : item));
    setConfirmCancel(false);
    setToast(`Order ${currentOrder.id.slice(0, 8)} marked ${status}.`);
  }

  return (
    <>
      {toast && <DashboardToast key={toast}>{toast}</DashboardToast>}
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div><Link href="/seller/orders" className="text-sm font-semibold text-primary hover:underline">← Back to orders</Link><h1 className="mt-2 text-xl font-bold">Order #{order.id.slice(0, 8)}</h1></div>
          {order.status === "Pending" && <div className="flex gap-3"><DashboardButton variant="danger" onClick={() => setConfirmCancel(true)}>Cancel order</DashboardButton><DashboardButton onClick={() => changeStatus("Confirmed")}>Confirm order</DashboardButton></div>}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <DashboardCard className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-500/20 p-4 sm:px-6"><h2 className="font-bold">Bag items</h2><StatusBadge tone={tone(order.status)}>{order.status}</StatusBadge></div>
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-100 text-left"><tr><th className="p-3 pl-5">Bag</th><th className="p-3">Unit price</th><th className="p-3">Quantity</th><th className="p-3 pr-5 text-right">Subtotal</th></tr></thead><tbody>{order.items.map((item) => <tr key={item.id} className="border-t border-gray-500/20"><td className="p-3 pl-5"><div className="flex items-center gap-3"><span className="size-10 overflow-hidden rounded-xl"><ProductImage alt="" /></span><div><strong className="block">{item.bagNameSnapshot}</strong><span className="font-mono text-xs text-light-secondary-text">{item.bagId.slice(0, 8)}…</span></div></div></td><td className="p-3">{money(item.unitPriceSnapshot)}</td><td className="p-3">{item.quantity}</td><td className="p-3 pr-5 text-right font-semibold">{money(item.subtotal)}</td></tr>)}</tbody></table></div>
            <div className="flex justify-end border-t border-gray-500/20 p-4 sm:px-6"><dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm"><dt className="text-light-secondary-text">Delivery fee</dt><dd className="text-right">{money(order.deliveryFee)}</dd><dt className="text-light-secondary-text">Voucher discount</dt><dd className="text-right">−{money(order.voucherDiscount)}</dd><dt className="font-semibold">Total</dt><dd className="text-right text-lg font-bold">{money(order.totalAmount)}</dd></dl></div>
          </DashboardCard>
          <div className="space-y-6">
            <DashboardCard className="p-5"><h2 className="font-bold">Fulfillment</h2>{order.pickupCode && <div className="mt-4 rounded-2xl bg-primary-lighter p-5 text-center"><p className="text-xs font-semibold uppercase tracking-wide text-primary">Pickup code</p><p className="mt-2 text-3xl font-bold tracking-[0.3em]">{order.pickupCode}</p></div>}<dl className="mt-4 grid grid-cols-[110px_1fr] gap-3 text-sm"><dt className="text-light-secondary-text">Type</dt><dd>{order.deliveryType}</dd><dt className="text-light-secondary-text">Deadline</dt><dd>{dateTime(order.pickupDeadline)}</dd><dt className="text-light-secondary-text">Address</dt><dd>{order.deliveryAddress}</dd></dl></DashboardCard>
            <DashboardCard className="p-5"><h2 className="font-bold">Record</h2><dl className="mt-4 grid grid-cols-[90px_1fr] gap-3 text-sm"><dt className="text-light-secondary-text">Customer</dt><dd>{DEMO_CUSTOMER_NAMES[order.userId] ?? "Unknown customer"}</dd><dt className="text-light-secondary-text">Created</dt><dd>{dateTime(order.createdAt)}</dd><dt className="text-light-secondary-text">Updated</dt><dd>{dateTime(order.updatedAt)}</dd></dl></DashboardCard>
          </div>
        </div>
      </div>
      {confirmCancel && <DashboardDialog title={`Cancel order #${order.id.slice(0, 8)}?`} onClose={() => setConfirmCancel(false)}><p className="p-5 text-sm leading-6 text-light-secondary-text sm:p-6">This changes the local order status to the backend&apos;s current <strong>Cancelled</strong> spelling.</p><DialogActions onCancel={() => setConfirmCancel(false)}><DashboardButton variant="danger" onClick={() => changeStatus("Cancelled")}>Cancel order</DashboardButton></DialogActions></DashboardDialog>}
    </>
  );
}

export default function OrderDetails() {
  return <Suspense fallback={null}><OrderDetailsContent /></Suspense>;
}
