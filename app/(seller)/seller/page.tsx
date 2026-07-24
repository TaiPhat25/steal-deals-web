"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardButton, DashboardCard, StatusBadge } from "@/components/dashboard/ui";
import { DashboardToast } from "@/components/dashboard/Dialog";
import { useSellerDemo, type OrderStatus } from "@/components/seller/SellerDemoProvider";

const amount = (items: Array<{ quantity: number; price: number }>) => items.reduce((sum, item) => sum + item.quantity * item.price, 0);

export default function SellerDashboard() {
  const { products, orders, setOrders, settings } = useSellerDemo();
  const [toast, setToast] = useState("");
  const activeBags = products.filter((product) => product.status === "Active").length;
  const soldOut = products.filter((product) => product.status === "Sold out").length;
  const newOrders = orders.filter((order) => order.status === "New").length;
  const pendingPickups = orders.filter((order) => order.status === "Confirmed" || order.status === "Ready for pickup").length;
  const completed = orders.filter((order) => order.status === "Completed").length;
  const revenue = orders.filter((order) => order.status === "Completed").reduce((sum, order) => sum + amount(order.items), 0);
  const pickups = orders.filter((order) => order.status === "Confirmed" || order.status === "Ready for pickup");
  const metrics = [["Active bags", activeBags, "bg-accent-1/60"], ["Sold out", soldOut, "bg-accent-6/60"], ["New orders", newOrders, "bg-accent-2/60"], ["Pending pickups", pendingPickups, "bg-accent-3/60"], ["Completed", completed, "bg-accent-4/60"], ["Revenue", `$${revenue.toFixed(2)}`, "bg-accent-5/60"]] as const;

  function updateOrder(id: string, status: OrderStatus) {
    setOrders((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    setToast(`${id} marked ${status.toLowerCase()}.`);
  }

  return (
    <>
      {toast && <DashboardToast key={toast}>{toast}</DashboardToast>}
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm text-light-secondary-text">Welcome back to</p><h1 className="text-2xl font-bold">{settings.name}</h1></div><Link href="/seller/products/add" className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-bold text-white hover:bg-primary-dark">+ Create surplus bag</Link></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{metrics.map(([label, value, color]) => <DashboardCard key={label} className={`${color} p-4`}><p className="text-sm font-semibold text-light-secondary-text">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></DashboardCard>)}</div>
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <DashboardCard className="overflow-hidden"><div className="flex items-center justify-between border-b border-gray-500/20 p-4 sm:px-6"><div><h2 className="font-bold">Today&apos;s pickup queue</h2><p className="mt-1 text-xs text-light-secondary-text">Confirm handoff-ready orders from here.</p></div><Link href="/seller/orders" className="text-sm font-semibold text-primary">All orders</Link></div><div>{pickups.length ? pickups.map((order) => <div key={order.id} className="flex flex-col gap-3 border-b border-gray-500/20 p-4 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><strong className="block">{order.customer}</strong><span className="text-xs text-light-secondary-text">{order.id} · {order.pickupWindow} · Code {order.pickupCode}</span></div><div className="flex items-center gap-2"><StatusBadge tone={order.status === "Ready for pickup" ? "warning" : "info"}>{order.status}</StatusBadge>{order.status === "Confirmed" ? <DashboardButton onClick={() => updateOrder(order.id, "Ready for pickup")}>Mark ready</DashboardButton> : <DashboardButton onClick={() => updateOrder(order.id, "Completed")}>Complete</DashboardButton>}</div></div>) : <p className="p-8 text-center text-sm text-light-secondary-text">No pickups are waiting.</p>}</div></DashboardCard>
          <DashboardCard className="overflow-hidden"><div className="flex items-center justify-between border-b border-gray-500/20 p-4 sm:px-6"><h2 className="font-bold">Recent orders</h2><Link href="/seller/orders" className="text-sm font-semibold text-primary">Manage orders</Link></div><div>{orders.slice(0, 5).map((order) => <Link key={order.id} href={`/seller/orders/details?id=${order.id}`} className="flex items-center justify-between gap-4 border-b border-gray-500/20 p-4 last:border-0 hover:bg-gray-50 sm:px-6"><div><strong className="block">{order.id}</strong><span className="text-xs text-light-secondary-text">{order.customer} · {order.items.length} bag type{order.items.length === 1 ? "" : "s"}</span></div><div className="text-right"><strong className="block">${amount(order.items).toFixed(2)}</strong><span className="text-xs text-light-secondary-text">{order.status}</span></div></Link>)}</div></DashboardCard>
        </div>
      </div>
    </>
  );
}
