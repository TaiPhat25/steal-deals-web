"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardButton, DashboardCard, StatusBadge } from "@/components/dashboard/ui";
import { DashboardToast } from "@/components/dashboard/Dialog";
import { useSellerDemo } from "@/components/seller/SellerDemoProvider";
import { unitsExpiringToday } from "@/lib/seller-dashboard";

const money = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
const time = (value: string | null) => value ? new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "No deadline";

export default function SellerDashboard() {
  const { products, orders, setOrders, settings } = useSellerDemo();
  const [toast, setToast] = useState("");
  const activeBags = products.filter((product) => product.status === "Active").length;
  const remaining = products.reduce((sum, product) => sum + product.quantityRemaining, 0);
  const pendingOrders = orders.filter((order) => order.status === "Pending").length;
  const expiringToday = unitsExpiringToday(products);
  const confirmedValue = orders.filter((order) => order.status === "Confirmed").reduce((sum, order) => sum + order.totalAmount, 0);
  const confirmed = orders.filter((order) => order.status === "Confirmed");
  const metrics = [
    ["Active bags", activeBags, "bg-accent-1/60"],
    ["Units remaining", remaining, "bg-accent-6/60"],
    ["Pending orders", pendingOrders, "bg-accent-2/60"],
    ["Units expiring today", expiringToday, "bg-accent-4/60"],
    ["Confirmed value", money(confirmedValue), "bg-accent-5/60"],
  ] as const;

  function confirmOrder(id: string) {
    setOrders((items) => items.map((item) => item.id === id ? { ...item, status: "Confirmed", updatedAt: new Date().toISOString() } : item));
    setToast(`Order #${id.slice(0, 8)} confirmed.`);
  }

  return (
    <>
      {toast && <DashboardToast key={toast}>{toast}</DashboardToast>}
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm text-light-secondary-text">Welcome back to</p><h1 className="text-2xl font-bold">{settings.name}</h1></div><Link href="/seller/products/add" className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-bold text-white hover:bg-primary-dark">+ Create surplus bag</Link></div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">{metrics.map(([label, value, color]) => <DashboardCard key={label} className={`${color} p-4`}><p className="text-sm font-semibold text-light-secondary-text">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></DashboardCard>)}</div>
        <div className="grid gap-6 xl:grid-cols-2">
          <DashboardCard className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-500/20 p-4 sm:px-6"><div><h2 className="font-bold">Confirmed pickups</h2><p className="mt-1 text-xs text-light-secondary-text">Orders currently ready for the store&apos;s pickup flow.</p></div><Link href="/seller/orders" className="text-sm font-semibold text-primary">All orders</Link></div>
            <div>{confirmed.length ? confirmed.map((order) => <Link key={order.id} href={`/seller/orders/details?id=${order.id}`} className="flex items-center justify-between gap-4 border-b border-gray-500/20 p-4 last:border-0 hover:bg-gray-50 sm:px-6"><div><strong className="block">#{order.id.slice(0, 8)}</strong><span className="text-xs text-light-secondary-text">{time(order.pickupDeadline)} · Code {order.pickupCode ?? "not issued"}</span></div><StatusBadge tone="success">{order.status}</StatusBadge></Link>) : <p className="p-8 text-center text-sm text-light-secondary-text">No confirmed pickups.</p>}</div>
          </DashboardCard>
          <DashboardCard className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-500/20 p-4 sm:px-6"><h2 className="font-bold">Recent orders</h2><Link href="/seller/orders" className="text-sm font-semibold text-primary">Manage orders</Link></div>
            <div>{orders.slice(0, 5).map((order) => <div key={order.id} className="flex items-center justify-between gap-4 border-b border-gray-500/20 p-4 last:border-0 sm:px-6"><Link href={`/seller/orders/details?id=${order.id}`} className="min-w-0 hover:text-primary"><strong className="block">#{order.id.slice(0, 8)}</strong><span className="text-xs text-light-secondary-text">{order.items.length} bag type{order.items.length === 1 ? "" : "s"} · {money(order.totalAmount)}</span></Link>{order.status === "Pending" ? <DashboardButton onClick={() => confirmOrder(order.id)}>Confirm</DashboardButton> : <StatusBadge tone={order.status === "Confirmed" ? "success" : "error"}>{order.status}</StatusBadge>}</div>)}</div>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
