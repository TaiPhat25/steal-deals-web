"use client";

import { useState } from "react";
import { DashboardButton, DashboardCard, StatusBadge } from "@/components/dashboard/ui";
import { DashboardDialog } from "@/components/dashboard/Dialog";
import type { OrderResponse } from "@/lib/api/dashboard-types";

const statuses = ["Pending", "Confirmed", "InventoryReservationFailed", "PaymentFailed", "Cancelled"] as const;
const ORDERS: OrderResponse[] = Array.from({ length: 12 }, (_, index) => {
  const number = String(index + 1).padStart(12, "0");
  const quantity = index % 3 + 1;
  const subtotal = quantity * 60000;
  return {
    id: `40000000-0000-0000-0000-${number}`,
    userId: `50000000-0000-0000-0000-${number}`,
    storeId: `20000000-0000-0000-0000-${number}`,
    storeNameSnapshot: ["Daily Basket", "Fresh Corner", "Sunrise Bakery"][index % 3],
    contactNameSnapshot: ["Linh Nguyen", "Daniel Lee", "Mai Tran"][index % 3],
    contactPhoneSnapshot: `+84 901 100 ${String(index + 1).padStart(3, "0")}`,
    deliveryFee: 0,
    voucherDiscount: index % 2 ? 10000 : 0,
    totalAmount: subtotal - (index % 2 ? 10000 : 0),
    deliveryType: "Pickup",
    deliveryAddress: "Ho Chi Minh City",
    pickupCode: index % 5 === 0 ? null : String(5821 + index),
    status: statuses[index % statuses.length],
    pickupDeadline: `2026-07-${String(30 - index % 3).padStart(2, "0")}T18:30:00+07:00`,
    createdAt: `2026-07-${String(30 - index % 6).padStart(2, "0")}T09:15:00+07:00`,
    updatedAt: `2026-07-${String(30 - index % 6).padStart(2, "0")}T09:20:00+07:00`,
    items: [{
      id: `60000000-0000-0000-0000-${number}`,
      bagId: `30000000-0000-0000-0000-${number}`,
      bagNameSnapshot: "Bakery Surprise Bag",
      unitPriceSnapshot: 60000,
      quantity,
      subtotal,
    }],
  };
});
const PAGE_SIZE = 5;
const money = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
const date = (value: string) => new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
const tone = (status: string) => status === "Confirmed" ? "success" : status === "Pending" ? "warning" : "error";

export default function RecentOrders() {
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<OrderResponse | null>(null);
  const totalPages = Math.ceil(ORDERS.length / PAGE_SIZE);
  const rows = ORDERS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <DashboardCard className="w-full overflow-hidden">
        <div className="px-4 py-4 sm:px-6"><h2 className="text-lg font-bold">Recent orders</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm"><thead><tr className="border-y border-gray-500/20 bg-gray-100 text-left"><th className="p-3 pl-5">No.</th><th className="p-3">Store snapshot</th><th className="p-3">Created</th><th className="p-3">Items</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3 pr-5 text-right">Action</th></tr></thead>
            <tbody>{rows.map((order, index) => <tr key={order.id} className="border-b border-gray-500/20 last:border-0 hover:bg-gray-50/50"><td className="p-3 pl-5 text-light-secondary-text">{(page - 1) * PAGE_SIZE + index + 1}</td><td className="p-3">{order.storeNameSnapshot}</td><td className="p-3">{date(order.createdAt)}</td><td className="p-3">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td><td className="p-3">{money(order.totalAmount)}</td><td className="p-3"><StatusBadge tone={tone(order.status)}>{order.status}</StatusBadge></td><td className="p-3 pr-5 text-right"><button type="button" onClick={() => setActive(order)} className="h-8 rounded-lg px-3 font-semibold text-primary hover:bg-primary-lighter">View</button></td></tr>)}</tbody>
          </table>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-500/20 p-4 sm:px-6"><button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage(page - 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40">‹</button><span className="px-2 text-sm font-semibold leading-8">Page {page} of {totalPages}</span><button type="button" aria-label="Next page" disabled={page === totalPages} onClick={() => setPage(page + 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40">›</button></div>
      </DashboardCard>
      {active && <DashboardDialog title={`Order #${active.id.slice(-8)}`} onClose={() => setActive(null)}><dl className="grid grid-cols-[120px_1fr] gap-3 p-5 text-sm sm:p-6"><dt className="text-light-secondary-text">User ID</dt><dd className="break-all font-mono text-xs">{active.userId}</dd><dt className="text-light-secondary-text">Store ID</dt><dd className="break-all font-mono text-xs">{active.storeId}</dd><dt className="text-light-secondary-text">Store snapshot</dt><dd>{active.storeNameSnapshot}</dd><dt className="text-light-secondary-text">Created</dt><dd>{date(active.createdAt)}</dd><dt className="text-light-secondary-text">Delivery</dt><dd>{active.deliveryType}</dd><dt className="text-light-secondary-text">Total</dt><dd>{money(active.totalAmount)}</dd><dt className="text-light-secondary-text">Status</dt><dd><StatusBadge tone={tone(active.status)}>{active.status}</StatusBadge></dd></dl><footer className="flex justify-end border-t border-gray-500/20 p-4 sm:px-6"><DashboardButton variant="secondary" onClick={() => setActive(null)}>Close</DashboardButton></footer></DashboardDialog>}
    </>
  );
}
