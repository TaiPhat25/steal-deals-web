import RecentOrders from "@/components/admin/dashboard/RecentOrders";
import { DashboardCard } from "@/components/dashboard/ui";

const metrics = [
  ["Confirmed order value", "₫128.6M", "Across confirmed orders", "bg-accent-1/60"],
  ["Orders", "1,248", "All current statuses", "bg-accent-2/60"],
  ["Active customers", "9,420", "Identity accounts", "bg-accent-3/60"],
  ["Active stores", "186", "Verified and unverified", "bg-accent-5/60"],
] as const;

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value, note, background]) => <DashboardCard key={label} className={`${background} p-5`}><p className="text-sm font-semibold text-light-secondary-text">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p><p className="mt-2 text-xs text-light-secondary-text">{note}</p></DashboardCard>)}
      </div>
      <DashboardCard className="overflow-hidden">
        <div className="border-b border-gray-500/20 px-4 py-4 sm:px-6"><h2 className="text-lg font-bold">Order status</h2><p className="mt-1 text-sm text-light-secondary-text">Current backend-created and handled status spellings.</p></div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-5">{orderStatuses.map(([label, count, color]) => <div key={label} className="rounded-xl bg-gray-50 p-4"><div className="flex items-center gap-2"><span className={`size-2.5 rounded-full ${color}`} /><span className="text-sm text-light-secondary-text">{label}</span></div><strong className="mt-2 block text-2xl">{count}</strong></div>)}</div>
      </DashboardCard>
      <RecentOrders />
    </div>
  );
}
