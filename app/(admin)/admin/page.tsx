import PendingStores from "@/components/admin/dashboard/PendingStores";
import RecentOrders from "@/components/admin/dashboard/RecentOrders";
import Statistics from "@/components/admin/dashboard/Statistics";
import { DashboardCard } from "@/components/dashboard/ui";

const orderStatuses = [
  ["Pending", 18, "bg-warning"],
  ["Confirmed", 72, "bg-success"],
  ["Inventory reservation failed", 4, "bg-error"],
  ["Payment failed", 7, "bg-error"],
  ["Cancelled", 8, "bg-gray-400"],
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
      <PendingStores />
      <RecentOrders />
    </div>
  );
}
