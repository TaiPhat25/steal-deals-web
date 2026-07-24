"use client";

import { useState } from "react";
import { DashboardButton, StatusBadge } from "@/components/dashboard/ui";
import { DashboardDialog } from "@/components/dashboard/Dialog";

type OrderStatus = "Pending" | "Processing" | "Completed";
type Order = { id: number; customerId: number; date: string; items: number; price: number; status: OrderStatus };
const ORDERS: Order[] = Array.from({ length: 12 }, (_, index) => ({
  id: 254830 + index,
  customerId: 57390 + index,
  date: `${12 + (index % 5)} Sept, 2027`,
  items: index % 5 + 1,
  price: (index % 5 + 1) * 20,
  status: index % 4 === 3 ? "Completed" : index % 2 ? "Processing" : "Pending",
}));
const PAGE_SIZE = 5;

export default function RecentOrders() {
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<Order | null>(null);
  const totalPages = Math.ceil(ORDERS.length / PAGE_SIZE);
  const rows = ORDERS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <div className="mt-4 w-full rounded-2xl border border-gray-500/20 sm:mt-6">
        <div className="px-6 py-4"><h3 className="text-lg font-bold">Recent Orders</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-y border-gray-500/20 text-left"><th className="p-3 pl-5">Order ID</th><th className="p-3">Customer ID</th><th className="p-3">Order Date</th><th className="p-3">Items</th><th className="p-3">Price</th><th className="p-3">Status</th><th className="p-3 pr-5 text-right">Action</th></tr></thead>
            <tbody>{rows.map((order) => <tr key={order.id} className="border-b border-gray-500/20 last:border-0 hover:bg-gray-50/50"><td className="p-3 pl-5">#{order.id}</td><td className="p-3">#{order.customerId}</td><td className="p-3">{order.date}</td><td className="p-3">{order.items}</td><td className="p-3">${order.price}</td><td className="p-3"><StatusBadge tone={order.status === "Completed" ? "success" : order.status === "Processing" ? "info" : "warning"}>{order.status}</StatusBadge></td><td className="p-3 pr-5 text-right"><button type="button" onClick={() => setActive(order)} className="h-8 rounded-lg px-3 font-semibold text-primary hover:bg-primary-lighter">View</button></td></tr>)}</tbody>
          </table>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-500/20 p-4 sm:px-6"><button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage(page - 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40">‹</button><span className="px-2 text-sm font-semibold leading-8">Page {page} of {totalPages}</span><button type="button" aria-label="Next page" disabled={page === totalPages} onClick={() => setPage(page + 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40">›</button></div>
      </div>
      {active && <DashboardDialog title={`Order #${active.id}`} onClose={() => setActive(null)}><dl className="grid grid-cols-[120px_1fr] gap-3 p-5 text-sm sm:p-6"><dt className="text-light-secondary-text">Customer</dt><dd>#{active.customerId}</dd><dt className="text-light-secondary-text">Order date</dt><dd>{active.date}</dd><dt className="text-light-secondary-text">Items</dt><dd>{active.items}</dd><dt className="text-light-secondary-text">Price</dt><dd>${active.price}</dd><dt className="text-light-secondary-text">Status</dt><dd><StatusBadge tone={active.status === "Completed" ? "success" : active.status === "Processing" ? "info" : "warning"}>{active.status}</StatusBadge></dd></dl><footer className="flex justify-end border-t border-gray-500/20 p-4 sm:px-6"><DashboardButton variant="secondary" onClick={() => setActive(null)}>Close</DashboardButton></footer></DashboardDialog>}
    </>
  );
}
