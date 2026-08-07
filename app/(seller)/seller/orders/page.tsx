"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DashboardButton, DashboardCard, StatusBadge } from "@/components/dashboard/ui";
import { useSellerDemo, type OrderStatus } from "@/components/seller/SellerDemoProvider";

const PAGE_SIZE = 4;
const STATUSES: OrderStatus[] = ["Pending", "Confirmed", "InventoryReservationFailed", "PaymentFailed", "Cancelled"];
const labels: Record<OrderStatus, string> = {
  Pending: "Pending",
  Confirmed: "Confirmed",
  InventoryReservationFailed: "Inventory failed",
  PaymentFailed: "Payment failed",
  Cancelled: "Cancelled",
};
const tone = (status: OrderStatus) => status === "Confirmed" ? "success" : status === "Pending" ? "warning" : "error";
const money = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
const date = (value: string) => new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));

export default function SellerOrders() {
  const { orders } = useSellerDemo();
  const [view, setView] = useState<"today" | "history">("today");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [createdDate, setCreatedDate] = useState("");
  const [page, setPage] = useState(1);
  const visibleOrders = useMemo(() => view === "history" ? orders : orders.filter((order) => new Date(order.createdAt).toDateString() === new Date().toDateString()), [orders, view]);
  const stats = STATUSES.map((item) => ({ label: labels[item], value: visibleOrders.filter((order) => order.status === item).length }));
  const filtered = useMemo(() => visibleOrders.filter((order) => {
    const query = search.trim().toLowerCase();
    return (!query || `${order.id} ${order.userId} ${order.storeNameSnapshot}`.toLowerCase().includes(query))
      && (!status || order.status === status)
      && (!createdDate || order.createdAt.slice(0, 10) === createdDate);
  }), [createdDate, search, status, visibleOrders]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function exportCsv() {
    const escape = (value: string | number | null) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [
      ["id", "userId", "storeId", "items", "totalAmount", "deliveryType", "pickupCode", "status", "createdAt"],
      ...filtered.map((order) => [order.id, order.userId, order.storeId, order.items.length, order.totalAmount, order.deliveryType, order.pickupCode, order.status, order.createdAt]),
    ].map((row) => row.map(escape).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "seller-orders.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function changeView(next: "today" | "history") {
    setView(next);
    setSearch("");
    setStatus("");
    setCreatedDate("");
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{stats.map((stat, index) => <DashboardCard key={stat.label} className={`p-4 ${["bg-accent-5/60", "bg-accent-2/60", "bg-accent-1/60", "bg-accent-4/60", "bg-accent-6/60"][index]}`}><p className="text-sm font-semibold text-light-secondary-text">{stat.label}</p><p className="mt-2 text-2xl font-bold">{stat.value}</p></DashboardCard>)}</div>
      <DashboardCard className="w-full overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4"><div><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">Store orders</p><h1 className="text-xl font-bold">{view === "today" ? "Today’s orders" : "Order history"}</h1></div><DashboardButton onClick={exportCsv}>Export CSV</DashboardButton></div>
          <div aria-label="Order view" className="mt-5 flex w-fit rounded-full bg-gray-100 p-1" role="group">
            {(["today", "history"] as const).map((option) => <button key={option} type="button" aria-pressed={view === option} onClick={() => changeView(option)} className={`h-8 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary ${view === option ? "bg-primary text-white" : "text-light-secondary-text hover:text-gray-900"}`}>{option === "today" ? "Today" : "Order history"}</button>)}
          </div>
          <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative w-full lg:w-80"><span className="sr-only">Search orders</span><span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-secondary-text">⌕</span><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search order or user ID..." className="h-9 w-full rounded-full border-none bg-gray-100 pl-9 pr-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" /></label>
            <div className="flex flex-wrap gap-3"><select aria-label="Order status" value={status} onChange={(event) => { setStatus(event.target.value as OrderStatus | ""); setPage(1); }} className="h-9 rounded-full border-none bg-gray-100 px-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"><option value="">All statuses</option>{STATUSES.map((item) => <option key={item} value={item}>{labels[item]}</option>)}</select>{view === "history" && <input aria-label="Created date" type="date" value={createdDate} onChange={(event) => { setCreatedDate(event.target.value); setPage(1); }} className="h-9 rounded-full border-none bg-gray-100 px-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" />}{(search || status || createdDate) && <button type="button" onClick={() => { setSearch(""); setStatus(""); setCreatedDate(""); setPage(1); }} className="h-9 rounded-full px-3 text-sm font-semibold text-primary hover:bg-primary-lighter">Clear</button>}</div>
          </div>
        </div>
        <div className="overflow-x-auto border-t border-gray-500/20">
          <table className="w-full text-sm"><thead className="bg-gray-100 text-left"><tr><th className="p-3 pl-5">Order</th><th className="p-3">User ID</th><th className="p-3">Items</th><th className="p-3">Total</th><th className="p-3">Delivery</th><th className="p-3">Status</th><th className="p-3">Created</th><th className="p-3 pr-5 text-right">Action</th></tr></thead><tbody>{rows.map((order) => <tr key={order.id} className="border-t border-gray-500/20 hover:bg-gray-50/50"><td className="p-3 pl-5 font-semibold">#{order.id.slice(0, 8)}</td><td className="p-3 font-mono text-xs">{order.userId.slice(0, 8)}…</td><td className="p-3">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td><td className="p-3 font-semibold">{money(order.totalAmount)}</td><td className="p-3">{order.deliveryType}</td><td className="p-3"><StatusBadge tone={tone(order.status)}>{labels[order.status]}</StatusBadge></td><td className="p-3">{date(order.createdAt)}</td><td className="p-3 pr-5 text-right"><Link href={`/seller/orders/details?id=${order.id}`} className="inline-flex h-8 items-center rounded-lg px-3 font-semibold text-primary hover:bg-primary-lighter">Manage</Link></td></tr>)}</tbody></table>
          {rows.length === 0 && <div className="px-4 py-14 text-center text-sm text-light-secondary-text">{view === "today" && !search && !status ? <><p>No orders today.</p><button type="button" onClick={() => changeView("history")} className="mt-3 font-semibold text-primary hover:underline">View order history</button></> : "No orders match these filters."}</div>}
        </div>
        <div className="flex items-center justify-between border-t border-gray-500/20 p-4 sm:px-6"><span className="text-sm text-light-secondary-text">{filtered.length} orders</span><div className="flex items-center gap-2"><button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage(page - 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40">‹</button><span className="text-sm font-semibold">Page {page} of {totalPages}</span><button type="button" aria-label="Next page" disabled={page === totalPages} onClick={() => setPage(page + 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40">›</button></div></div>
      </DashboardCard>
    </div>
  );
}
