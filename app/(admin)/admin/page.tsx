import { DashboardCard } from "@/components/dashboard/ui";

export default function AdminDashboard() {
  return (
    <DashboardCard className="space-y-6 bg-white p-4 sm:p-6 rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-[rgba(160,226,224,0.60)] p-6 rounded-2xl flex flex-col justify-between relative">
            <div>
              <p className="text-sm font-semibold text-light-secondary-text mb-2">
                Total Sales
              </p>
              <h3 className="text-2xl font-sans font-bold text-light-primary-text">
                $4,876
              </h3>
            </div>
            <div className="absolute bottom-6 right-6 flex items-center gap-1 bg-white px-2 py-1 font-normal text-xs rounded-full">
              <span className="text-xs font-bold text-primary">+0.1%</span>
              <span className="text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" width="16" height="16">
                  <path fill="currentColor" d="M14 4.667a.5.5 0 0 0 0-.14.4.4 0 0 0-.033-.114 1 1 0 0 0-.06-.093.5.5 0 0 0-.094-.113l-.08-.047a.5.5 0 0 0-.126-.067h-.133a.5.5 0 0 0-.14-.093H10a.667.667 0 0 0 0 1.333h1.887L9.22 8.473 6.34 6.76a.67.67 0 0 0-.853.147l-3.333 4a.666.666 0 1 0 1.026.853L6.147 8.2l2.847 1.707a.67.67 0 0 0 .846-.14l2.827-3.3V8A.667.667 0 1 0 14 8z" />
                </svg>
              </span>
            </div>
          </div>

          <div className="bg-[rgba(158,232,114,0.60)] p-6 rounded-2xl flex flex-col justify-between relative">
            <div>
              <p className="text-sm font-semibold text-light-secondary-text mb-2">
                Total Orders
              </p>
              <h3 className="text-2xl font-sans font-bold text-light-primary-text">
                4,876
              </h3>
            </div>
            <div className="absolute bottom-6 right-6 flex items-center gap-1 bg-white px-2 py-1 font-normal text-xs rounded-full">
              <span className="text-xs font-bold text-primary">+0.1%</span>
              <span className="text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" width="16" height="16">
                  <path fill="currentColor" d="M14 4.667a.5.5 0 0 0 0-.14.4.4 0 0 0-.033-.114 1 1 0 0 0-.06-.093.5.5 0 0 0-.094-.113l-.08-.047a.5.5 0 0 0-.126-.067h-.133a.5.5 0 0 0-.14-.093H10a.667.667 0 0 0 0 1.333h1.887L9.22 8.473 6.34 6.76a.67.67 0 0 0-.853.147l-3.333 4a.666.666 0 1 0 1.026.853L6.147 8.2l2.847 1.707a.67.67 0 0 0 .846-.14l2.827-3.3V8A.667.667 0 1 0 14 8z" />
                </svg>
              </span>
            </div>
          </div>

          <div className="bg-[rgba(255,235,105,0.60)] p-6 rounded-2xl flex flex-col justify-between relative">
            <div>
              <p className="text-sm font-semibold text-light-secondary-text mb-2">
                Order Count
              </p>
              <h3 className="text-2xl font-sans font-bold text-light-primary-text">
                1M
              </h3>
            </div>
            <div className="absolute bottom-6 right-6 flex items-center gap-1 bg-white px-2 py-1 font-normal text-xs rounded-full">
              <span className="text-xs font-bold text-error">-0.1%</span>
              <span className="text-error">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" width="16" height="16">
                  <path fill="currentColor" d="M14 11.333a.5.5 0 0 1 0 .14.4.4 0 0 1-.033.114 1 1 0 0 1-.06.093.5.5 0 0 1-.094.113l-.08.047a.5.5 0 0 1-.126.067h-.133a.5.5 0 0 1-.14.093H10a.667.667 0 0 1 0-1.333h1.887L9.22 7.527 6.34 9.24a.67.67 0 0 1-.853-.147l-3.333-4A.667.667 0 1 1 3.18 4.24L6.147 7.8l2.847-1.707a.67.67 0 0 1 .846.14l2.827 3.3V8A.667.667 0 1 1 14 8z" />
                </svg>
              </span>
            </div>
          </div>

          <div className="bg-[rgba(255,192,145,0.60)] p-6 rounded-2xl flex flex-col justify-between relative">
            <div>
              <p className="text-sm font-semibold text-light-secondary-text mb-2">
                Total Customers
              </p>
              <h3 className="text-2xl font-sans font-bold text-light-primary-text">
                50,000
              </h3>
            </div>
            <div className="absolute bottom-6 right-6 flex items-center gap-1 bg-white px-2 py-1 font-normal text-xs rounded-full">
              <span className="text-xs font-bold text-primary">+0.1%</span>
              <span className="text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" width="16" height="16">
                  <path fill="currentColor" d="M14 4.667a.5.5 0 0 0 0-.14.4.4 0 0 0-.033-.114 1 1 0 0 0-.06-.093.5.5 0 0 0-.094-.113l-.08-.047a.5.5 0 0 0-.126-.067h-.133a.5.5 0 0 0-.14-.093H10a.667.667 0 0 0 0 1.333h1.887L9.22 8.473 6.34 6.76a.67.67 0 0 0-.853.147l-3.333 4a.666.666 0 1 0 1.026.853L6.147 8.2l2.847 1.707a.67.67 0 0 0 .846-.14l2.827-3.3V8A.667.667 0 1 0 14 8z" />
                </svg>
              </span>
            </div>
          </div>

          <div className="bg-[rgba(255,214,239,0.60)] p-6 rounded-2xl flex flex-col justify-between relative">
            <div>
              <p className="text-sm font-semibold text-light-secondary-text mb-2">
                Newly Registered Users
              </p>
              <h3 className="text-2xl font-sans font-bold text-light-primary-text">
                500
              </h3>
            </div>
            <div className="absolute bottom-6 right-6 flex items-center gap-1 bg-white px-2 py-1 font-normal text-xs rounded-full">
              <span className="text-xs font-bold text-error">-0.1%</span>
              <span className="text-error">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" width="16" height="16">
                  <path fill="currentColor" d="M14 11.333a.5.5 0 0 1 0 .14.4.4 0 0 1-.033.114 1 1 0 0 1-.06.093.5.5 0 0 1-.094.113l-.08.047a.5.5 0 0 1-.126.067h-.133a.5.5 0 0 1-.14.093H10a.667.667 0 0 1 0-1.333h1.887L9.22 7.527 6.34 9.24a.67.67 0 0 1-.853-.147l-3.333-4A.667.667 0 1 1 3.18 4.24L6.147 7.8l2.847-1.707a.67.67 0 0 1 .846.14l2.827 3.3V8A.667.667 0 1 1 14 8z" />
                </svg>
              </span>
            </div>
          </div>

          <div className="bg-[rgba(146,189,245,0.60)] p-6 rounded-2xl flex flex-col justify-between relative">
            <div>
              <p className="text-sm font-semibold text-light-secondary-text mb-2">
                Item Sold Today
              </p>
              <h3 className="text-2xl font-sans font-bold text-light-primary-text">
                4,876
              </h3>
            </div>
            <div className="absolute bottom-6 right-6 flex items-center gap-1 bg-white px-2 py-1 font-normal text-xs rounded-full">
              <span className="text-xs font-bold text-primary">+0.1%</span>
              <span className="text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" width="16" height="16">
                  <path fill="currentColor" d="M14 4.667a.5.5 0 0 0 0-.14.4.4 0 0 0-.033-.114 1 1 0 0 0-.06-.093.5.5 0 0 0-.094-.113l-.08-.047a.5.5 0 0 0-.126-.067h-.133a.5.5 0 0 0-.14-.093H10a.667.667 0 0 0 0 1.333h1.887L9.22 8.473 6.34 6.76a.67.67 0 0 0-.853.147l-3.333 4a.666.666 0 1 0 1.026.853L6.147 8.2l2.847 1.707a.67.67 0 0 0 .846-.14l2.827-3.3V8A.667.667 0 1 0 14 8z" />
                </svg>
              </span>
            </div>
          </div>

          <div className="bg-[rgba(116,202,255,0.60)] p-6 rounded-2xl flex flex-col justify-between relative">
            <div>
              <p className="text-sm font-semibold text-light-secondary-text mb-2">
                Total Revenue
              </p>
              <h3 className="text-2xl font-sans font-bold text-light-primary-text">
                $12,876
              </h3>
            </div>
            <div className="absolute bottom-6 right-6 flex items-center gap-1 bg-white px-2 py-1 font-normal text-xs rounded-full">
              <span className="text-xs font-bold text-error">-0.1%</span>
              <span className="text-error">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" width="16" height="16">
                  <path fill="currentColor" d="M14 11.333a.5.5 0 0 1 0 .14.4.4 0 0 1-.033.114 1 1 0 0 1-.06.093.5.5 0 0 1-.094.113l-.08.047a.5.5 0 0 1-.126.067h-.133a.5.5 0 0 1-.14.093H10a.667.667 0 0 1 0-1.333h1.887L9.22 7.527 6.34 9.24a.67.67 0 0 1-.853-.147l-3.333-4A.667.667 0 1 1 3.18 4.24L6.147 7.8l2.847-1.707a.67.67 0 0 1 .846.14l2.827 3.3V8A.667.667 0 1 1 14 8z" />
                </svg>
              </span>
            </div>
          </div>

          <div className="bg-[rgba(250,184,81,0.60)] p-6 rounded-2xl flex flex-col justify-between relative">
            <div>
              <p className="text-sm font-semibold text-light-secondary-text mb-2">
                Today Revenue
              </p>
              <h3 className="text-2xl font-sans font-bold text-light-primary-text">
                $4,876
              </h3>
            </div>
            <div className="absolute bottom-6 right-6 flex items-center gap-1 bg-white px-2 py-1 font-normal text-xs rounded-full">
              <span className="text-xs font-bold text-error">-0.1%</span>
              <span className="text-error">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" width="16" height="16">
                  <path fill="currentColor" d="M14 11.333a.5.5 0 0 1 0 .14.4.4 0 0 1-.033.114 1 1 0 0 1-.06.093.5.5 0 0 1-.094.113l-.08.047a.5.5 0 0 1-.126.067h-.133a.5.5 0 0 1-.14.093H10a.667.667 0 0 1 0-1.333h1.887L9.22 7.527 6.34 9.24a.67.67 0 0 1-.853-.147l-3.333-4A.667.667 0 1 1 3.18 4.24L6.147 7.8l2.847-1.707a.67.67 0 0 1 .846.14l2.827 3.3V8A.667.667 0 1 1 14 8z" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="sm:col-span-2 order-1">
              <div className="bg-white border border-gray-500/20 rounded-2xl w-full">
                <div className="px-4 sm:px-6 py-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold leading-7 text-light-primary-text">
                      Order Status
                    </h3>
                  </div>
                </div>
                <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                  <div className="flex flex-col md:flex-row justify-between gap-8">
                    <div className="w-full md:w-1/2 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: "#ffef5a" }}
                          ></span>
                          <span className="text-sm text-light-primary-text">Pending</span>
                        </div>
                        <span className="text-sm leading-5.5 text-light-primary-text">14</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: "#2cd9c5" }}
                          ></span>
                          <span className="text-sm text-light-primary-text">Confirmed</span>
                        </div>
                        <span className="text-sm leading-5.5 text-light-primary-text">60</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: "#e02d69" }}
                          ></span>
                          <span className="text-sm text-light-primary-text">Cancelled</span>
                        </div>
                        <span className="text-sm leading-5.5 text-light-primary-text">5</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: "#826af9" }}
                          ></span>
                          <span className="text-sm text-light-primary-text">Waiting for pick up</span>
                        </div>
                        <span className="text-sm leading-5.5 text-light-primary-text">6</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: "#2d99ff" }}
                          ></span>
                          <span className="text-sm text-light-primary-text">Completed</span>
                        </div>
                        <span className="text-sm leading-5.5 text-light-primary-text">24</span>
                      </div>
                    </div>
                    <div className="w-full md:w-1/2 flex justify-center items-center">
                      <div className="relative w-full">
                        <div className="flex justify-center items-center h-48 w-full">
                          <div className="relative size-36 rounded-full border-8 border-gray-100 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-8 border-t-warning border-r-primary border-b-error border-l-info animate-spin" style={{ animationDuration: '3s' }}></div>
                            <span className="text-lg font-bold text-light-primary-text">109 Total</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6">
          <div className="border border-gray-500/20 rounded-2xl w-full">
            <div className="px-6 py-4">
              <h3 className="text-lg text-light-primary-text font-bold">
                Recent Orders
              </h3>
            </div>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="transition-colors data-[state=selected]:bg-muted border-b px-2 border-[rgba(145,158,171,0.20)] hover:bg-transparent">
                    <th className="p-3 first:pl-5 last:pr-5 text-left align-middle py-3 whitespace-nowrap font-semibold text-sm text-light-primary-text h-auto">
                      Order ID
                    </th>
                    <th className="p-3 first:pl-5 last:pr-5 text-left align-middle py-3 whitespace-nowrap font-semibold text-sm text-light-primary-text h-auto">
                      Customer ID
                    </th>
                    <th className="p-3 first:pl-5 last:pr-5 text-left align-middle py-3 whitespace-nowrap font-semibold text-sm text-light-primary-text h-auto">
                      Order Date
                    </th>
                    <th className="p-3 first:pl-5 last:pr-5 text-left align-middle py-3 whitespace-nowrap font-semibold text-sm text-light-primary-text h-auto">
                      Items
                    </th>
                    <th className="p-3 first:pl-5 last:pr-5 text-left align-middle py-3 whitespace-nowrap font-semibold text-sm text-light-primary-text h-auto">
                      Price
                    </th>
                    <th className="p-3 first:pl-5 whitespace-nowrap last:pr-5 text-left align-middle py-3 font-semibold text-sm text-light-primary-text h-auto">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  <tr className="data-[state=selected]:bg-muted border-b border-[rgba(145,158,171,0.20)] last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4 text-sm text-light-secondary-text">
                      #254830
                    </td>
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4 text-sm text-light-secondary-text">
                      #57390
                    </td>
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4 text-sm text-light-secondary-text">
                      12 Sept, 2027
                    </td>
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4 text-sm text-light-secondary-text">
                      1
                    </td>
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4 text-sm text-light-secondary-text">
                      $20
                    </td>
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4">
                      <span className="px-2 py-1 h-5.5 inline-flex items-center justify-center font-sans rounded-full text-xs font-medium bg-warning-alpha-16 text-warning-dark">
                        Pending
                      </span>
                    </td>
                  </tr>
                  <tr className="data-[state=selected]:bg-muted border-b border-[rgba(145,158,171,0.20)] last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4 text-sm text-light-secondary-text">
                      #254831
                    </td>
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4 text-sm text-light-secondary-text">
                      #57391
                    </td>
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4 text-sm text-light-secondary-text">
                      12 Sept, 2027
                    </td>
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4 text-sm text-light-secondary-text">
                      2
                    </td>
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4 text-sm text-light-secondary-text">
                      $40
                    </td>
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4">
                      <span className="px-2 py-1 h-5.5 inline-flex items-center justify-center font-sans rounded-full text-xs font-medium bg-warning-alpha-16 text-warning-dark">
                        Processing
                      </span>
                    </td>
                  </tr>
                  <tr className="data-[state=selected]:bg-muted border-b border-[rgba(145,158,171,0.20)] last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4 text-sm text-light-secondary-text">
                      #254832
                    </td>
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4 text-sm text-light-secondary-text">
                      #57392
                    </td>
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4 text-sm text-light-secondary-text">
                      12 Sept, 2027
                    </td>
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4 text-sm text-light-secondary-text">
                      3
                    </td>
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4 text-sm text-light-secondary-text">
                      $60
                    </td>
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4">
                      <span className="px-2 py-1 h-5.5 inline-flex items-center justify-center font-sans rounded-full text-xs font-medium bg-warning-alpha-16 text-warning-dark">
                        Processing
                      </span>
                    </td>
                  </tr>
                  <tr className="data-[state=selected]:bg-muted border-b border-[rgba(145,158,171,0.20)] last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4 text-sm text-light-secondary-text">
                      #254833
                    </td>
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4 text-sm text-light-secondary-text">
                      #57393
                    </td>
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4 text-sm text-light-secondary-text">
                      12 Sept, 2027
                    </td>
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4 text-sm text-light-secondary-text">
                      4
                    </td>
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4 text-sm text-light-secondary-text">
                      $80
                    </td>
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4">
                      <span className="px-2 py-1 h-5.5 inline-flex items-center justify-center font-sans rounded-full text-xs font-medium bg-warning-alpha-16 text-warning-dark">
                        Pending
                      </span>
                    </td>
                  </tr>
                  <tr className="data-[state=selected]:bg-muted border-b border-[rgba(145,158,171,0.20)] last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4 text-sm text-light-secondary-text">
                      #254834
                    </td>
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4 text-sm text-light-secondary-text">
                      #57394
                    </td>
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4 text-sm text-light-secondary-text">
                      12 Sept, 2027
                    </td>
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4 text-sm text-light-secondary-text">
                      5
                    </td>
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4 text-sm text-light-secondary-text">
                      $100
                    </td>
                    <td className="px-3 first:pl-5 last:pr-5 align-middle py-4">
                      <span className="px-2 py-1 h-5.5 inline-flex items-center justify-center font-sans rounded-full text-xs font-medium bg-warning-alpha-16 text-warning-dark">
                        Processing
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-4 sm:p-6 flex justify-end border-t border-[rgba(145,158,171,0.20)]">
              <div className="flex items-center gap-2">
                <button type="button"
                  disabled
                  className="w-10 h-7.5 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" className="size-5">
                    <path fill="currentColor" d="M12.056 4.396a.75.75 0 1 1 .888 1.207v.001l-.002.002-.01.007-.04.03-.155.116a46 46 0 0 0-2.246 1.813c-.615.534-1.21 1.093-1.647 1.587a4.6 4.6 0 0 0-.487.635 1 1 0 0 0-.102.206c.009.027.035.093.102.206q.158.261.487.635c.436.493 1.033 1.052 1.648 1.587a43 43 0 0 0 2.4 1.93l.04.028.01.007.002.002v.001a.75.75 0 1 1-.888 1.207h-.002l-.003-.003-.055-.04-.163-.123a47 47 0 0 1-2.325-1.877c-.634-.55-1.288-1.16-1.79-1.726a6 6 0 0 1-.646-.854c-.157-.26-.322-.607-.322-.98 0-.374.165-.72.322-.98.17-.281.397-.572.647-.854.5-.567 1.155-1.176 1.789-1.727a44 44 0 0 1 2.325-1.877l.163-.122.055-.04q0-.002.003-.003h.002z" />
                  </svg>
                </button>
                <div className="flex items-center gap-1">
                  <button type="button" className="w-10 h-7.5 flex items-center justify-center rounded-full text-sm transition-colors bg-primary-lighter text-primary-dark font-semibold">
                    1
                  </button>
                  <button type="button" className="w-10 h-7.5 flex items-center justify-center rounded-full text-sm transition-colors text-gray-600 hover:bg-gray-50 font-medium">
                    2
                  </button>
                  <button type="button" className="w-10 h-7.5 flex items-center justify-center rounded-full text-sm transition-colors text-gray-600 hover:bg-gray-50 font-medium">
                    3
                  </button>
                </div>
                <button type="button" className="w-10 h-7.5 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" className="size-5">
                    <path fill="currentColor" d="M6.897 4.555a.75.75 0 0 1 1.048-.159l.002.001.003.002.054.041.164.122a46 46 0 0 1 2.325 1.877c.634.55 1.288 1.16 1.789 1.727.25.282.477.572.646.853.157.26.322.607.323.98 0 .374-.166.72-.323.981a6 6 0 0 1-.646.854c-.501.566-1.155 1.175-1.79 1.726a44 44 0 0 1-2.324 1.877l-.164.122-.054.041-.003.002-.001.001h-.001a.75.75 0 1 1-.889-1.207l.002-.003.01-.007.041-.029.154-.116a46 46 0 0 0 2.245-1.814c.616-.534 1.212-1.093 1.649-1.587a4.6 4.6 0 0 0 .486-.634c.068-.113.094-.18.103-.206a1 1 0 0 0-.103-.206 4.6 4.6 0 0 0-.486-.635c-.437-.494-1.032-1.053-1.648-1.587a43 43 0 0 0-2.246-1.814l-.154-.116-.04-.03q-.008-.003-.01-.006-.002-.001-.003-.002a.75.75 0 0 1-.159-1.049" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>
  );
}