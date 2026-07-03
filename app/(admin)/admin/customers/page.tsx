"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";

export default function AdminCustomers() {
  const customers = [
    {
      id: "#73423",
      name: "James Smith",
      avatar: "/admin/images/user/manface.avif",
      email: "james0@gmail.com",
      phone: "+1 (555) 000-1000",
      status: "Inactive",
      statusClass: "bg-primary-alpha-16 text-primary-dark",
      date: "11 Sept, 2027",
    },
    {
      id: "#73424",
      name: "Mary Johnson",
      avatar: "/admin/images/user/womanface.avif",
      email: "mary1@gmail.com",
      phone: "+1 (555) 000-1001",
      status: "Active",
      statusClass: "bg-primary-alpha-16 text-primary-dark",
      date: "12 Sept, 2027",
    },
    {
      id: "#73425",
      name: "John Williams",
      avatar: "/admin/images/user/manface.avif",
      email: "john2@gmail.com",
      phone: "+1 (555) 000-1002",
      status: "Active",
      statusClass: "bg-primary-alpha-16 text-primary-dark",
      date: "13 Sept, 2027",
    },
    {
      id: "#73426",
      name: "Patricia Brown",
      avatar: "/admin/images/user/womanface.avif",
      email: "patricia3@gmail.com",
      phone: "+1 (555) 000-1003",
      status: "Active",
      statusClass: "bg-primary-alpha-16 text-primary-dark",
      date: "14 Sept, 2027",
    },
    {
      id: "#73427",
      name: "Jennifer Jones",
      avatar: "/admin/images/user/womanface.avif",
      email: "jennifer4@gmail.com",
      phone: "+1 (555) 000-1004",
      status: "Inactive",
      statusClass: "bg-primary-alpha-16 text-primary-dark",
      date: "15 Sept, 2027",
    },
    {
      id: "#73428",
      name: "Michael Miller",
      avatar: "/admin/images/user/manface.avif",
      email: "michael5@gmail.com",
      phone: "+1 (555) 000-1005",
      status: "Active",
      statusClass: "bg-primary-alpha-16 text-primary-dark",
      date: "16 Sept, 2027",
    },
    {
      id: "#73429",
      name: "Elizabeth Davis",
      avatar: "/admin/images/user/womanface.avif",
      email: "elizabeth6@gmail.com",
      phone: "+1 (555) 000-1006",
      status: "Active",
      statusClass: "bg-primary-alpha-16 text-primary-dark",
      date: "17 Sept, 2027",
    },
    {
      id: "#73432",
      name: "William Garcia",
      avatar: "/admin/images/user/manface.avif",
      email: "william9@gmail.com",
      phone: "+1 (555) 000-1009",
      status: "Inactive",
      statusClass: "bg-primary-alpha-16 text-primary-dark",
      date: "10 Sept, 2027",
    },
  ];

  return (
    <AdminLayout>
      <div className="bg-white rounded-2xl w-full">
        <div className="p-4 sm:p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <h3 className="text-xl font-bold text-light-primary-text leading-7">Customer</h3>
            <div className="flex items-center gap-3">
              <Link
                className="inline-flex items-center justify-center cursor-pointer font-bold transition-colors focus:outline-none disabled:cursor-not-allowed disabled:bg-[rgba(145,158,171,0.24)] disabled:text-[rgba(145,158,171,0.80)] disabled:opacity-100 py-1 h-9 text-sm leading-6 rounded-full bg-teal-700 hover:bg-teal-800 text-white px-6"
                href="/admin/customers"
              >
                Create Customer
              </Link>
            </div>
          </div>
          <div className="w-full flex justify-between gap-4 items-center flex-wrap">
            <div className="relative sm:w-[300px] w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 16 16"
                className="absolute size-4 text-light-primary-text left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M7.333.583a6.75 6.75 0 1 0 4.213 12.022l2.59 2.592a.75.75 0 0 0 1.062-1.06l-2.591-2.592A6.75 6.75 0 0 0 7.334.583zm0 1.5a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5"
                  clipRule="evenodd"
                ></path>
              </svg>
              <input
                className="pl-9 w-full pr-3.5 ring h-9 ring-gray-500/20 py-2 bg-gray-100 border-none rounded-full text-sm focus:outline-none focus:ring-primary transition-all font-normal text-light-primary-text placeholder:text-light-secondary-text"
                placeholder="Search..."
                type="text"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-[140px]">
                <button
                  className="relative h-9 ring inline-flex text-sm items-center justify-between ring-[rgba(145,158,171,0.20)] w-full cursor-default rounded-full bg-gray-200 px-3 py-2 text-left focus:outline-none"
                  type="button"
                >
                  <span className="block truncate text-light-secondary-text">Status</span>
                  <span className="pointer-events-none flex items-center pl-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" className="h-5 w-5">
                      <path
                        fill="currentColor"
                        fillRule="evenodd"
                        d="M14.47 6.97a.75.75 0 1 1 1.06 1.06l-4.293 4.293c-.151.152-.318.32-.476.44a1.3 1.3 0 0 1-.64.273l-.121.007a1.23 1.23 0 0 1-.76-.28c-.16-.12-.326-.288-.477-.44L4.47 8.03a.75.75 0 1 1 1.06-1.06l4.293 4.293.177.174.177-.174z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </span>
                </button>
              </div>
              <div className="min-w-[140px]">
                <button
                  className="relative h-9 ring inline-flex text-sm items-center justify-between ring-[rgba(145,158,171,0.20)] w-full cursor-default rounded-full bg-gray-200 px-3 py-2 text-left focus:outline-none"
                  type="button"
                >
                  <span className="block truncate text-light-secondary-text">Date</span>
                  <span className="pointer-events-none flex items-center pl-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" className="h-5 w-5">
                      <path
                        fill="currentColor"
                        fillRule="evenodd"
                        d="M14.47 6.97a.75.75 0 1 1 1.06 1.06l-4.293 4.293c-.151.152-.318.32-.476.44a1.3 1.3 0 0 1-.64.273l-.121.007a1.23 1.23 0 0 1-.76-.28c-.16-.12-.326-.288-.477-.44L4.47 8.03a.75.75 0 1 1 1.06-1.06l4.293 4.293.177.174.177-.174z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="transition-colors bg-gray-100 hover:bg-gray-100 border-y border-gray-500/20">
                <th className="h-12 p-3 first:pl-5 whitespace-nowrap last:pr-5 text-left align-middle text-light-primary-text text-sm font-semibold w-[50px] pl-6">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="peer sr-only" />
                    <div className="h-5 w-5 rounded border-2 border-gray-500 bg-transparent transition-all flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-checked:bg-primary peer-checked:border-primary peer-checked:text-white peer-checked:[&_svg]:opacity-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-check h-3.5 w-3.5 opacity-0 transition-opacity"
                        aria-hidden="true"
                      >
                        <path d="M20 6 9 17l-5-5"></path>
                      </svg>
                    </div>
                  </label>
                </th>
                <th className="h-12 p-3 first:pl-5 whitespace-nowrap last:pr-5 text-left align-middle text-light-primary-text text-sm font-semibold">
                  ID
                </th>
                <th className="h-12 p-3 first:pl-5 whitespace-nowrap last:pr-5 text-left align-middle text-light-primary-text text-sm font-semibold">
                  Users
                </th>
                <th className="h-12 p-3 first:pl-5 whitespace-nowrap last:pr-5 text-left align-middle text-light-primary-text text-sm font-semibold">
                  Email
                </th>
                <th className="h-12 p-3 first:pl-5 whitespace-nowrap last:pr-5 text-left align-middle text-light-primary-text text-sm font-semibold">
                  Phone Number
                </th>
                <th className="h-12 p-3 first:pl-5 whitespace-nowrap last:pr-5 text-left align-middle text-light-primary-text text-sm font-semibold">
                  Status
                </th>
                <th className="h-12 p-3 first:pl-5 whitespace-nowrap last:pr-5 text-left align-middle text-light-primary-text text-sm font-semibold">
                  Date
                </th>
                <th className="h-12 p-3 first:pl-5 whitespace-nowrap last:pr-5 text-left align-middle text-light-primary-text text-sm font-semibold pr-6">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="transition-colors border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50"
                >
                  <td className="px-3 py-3.5 first:pl-5 last:pr-5 align-middle pl-6 whitespace-nowrap">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="peer sr-only" />
                      <div className="h-5 w-5 rounded border-2 border-gray-500 bg-transparent transition-all flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-checked:bg-primary peer-checked:border-primary peer-checked:text-white peer-checked:[&_svg]:opacity-100">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-check h-3.5 w-3.5 opacity-0 transition-opacity"
                          aria-hidden="true"
                        >
                          <path d="M20 6 9 17l-5-5"></path>
                        </svg>
                      </div>
                    </label>
                  </td>
                  <td className="px-3 py-3.5 first:pl-5 last:pr-5 align-middle font-normal text-sm text-light-secondary-text whitespace-nowrap">
                    {customer.id}
                  </td>
                  <td className="px-3 py-3.5 first:pl-5 last:pr-5 align-middle whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="size-8 relative rounded-lg shrink-0 overflow-hidden">
                        <img
                          alt="avatar"
                          className="object-cover w-full h-full"
                          src={customer.avatar}
                        />
                      </div>
                      <span className="text-sm text-light-secondary-text">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 first:pl-5 last:pr-5 align-middle text-sm text-light-secondary-text whitespace-nowrap">
                    {customer.email}
                  </td>
                  <td className="px-3 py-3.5 first:pl-5 last:pr-5 align-middle text-sm text-light-secondary-text whitespace-nowrap">
                    {customer.phone}
                  </td>
                  <td className="px-3 py-3.5 first:pl-5 last:pr-5 align-middle">
                    <span className={`px-2 py-1 h-5.5 inline-flex items-center justify-center font-public-sans rounded-full text-xs font-medium ${customer.statusClass}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 first:pl-5 last:pr-5 align-middle text-sm text-light-secondary-text whitespace-nowrap">
                    {customer.date}
                  </td>
                  <td className="px-3 py-3.5 first:pl-5 last:pr-5 align-middle pr-6 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Link
                        className="inline-flex items-center justify-center cursor-pointer font-bold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 border-none shadow-none bg-transparent h-8 w-8 p-0 text-light-primary-text hover:text-primary transition-colors"
                        href="/admin/customers"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" className="size-4">
                          <path
                            fill="currentColor"
                            d="M8 2.586c1.789 0 3.311.788 4.474 1.695 1.163.909 2.02 1.98 2.499 2.65.162.228.443.575.443 1.072s-.28.844-.443 1.072c-.479.67-1.336 1.741-2.5 2.65-1.162.907-2.684 1.694-4.473 1.694s-3.311-.787-4.474-1.694c-1.163-.909-2.021-1.98-2.5-2.65-.142-.2-.374-.491-.43-.893l-.013-.18.013-.179c.056-.402.288-.693.43-.892.479-.67 1.336-1.74 2.5-2.65C4.69 3.374 6.211 2.586 8 2.586m0 1.5c-1.337 0-2.541.589-3.55 1.377-1.009.787-1.77 1.732-2.202 2.339-.052.073-.09.126-.121.172l-.019.028.019.03c.03.045.069.099.121.172.433.607 1.194 1.551 2.201 2.338 1.01.788 2.214 1.377 3.551 1.377s2.54-.59 3.55-1.377c1.008-.787 1.77-1.731 2.202-2.338l.121-.173.018-.029-.018-.028c-.03-.046-.069-.1-.121-.172-.433-.607-1.194-1.552-2.202-2.34C10.54 4.676 9.337 4.087 8 4.087zm0 1.167a2.75 2.75 0 1 1 0 5.5 2.75 2.75 0 0 1 0-5.5m0 1.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5"
                          ></path>
                        </svg>
                      </Link>
                      <Link
                        className="inline-flex items-center justify-center cursor-pointer font-bold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 border-none shadow-none bg-transparent h-8 w-8 p-0 text-light-primary-text hover:text-primary transition-colors"
                        href="/admin/customers"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" className="size-4">
                          <path
                            fill="currentColor"
                            fillRule="evenodd"
                            d="M10.008.984a2.82 2.82 0 0 1 2.816-.043c.291.162.559.408.874.725l.668.682c.31.322.55.594.706.89a2.95 2.95 0 0 1-.04 2.836c-.221.387-.588.73-1.076 1.2l-6.268 6.038c-.954.919-1.574 1.534-2.37 1.845-.797.312-1.665.276-2.974.241l-.187-.005a4 4 0 0 1-.589-.04 1.16 1.16 0 0 1-.702-.368 1.18 1.18 0 0 1-.28-.734c-.01-.185.008-.404.023-.596l.018-.231c.09-1.146.138-1.895.434-2.574.296-.682.808-1.223 1.58-2.06l6.19-6.706c.46-.498.796-.873 1.177-1.1m4.658 12.935a.75.75 0 1 1 0 1.5H9.333a.75.75 0 0 1 0-1.5zM3.744 9.808c-.84.91-1.136 1.244-1.307 1.64s-.217.846-.314 2.093l-.018.23-.01.119.101.003.187.005c1.433.038 1.94.037 2.39-.138.451-.177.83-.524 1.874-1.528l5.359-5.164-2.983-2.982zm8.352-7.555a1.32 1.32 0 0 0-1.322.02c-.135.081-.285.228-.732.71l3.044 3.044c.428-.414.565-.56.643-.695a1.45 1.45 0 0 0 .02-1.39c-.083-.154-.24-.325-.789-.886-.55-.562-.716-.72-.864-.803"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </Link>
                      <button className="inline-flex items-center justify-center cursor-pointer font-bold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 border-none shadow-none bg-transparent h-8 w-8 p-0 text-light-primary-text hover:text-red-500 transition-colors">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-trash2 w-4 h-4"
                          aria-hidden="true"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 sm:p-6 border-t border-gray-500/20 flex justify-end">
          <div className="flex items-center gap-2">
            <button
              disabled
              className="w-10 h-7.5 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" className="size-5">
                <path fill="currentColor" d="M12.056 4.396a.75.75 0 1 1 .888 1.207v.001l-.002.002-.01.007-.04.03-.155.116a46 46 0 0 0-2.246 1.813c-.615.534-1.21 1.093-1.647 1.587a4.6 4.6 0 0 0-.487.635 1 1 0 0 0-.102.206c.009.027.035.093.102.206q.158.261.487.635c.436.493 1.033 1.052 1.648 1.587a43 43 0 0 0 2.4 1.93l.04.028.01.007.002.002v.001a.75.75 0 1 1-.888 1.207h-.002l-.003-.003-.055-.04-.163-.123a47 47 0 0 1-2.325-1.877c-.634-.55-1.288-1.16-1.79-1.726a6 6 0 0 1-.646-.854c-.157-.26-.322-.607-.322-.98 0-.374.165-.72.322-.98.17-.281.397-.572.647-.854.5-.567 1.155-1.176 1.789-1.727a44 44 0 0 1 2.325-1.877l.163-.122.055-.04q0-.002.003-.003h.002z"></path>
              </svg>
            </button>
            <div className="flex items-center gap-1">
              <button className="w-10 h-7.5 flex items-center justify-center rounded-full text-sm transition-colors bg-primary-lighter text-primary-dark font-semibold">
                1
              </button>
              <button className="w-10 h-7.5 flex items-center justify-center rounded-full text-sm transition-colors text-gray-600 hover:bg-gray-50 font-medium">
                2
              </button>
            </div>
            <button className="w-10 h-7.5 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" className="size-5">
                <path fill="currentColor" d="M6.897 4.555a.75.75 0 0 1 1.048-.159l.002.001.003.002.054.041.164.122a46 46 0 0 1 2.325 1.877c.634.55 1.288 1.16 1.789 1.727.25.282.477.572.646.853.157.26.322.607.323.98 0 .374-.166.72-.323.981a6 6 0 0 1-.646.854c-.501.566-1.155 1.175-1.79 1.726a44 44 0 0 1-2.324 1.877l-.164.122-.054.041-.003.002-.001.001h-.001a.75.75 0 1 1-.889-1.207l.002-.003.01-.007.041-.029.154-.116a46 46 0 0 0 2.245-1.814c.616-.534 1.212-1.093 1.649-1.587a4.6 4.6 0 0 0 .486-.634c.068-.113.094-.18.103-.206a1 1 0 0 0-.103-.206 4.6 4.6 0 0 0-.486-.635c-.437-.494-1.032-1.053-1.648-1.587a43 43 0 0 0-2.246-1.814l-.154-.116-.04-.03q-.008-.003-.01-.006-.002-.001-.003-.002a.75.75 0 0 1-.159-1.049"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
