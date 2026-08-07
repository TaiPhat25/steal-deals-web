import Link from "next/link";
import RecentOrders from "@/components/admin/dashboard/RecentOrders";
import Statistics from "@/components/admin/dashboard/Statistics";
import { Avatar, DashboardCard, StatusBadge } from "@/components/dashboard/ui";

const orderStatuses = [
  ["Pending", 18, "bg-warning"],
  ["Confirmed", 72, "bg-success"],
  ["Inventory reservation failed", 4, "bg-error"],
  ["Payment failed", 7, "bg-error"],
  ["Cancelled", 8, "bg-gray-400"],
] as const;

const pendingSellers = [
  { name: "Linh Nguyen", store: "Green Table", category: "Prepared meals", submitted: "Jul 20, 2026" },
  { name: "Mai Tran", store: "Fruitful Day", category: "Produce", submitted: "Jul 18, 2026" },
] as const;

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">Marketplace snapshot</p>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>
      <Statistics />
      <DashboardCard className="overflow-hidden">
        <div className="border-b border-gray-500/20 px-4 py-4 sm:px-6"><h2 className="text-lg font-bold">Order status</h2><p className="mt-1 text-sm text-light-secondary-text">Current backend-created and handled status spellings.</p></div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-5">{orderStatuses.map(([label, count, color]) => <div key={label} className="rounded-xl bg-gray-50 p-4"><div className="flex items-center gap-2"><span className={`size-2.5 rounded-full ${color}`} /><span className="text-sm text-light-secondary-text">{label}</span></div><strong className="mt-2 block text-2xl">{count}</strong></div>)}</div>
      </DashboardCard>
      <DashboardCard className="overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-gray-500/20 px-4 py-4 sm:px-6">
          <div><h2 className="text-lg font-bold">Sellers waiting for approval</h2><p className="mt-1 text-sm text-light-secondary-text">Future-only dummy onboarding applications.</p></div>
          <Link href="/admin/sellers?tab=applications" className="shrink-0 text-sm font-bold text-primary hover:text-primary-dark focus-visible:rounded focus-visible:ring-2 focus-visible:ring-primary">Review all →</Link>
        </div>
        <ul className="divide-y divide-gray-500/20">
          {pendingSellers.map((seller) => (
            <li key={seller.store} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
              <div className="flex min-w-0 flex-1 items-center gap-3"><Avatar name={seller.name} size="sm" /><div className="min-w-0"><p className="truncate font-semibold">{seller.store}</p><p className="truncate text-sm text-light-secondary-text">{seller.name} · {seller.category}</p></div></div>
              <div className="flex items-center justify-between gap-4 pl-11 sm:pl-0"><span className="text-sm text-light-secondary-text">{seller.submitted}</span><StatusBadge tone="warning">Pending</StatusBadge></div>
            </li>
          ))}
        </ul>
      </DashboardCard>
      <RecentOrders />
    </div>
  );
}
