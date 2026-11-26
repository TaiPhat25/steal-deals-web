"use client";

import Link from "next/link";
import { DashboardCard, StatusBadge } from "@/components/dashboard/ui";
import { useSellerDemo } from "@/components/seller/SellerDemoProvider";
import { unitsExpiringToday } from "@/lib/seller-dashboard";

const money = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
const time = (value: string | null) => value ? new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "No deadline";

export default function SellerDashboard() {
  const {
    products,
    orders,
    settings,
    settingsLoading,
    settingsDemoReason,
    productsLoading,
    productsDemoReason,
    ordersLoading,
    ordersDemoReason,
    ordersError,
    retryApi,
  } = useSellerDemo();
  const loading = settingsLoading || productsLoading || ordersLoading;
  const demoReason = settingsDemoReason || productsDemoReason || ordersDemoReason;
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

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm text-light-secondary-text">Welcome back to</p><h1 className="text-2xl font-bold">{settings.name}</h1></div><Link href="/seller/products/add" className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-bold text-white hover:bg-primary-dark">+ Create surprise bag</Link></div>
        {loading && <div role="status" className="rounded-xl bg-white px-4 py-3 text-sm text-light-secondary-text">Loading seller dashboard…</div>}
        {demoReason && <div role="status" className="flex flex-col gap-3 rounded-xl bg-warning/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"><p><strong>Demo data active.</strong> {demoReason}</p><button type="button" onClick={retryApi} className="h-8 shrink-0 rounded-full px-3 font-semibold text-warning-dark hover:bg-warning/15">Retry API</button></div>}
        {ordersError && <div role="alert" className="rounded-xl bg-error-alpha-16 px-4 py-3 text-sm text-error-dark">{ordersError} <button type="button" onClick={retryApi} className="font-semibold underline">Retry</button></div>}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">{metrics.map(([label, value, color]) => <DashboardCard key={label} className={`${color} p-4`}><p className="text-sm font-semibold text-light-secondary-text">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></DashboardCard>)}</div>
        <div className="grid gap-6 xl:grid-cols-2">
          <DashboardCard className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-500/20 p-4 sm:px-6"><div><h2 className="font-bold">Confirmed pickups</h2><p className="mt-1 text-xs text-light-secondary-text">Orders currently ready for the store&apos;s pickup flow.</p></div><Link href="/seller/orders" className="text-sm font-semibold text-primary">All orders</Link></div>
            <div>{confirmed.length ? confirmed.map((order) => <Link key={order.id} href={`/seller/orders/details?id=${order.id}`} className="flex items-center justify-between gap-4 border-b border-gray-500/20 p-4 last:border-0 hover:bg-gray-50 sm:px-6"><div><strong className="block">#{order.id.slice(0, 8)}</strong><span className="text-xs text-light-secondary-text">{time(order.pickupDeadline)} · Code {order.pickupCode ?? "not issued"}</span></div><StatusBadge tone="success">{order.status}</StatusBadge></Link>) : <p className="p-8 text-center text-sm text-light-secondary-text">No confirmed pickups.</p>}</div>
          </DashboardCard>
          <DashboardCard className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-500/20 p-4 sm:px-6"><h2 className="font-bold">Recent orders</h2><Link href="/seller/orders" className="text-sm font-semibold text-primary">Manage orders</Link></div>
            <div>{orders.slice(0, 5).map((order) => <div key={order.id} className="flex items-center justify-between gap-4 border-b border-gray-500/20 p-4 last:border-0 sm:px-6"><Link href={`/seller/orders/details?id=${order.id}`} className="min-w-0 hover:text-primary"><strong className="block">#{order.id.slice(0, 8)}</strong><span className="text-xs text-light-secondary-text">{order.items.length} bag type{order.items.length === 1 ? "" : "s"} · {money(order.totalAmount)}</span></Link><div className="flex shrink-0 items-center gap-3"><StatusBadge tone={order.status === "Confirmed" ? "success" : order.status === "Pending" ? "warning" : "error"}>{order.status === "NoShow" ? "No show" : order.status}</StatusBadge><Link href={`/seller/orders/details?id=${order.id}`} className="text-sm font-semibold text-primary">Manage</Link></div></div>)}</div>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
