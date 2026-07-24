import RecentOrders from "@/components/admin/dashboard/RecentOrders";
import { DashboardCard } from "@/components/dashboard/ui";

const metrics = [
  ["Total Sales", "$4,876", "+0.1%", "bg-[rgba(160,226,224,0.60)]", "text-primary"],
  ["Total Orders", "4,876", "+0.1%", "bg-[rgba(158,232,114,0.60)]", "text-primary"],
  ["Order Count", "1M", "-0.1%", "bg-[rgba(255,235,105,0.60)]", "text-error"],
  ["Total Customers", "50,000", "+0.1%", "bg-[rgba(255,192,145,0.60)]", "text-primary"],
  ["Newly Registered Users", "500", "-0.1%", "bg-[rgba(255,214,239,0.60)]", "text-error"],
  ["Item Sold Today", "4,876", "+0.1%", "bg-[rgba(146,189,245,0.60)]", "text-primary"],
  ["Total Revenue", "$12,876", "-0.1%", "bg-[rgba(116,202,255,0.60)]", "text-error"],
  ["Today Revenue", "$4,876", "-0.1%", "bg-[rgba(250,184,81,0.60)]", "text-error"],
] as const;

const orderStatuses = [
  ["Pending", 14, "bg-warning"],
  ["Confirmed", 60, "bg-primary"],
  ["Cancelled", 5, "bg-error"],
  ["Waiting for pick up", 6, "bg-info"],
  ["Completed", 24, "bg-success"],
] as const;

export default function AdminDashboard() {
  return (
    <DashboardCard className="space-y-6 p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {metrics.map(([label, value, change, background, changeColor]) => (
          <div key={label} className={`${background} relative min-h-32 rounded-2xl p-6`}>
            <p className="mb-2 text-sm font-semibold text-light-secondary-text">{label}</p>
            <h2 className="text-2xl font-bold">{value}</h2>
            <span className={`absolute bottom-6 right-6 rounded-full bg-white px-2 py-1 text-xs font-bold ${changeColor}`}>{change}</span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-500/20">
        <div className="border-b border-gray-500/20 px-4 py-4 sm:px-6"><h2 className="text-lg font-bold">Order Status</h2></div>
        <div className="grid gap-8 p-4 sm:p-6 md:grid-cols-2">
          <div className="space-y-3">{orderStatuses.map(([label, count, color]) => <div key={label} className="flex items-center justify-between text-sm"><div className="flex items-center gap-3"><span className={`size-3 rounded-full ${color}`} /><span>{label}</span></div><strong>{count}</strong></div>)}</div>
          <div className="flex items-center justify-center"><div className="flex size-36 items-center justify-center rounded-full border-8 border-gray-100 shadow-[inset_0_0_0_8px_rgba(0,167,111,0.22)]"><span className="text-lg font-bold">109 Total</span></div></div>
        </div>
      </div>

      <RecentOrders />
    </DashboardCard>
  );
}
