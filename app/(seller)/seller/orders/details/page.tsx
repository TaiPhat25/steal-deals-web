"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Avatar, DashboardButton, DashboardCard, ProductImage, StatusBadge } from "@/components/dashboard/ui";
import { DashboardDialog, DashboardToast, DialogActions } from "@/components/dashboard/Dialog";
import { useSellerDemo, type OrderStatus } from "@/components/seller/SellerDemoProvider";

const amount = (items: Array<{ quantity: number; price: number }>) => items.reduce((sum, item) => sum + item.quantity * item.price, 0);

function OrderDetailsContent() {
  const id = useSearchParams().get("id");
  const { orders, setOrders } = useSellerDemo();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [toast, setToast] = useState("");
  const order = orders.find((item) => item.id === id);
  if (!order) return <DashboardCard className="p-8 text-center"><h1 className="text-xl font-bold">Order not found</h1><p className="mt-2 text-sm text-light-secondary-text">The selected dummy order does not exist.</p><Link href="/seller/orders" className="mt-5 inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-bold text-white">Back to orders</Link></DashboardCard>;
  const orderId = order.id;
  const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = { New: "Confirmed", Confirmed: "Ready for pickup", "Ready for pickup": "Completed" };

  function changeStatus(status: OrderStatus) {
    setOrders((items) => items.map((item) => item.id === orderId ? { ...item, status } : item));
    setConfirmCancel(false);
    setToast(`Order ${orderId} marked ${status.toLowerCase()}.`);
  }

  return (
    <>
      {toast && <DashboardToast key={toast}>{toast}</DashboardToast>}
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><Link href="/seller/orders" className="text-sm font-semibold text-primary hover:underline">← Back to orders</Link><h1 className="mt-2 text-xl font-bold">Order {order.id}</h1></div><div className="flex gap-3">{order.status !== "Cancelled" && order.status !== "Completed" && <DashboardButton variant="danger" onClick={() => setConfirmCancel(true)}>Cancel order</DashboardButton>}{nextStatus[order.status] && <DashboardButton onClick={() => changeStatus(nextStatus[order.status]!)}>{nextStatus[order.status] === "Confirmed" ? "Confirm order" : nextStatus[order.status] === "Ready for pickup" ? "Mark ready" : "Complete pickup"}</DashboardButton>}</div></div>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <DashboardCard className="overflow-hidden"><div className="flex items-center justify-between border-b border-gray-500/20 p-4 sm:px-6"><h2 className="font-bold">Bag items</h2><StatusBadge tone={order.status === "Completed" ? "success" : order.status === "Cancelled" ? "error" : "info"}>{order.status}</StatusBadge></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-100 text-left"><tr><th className="p-3 pl-5">Bag</th><th className="p-3">Quantity</th><th className="p-3 pr-5 text-right">Subtotal</th></tr></thead><tbody>{order.items.map((item) => <tr key={item.productId} className="border-t border-gray-500/20"><td className="p-3 pl-5"><div className="flex items-center gap-3"><span className="size-10 overflow-hidden rounded-xl"><ProductImage alt="" /></span><strong>{item.name}</strong></div></td><td className="p-3">{item.quantity}</td><td className="p-3 pr-5 text-right font-semibold">${(item.quantity * item.price).toFixed(2)}</td></tr>)}</tbody></table></div><div className="flex justify-end border-t border-gray-500/20 p-4 sm:px-6"><dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm"><dt className="text-light-secondary-text">Total</dt><dd className="text-right text-lg font-bold">${amount(order.items).toFixed(2)}</dd><dt className="text-light-secondary-text">Payment</dt><dd className="text-right"><StatusBadge tone={order.paymentStatus === "Paid" ? "success" : "warning"}>{order.paymentStatus}</StatusBadge></dd></dl></div></DashboardCard>
          <div className="space-y-6"><DashboardCard className="p-5"><h2 className="font-bold">Pickup</h2><div className="mt-4 rounded-2xl bg-primary-lighter p-5 text-center"><p className="text-xs font-semibold uppercase tracking-wide text-primary">Pickup code</p><p className="mt-2 text-3xl font-bold tracking-[0.3em]">{order.pickupCode}</p></div><dl className="mt-4 grid grid-cols-[100px_1fr] gap-3 text-sm"><dt className="text-light-secondary-text">Window</dt><dd>{order.pickupWindow}</dd><dt className="text-light-secondary-text">Date</dt><dd>{order.date}</dd></dl></DashboardCard><DashboardCard className="p-5"><h2 className="font-bold">Customer</h2><div className="mt-4 flex items-center gap-3"><Avatar name={order.customer} /><div><strong className="block">{order.customer}</strong><span className="text-xs text-light-secondary-text">{order.email}</span></div></div></DashboardCard></div>
        </div>
      </div>
      {confirmCancel && <DashboardDialog title={`Cancel ${order.id}?`} onClose={() => setConfirmCancel(false)}><p className="p-5 text-sm leading-6 text-light-secondary-text sm:p-6">This changes the local order to Cancelled. Completed and cancelled orders cannot transition again.</p><DialogActions onCancel={() => setConfirmCancel(false)}><DashboardButton variant="danger" onClick={() => changeStatus("Cancelled")}>Cancel order</DashboardButton></DialogActions></DashboardDialog>}
    </>
  );
}

export default function OrderDetails() {
  return <Suspense fallback={null}><OrderDetailsContent /></Suspense>;
}
