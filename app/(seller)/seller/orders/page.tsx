import { DashboardCard } from "@/components/dashboard/ui";
import Link from "next/link";

export default function SellerOrders() {
  const stats = [
    { label: "Total Order", value: "3,823", color: "bg-accent-5/60" },
    { label: "Pending Payment", value: "934", color: "bg-accent-2/60" },
    { label: "Processing", value: "993", color: "bg-accent-1/60" },
    { label: "Shipped", value: "536", color: "bg-accent-3/60" },
    { label: "Delivered", value: "24,392", color: "bg-accent-4/60" },
    { label: "Cancelled", value: "9,372", color: "bg-accent-6/60" },
    { label: "Returned", value: "434", color: "bg-accent-7/60" },
  ];

  const orders = [
    {
      id: "#73423",
      customer: "Alexa Smith",
      items: "10 pcs",
      amount: "$100",
      paymentStatus: "paid",
      paymentClass: "border-primary text-primary",
      receivedStatus: "Delivered",
      receivedClass: "bg-primary-alpha-16 text-primary-dark",
      date: "11 Sept, 2027",
    },
    {
      id: "#73424",
      customer: "Alexa Smith",
      items: "11 pcs",
      amount: "$200",
      paymentStatus: "pending",
      paymentClass: "border-warning text-warning",
      receivedStatus: "Processing",
      receivedClass: "bg-warning-alpha-16 text-warning-dark",
      date: "12 Sept, 2027",
    },
    {
      id: "#73425",
      customer: "Alexa Smith",
      items: "12 pcs",
      amount: "$300",
      paymentStatus: "unpaid",
      paymentClass: "border-error text-error",
      receivedStatus: "Shipped",
      receivedClass: "bg-info-alpha-16 text-info-dark",
      date: "13 Sept, 2027",
    },
    {
      id: "#73426",
      customer: "Alexa Smith",
      items: "13 pcs",
      amount: "$400",
      paymentStatus: "paid",
      paymentClass: "border-primary text-primary",
      receivedStatus: "Delivered",
      receivedClass: "bg-primary-alpha-16 text-primary-dark",
      date: "14 Sept, 2027",
    },
  ];

  return (
    <DashboardCard className="bg-white rounded-2xl py-4 sm:py-6">
        <div className="px-4 sm:px-6">
          <div className="pb-4">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-xl font-bold text-light-primary-text">Total Orders</h3>
              <button type="button" className="rounded-full inline-flex items-center justify-center cursor-pointer font-bold transition-colors focus:outline-none bg-primary text-white hover:bg-primary-dark px-4 py-1 h-7.5 text-[13px] leading-5.5">
                Export
              </button>
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 sm:gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className={`${stat.color} rounded-xl p-4 flex flex-col justify-center items-start`}>
                  <p className="text-xs mb-1 text-light-secondary-text font-semibold">{stat.label}</p>
                  <p className="text-xl font-bold text-light-primary-text">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="pt-6">
          <div className="p-4">
            <div className="flex flex-col lg:flex-row justify-between gap-4 lg:items-center">
              <div className="relative sm:w-[300px] w-full">
                <input
                  className="pl-9 w-full pr-3.5 ring h-9 ring-gray-500/20 py-2 bg-gray-100 border-none rounded-full text-sm focus:outline-none focus:ring-primary transition-all font-normal text-light-primary-text placeholder:text-light-secondary-text"
                  placeholder="Search..."
                  type="text"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  className="relative h-9 ring inline-flex text-sm items-center justify-between ring-[rgba(145,158,171,0.20)] w-[140px] cursor-default rounded-full bg-gray-200 px-3 py-2 text-left focus:outline-none text-light-secondary-text"
                  type="button"
                >
                  Payment status
                </button>
                <button
                  className="relative h-9 ring inline-flex text-sm items-center justify-between ring-[rgba(145,158,171,0.20)] w-[140px] cursor-default rounded-full bg-gray-200 px-3 py-2 text-left focus:outline-none text-light-secondary-text"
                  type="button"
                >
                  Received status
                </button>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="bg-gray-100 border-y border-gray-500/20">
                  <th className="h-12 p-3 pl-6 text-left align-middle text-light-primary-text text-sm font-semibold">ID</th>
                  <th className="h-12 p-3 text-left align-middle text-light-primary-text text-sm font-semibold">Customer</th>
                  <th className="h-12 p-3 text-left align-middle text-light-primary-text text-sm font-semibold">Items</th>
                  <th className="h-12 p-3 text-left align-middle text-light-primary-text text-sm font-semibold">Amount</th>
                  <th className="h-12 p-3 text-left align-middle text-light-primary-text text-sm font-semibold">Payment status</th>
                  <th className="h-12 p-3 text-left align-middle text-light-primary-text text-sm font-semibold">Received status</th>
                  <th className="h-12 p-3 text-left align-middle text-light-primary-text text-sm font-semibold">Date</th>
                  <th className="h-12 p-3 pr-6 text-left align-middle text-light-primary-text text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-500/20 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-3.5 pl-6 text-sm text-light-secondary-text">{order.id}</td>
                    <td className="px-3 py-3.5 text-sm text-light-secondary-text">{order.customer}</td>
                    <td className="px-3 py-3.5 text-sm text-light-secondary-text">{order.items}</td>
                    <td className="px-3 py-3.5 text-sm font-semibold text-light-primary-text">{order.amount}</td>
                    <td className="px-3 py-3.5">
                      <span className={`px-2 py-1 h-5.5 inline-flex items-center justify-center font-sans rounded-full text-xs font-medium bg-transparent border ${order.paymentClass}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={`px-2 py-1 h-5.5 inline-flex items-center justify-center font-sans rounded-full text-xs font-medium ${order.receivedClass}`}>
                        {order.receivedStatus}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-sm text-light-secondary-text">{order.date}</td>
                    <td className="px-3 py-3.5 pr-6">
                      <Link
                        className="inline-flex items-center justify-center cursor-pointer font-bold transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 border-none shadow-none bg-transparent h-8 w-8 p-0 text-light-primary-text hover:text-primary"
                        href="/seller/orders/details"
                      >
                        <svg className="size-4" fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M8 2.586c1.789 0 3.311.788 4.474 1.695 1.163.909 2.02 1.98 2.499 2.65.162.228.443.575.443 1.072s-.28.844-.443 1.072c-.479.67-1.336 1.741-2.5 2.65-1.162.907-2.684 1.694-4.473 1.694s-3.311-.787-4.474-1.694c-1.163-.909-2.021-1.98-2.5-2.65-.142-.2-.374-.491-.43-.893l-.013-.18.013-.179c.056-.402.288-.693.43-.892.479-.67 1.336-1.74 2.5-2.65C4.69 3.374 6.211 2.586 8 2.586m0 1.5c-1.337 0-2.541.589-3.55 1.377-1.009.787-1.77 1.732-2.202 2.339-.052.073-.09.126-.121.172l-.019.028.019.03c.03.045.069.099.121.172.433.607 1.194 1.551 2.201 2.338 1.01.788 2.214 1.377 3.551 1.377s2.54-.59 3.55-1.377c1.008-.787 1.77-1.731 2.202-2.338l.121-.173.018-.029-.018-.028c-.03-.046-.069-.1-.121-.172-.433-.607-1.194-1.552-2.202-2.34C10.54 4.676 9.337 4.087 8 4.087zm0 1.167a2.75 2.75 0 1 1 0 5.5 2.75 2.75 0 0 1 0-5.5m0 1.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5"
                            fill="currentColor"
                          />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardCard>
  );
}