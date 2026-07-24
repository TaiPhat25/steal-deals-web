"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar, DashboardButton, DashboardCard, StatusBadge } from "@/components/dashboard/ui";
import { useSellerDemo, type OrderStatus } from "@/components/seller/SellerDemoProvider";

const PAGE_SIZE = 4;
const amount = (items: Array<{ quantity: number; price: number }>) => items.reduce((sum, item) => sum + item.quantity * item.price, 0);
const tone = (status: OrderStatus) => status === "Completed" ? "success" : status === "Cancelled" ? "error" : status === "Ready for pickup" ? "warning" : "info";

export default function SellerOrders() {
  const { orders } = useSellerDemo();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [payment, setPayment] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const stats = ["New", "Confirmed", "Ready for pickup", "Completed", "Cancelled"].map((item) => ({ label: item, value: orders.filter((order) => order.status === item).length }));
  const filtered = useMemo(() => orders.filter((order) => {
    const query = search.trim().toLowerCase();
    return (!query || `${order.id} ${order.customer} ${order.email}`.toLowerCase().includes(query))
      && (!status || order.status === status)
      && (!payment || order.paymentStatus === payment)
      && (!date || order.date === date);
  }), [date, orders, payment, search, status]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetPage() {
    setPage(1);
  }

  function exportCsv() {
    const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const csv = [["Order", "Customer", "Items", "Amount", "Payment", "Status", "Date"], ...filtered.map((order) => [order.id, order.customer, order.items.reduce((sum, item) => sum + item.quantity, 0), amount(order.items), order.paymentStatus, order.status, order.date])].map((row) => row.map(escape).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "seller-orders.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{stats.map((stat, index) => <DashboardCard key={stat.label} className={`p-4 ${["bg-accent-5/60", "bg-accent-2/60", "bg-accent-1/60", "bg-accent-4/60", "bg-accent-6/60"][index]}`}><p className="text-sm font-semibold text-light-secondary-text">{stat.label}</p><p className="mt-2 text-2xl font-bold">{stat.value}</p></DashboardCard>)}</div>
      <DashboardCard className="w-full overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4"><div><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">Pickup workflow</p><h1 className="text-xl font-bold">Orders</h1></div><DashboardButton onClick={exportCsv}>Export CSV</DashboardButton></div>
          <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><label className="relative w-full lg:w-72"><span className="sr-only">Search orders</span><span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-secondary-text">⌕</span><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); resetPage(); }} placeholder="Search order or customer..." className="h-9 w-full rounded-full border-none bg-gray-100 pl-9 pr-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" /></label><div className="flex flex-wrap gap-3"><select aria-label="Fulfillment status" value={status} onChange={(event) => { setStatus(event.target.value as OrderStatus | ""); resetPage(); }} className="h-9 rounded-full border-none bg-gray-100 px-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"><option value="">All statuses</option><option>New</option><option>Confirmed</option><option>Ready for pickup</option><option>Completed</option><option>Cancelled</option></select><select aria-label="Payment status" value={payment} onChange={(event) => { setPayment(event.target.value); resetPage(); }} className="h-9 rounded-full border-none bg-gray-100 px-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"><option value="">All payments</option><option>Paid</option><option>Pending</option></select><input aria-label="Order date" type="date" value={date} onChange={(event) => { setDate(event.target.value); resetPage(); }} className="h-9 rounded-full border-none bg-gray-100 px-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" />{(search || status || payment || date) && <button type="button" onClick={() => { setSearch(""); setStatus(""); setPayment(""); setDate(""); resetPage(); }} className="h-9 rounded-full px-3 text-sm font-semibold text-primary hover:bg-primary-lighter">Clear</button>}</div></div>
        </div>
        <div className="overflow-x-auto border-t border-gray-500/20"><table className="w-full text-sm"><thead className="bg-gray-100 text-left"><tr><th className="p-3 pl-5">Order</th><th className="p-3">Customer</th><th className="p-3">Items</th><th className="p-3">Amount</th><th className="p-3">Payment</th><th className="p-3">Status</th><th className="p-3">Date</th><th className="p-3 pr-5 text-right">Action</th></tr></thead><tbody>{rows.map((order) => <tr key={order.id} className="border-t border-gray-500/20 hover:bg-gray-50/50"><td className="p-3 pl-5 font-semibold">{order.id}</td><td className="p-3"><div className="flex items-center gap-3"><Avatar name={order.customer} size="sm" /><div><strong className="block">{order.customer}</strong><span className="text-xs text-light-secondary-text">{order.email}</span></div></div></td><td className="p-3">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td><td className="p-3 font-semibold">${amount(order.items).toFixed(2)}</td><td className="p-3"><StatusBadge tone={order.paymentStatus === "Paid" ? "success" : "warning"}>{order.paymentStatus}</StatusBadge></td><td className="p-3"><StatusBadge tone={tone(order.status)}>{order.status}</StatusBadge></td><td className="p-3">{order.date}</td><td className="p-3 pr-5 text-right"><Link href={`/seller/orders/details?id=${order.id}`} className="inline-flex h-8 items-center rounded-lg px-3 font-semibold text-primary hover:bg-primary-lighter">Manage</Link></td></tr>)}</tbody></table>{rows.length === 0 && <div className="px-4 py-14 text-center text-sm text-light-secondary-text">No orders match these filters.</div>}</div>
        <div className="flex items-center justify-between border-t border-gray-500/20 p-4 sm:px-6"><span className="text-sm text-light-secondary-text">{filtered.length} orders</span><div className="flex items-center gap-2"><button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage(page - 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40">‹</button><span className="text-sm font-semibold">Page {page} of {totalPages}</span><button type="button" aria-label="Next page" disabled={page === totalPages} onClick={() => setPage(page + 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40">›</button></div></div>
      </DashboardCard>
    </div>
  );
}
