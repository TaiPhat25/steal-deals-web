"use client";

import SellerLayout from "@/components/seller/SellerLayout";
import Link from "next/link";

export default function SellerOrderDetails() {
  const items = [
    { id: "#23453", name: "Product 1", image: "/seller/images/next_assets/0494b7.png", category: "Cloth", quantity: 1, price: "$20" },
    { id: "#23454", name: "Product 2", image: "/seller/images/next_assets/05e8f4.png", category: "Cloth", quantity: 2, price: "$40" },
    { id: "#23455", name: "Product 3", image: "/seller/images/next_assets/068047.png", category: "Cloth", quantity: 3, price: "$60" },
    { id: "#23456", name: "Product 4", image: "/seller/images/next_assets/0710ad.png", category: "Cloth", quantity: 1, price: "$80" },
  ];

  return (
    <SellerLayout>
      <div className="bg-white p-4 sm:p-6 rounded-2xl w-full">
        <div className="pb-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link
              className="text-light-primary-text hover:bg-gray-200 size-8 rounded-full flex items-center justify-center transition-colors"
              href="/seller/orders"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  clipRule="evenodd"
                  d="m2.876 12 .005.115.002.014.003.048c.042.404.22.755.366.997.185.308.43.617.687.908.518.585 1.186 1.207 1.825 1.762a45 45 0 0 0 2.508 2.016l.045.034.012.008.003.002.001.001h.001v.001a1.126 1.126 0 0 0 1.334-1.812l-.002-.001-.01-.008-.039-.028a44 44 0 0 1-2.379-1.912c-.392-.34-.771-.69-1.104-1.02H20a1.126 1.126 0 0 0 0-2.25H6.134c.333-.33.712-.679 1.104-1.02a43 43 0 0 1 2.378-1.912l.04-.028.009-.008h.002l.089-.074a1.125 1.125 0 0 0-1.423-1.74v.002h-.002l-.003.003-.012.009-.045.033a32 32 0 0 0-.745.57c-.478.372-1.119.887-1.763 1.446-.64.555-1.307 1.177-1.824 1.762-.257.291-.501.6-.687.908-.146.242-.324.593-.366.997l-.003.047a1 1 0 0 0-.007.13"
                  fill="currentColor"
                  fillRule="evenodd"
                ></path>
              </svg>
            </Link>
            <h2 className="text-lg sm:text-xl font-bold text-light-primary-text">Details</h2>
          </div>
          <button className="rounded-full inline-flex items-center justify-center cursor-pointer font-bold transition-colors focus:outline-none border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-1 h-7.5 text-[13px] leading-5.5">
            Export
          </button>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Order Info Cards */}
          <div className="border border-gray-500/20 rounded-2xl pb-4 sm:pb-6">
            <div className="py-4 px-4 sm:px-6 border-b border-gray-500/20">
              <h3 className="text-lg font-bold text-light-primary-text">Order Information</h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-light-primary-text">#73423</h2>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 h-5.5 inline-flex items-center justify-center font-public-sans rounded-full text-xs font-medium bg-transparent border border-primary text-primary">
                    paid
                  </span>
                  <span className="px-2 py-1 h-5.5 inline-flex items-center justify-center font-public-sans rounded-full text-xs font-medium bg-primary-alpha-16 text-primary-dark">
                    Delivered
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="rounded-2xl p-4 sm:p-6 bg-accent-1/60">
                  <p className="text-xs font-semibold text-light-secondary-text mb-2">Order Date</p>
                  <p className="text-lg font-bold text-light-primary-text">12 Sept, 2027</p>
                </div>
                <div className="rounded-2xl p-4 sm:p-6 bg-accent-4/60">
                  <p className="text-xs font-semibold text-light-secondary-text mb-2">Total Items</p>
                  <p className="text-lg font-bold text-light-primary-text">7 pcs</p>
                </div>
                <div className="rounded-2xl p-4 sm:p-6 bg-accent-7/60">
                  <p className="text-xs font-semibold text-light-secondary-text mb-2">Delivery Date</p>
                  <p className="text-lg font-bold text-light-primary-text">12 Sept, 2027</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-6">
              {/* Product Listing */}
              <div className="lg:col-span-2">
                <div className="w-full overflow-hidden border border-gray-500/20 rounded-2xl">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-500/20">
                          <th className="h-12 p-3 pl-6 text-left align-middle text-light-primary-text text-sm font-semibold">Product Name</th>
                          <th className="h-12 p-3 text-left align-middle text-light-primary-text text-sm font-semibold">Category</th>
                          <th className="h-12 p-3 text-left align-middle text-light-primary-text text-sm font-semibold">Items</th>
                          <th className="h-12 p-3 text-left align-middle text-light-primary-text text-sm font-semibold">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id} className="border-b border-gray-500/20 last:border-0 hover:bg-gray-50/50 transition-colors">
                            <td className="px-3 pl-6 py-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg shrink-0 relative overflow-hidden bg-gray-50 border border-gray-100">
                                  <img alt={item.name} className="object-cover w-full h-full" src={item.image} />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-light-primary-text">{item.name}</p>
                                  <p className="text-xs text-light-secondary-text">ID: {item.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-sm text-light-secondary-text">{item.category}</td>
                            <td className="px-3 py-2 text-sm text-light-secondary-text">{item.quantity}</td>
                            <td className="px-3 py-2 text-sm font-medium text-light-primary-text">{item.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Order Summary Summary box */}
              <div className="lg:col-span-1">
                <div className="bg-accent-2 rounded-2xl p-4 sm:p-6 w-full">
                  <h3 className="text-lg sm:text-xl font-bold text-light-primary-text mb-4 sm:mb-6">Order Summary</h3>
                  <div className="space-y-4 mb-8 sm:mb-12">
                    <div className="flex items-center justify-between">
                      <span className="text-base text-light-secondary-text">Sub-Total</span>
                      <span className="text-base font-medium text-light-primary-text">$200.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base text-light-secondary-text">VAT (40%)</span>
                      <span className="text-base font-medium text-light-primary-text">$40.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base text-light-secondary-text">Discount</span>
                      <span className="text-base font-medium text-light-primary-text">-$10.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base text-light-secondary-text">Shipment</span>
                      <span className="text-base font-medium text-light-primary-text">$0.00</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-500/20 pt-2 mb-4 sm:mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold leading-7 text-light-primary-text">Total</span>
                      <span className="text-lg font-bold leading-7 text-light-primary-text">$230.00</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-light-primary-text leading-5.5">Pay with Paypal</span>
                    <span className="text-xs font-bold text-[#253D80]">Paypal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info Section */}
          <div className="border border-gray-500/20 rounded-2xl w-full">
            <h3 className="text-lg sm:text-xl font-bold text-light-primary-text py-4 px-6 border-b border-gray-500/20">Customer Information</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 sm:p-6">
              <div className="size-20 sm:size-25 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                <img alt="Customer Avatar" className="object-cover w-full h-full" src="/seller/images/next_assets/user_10ea84.png" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-light-primary-text mb-3">Jenny Wilson</h4>
                <div className="flex flex-wrap gap-y-2 gap-x-5">
                  <div className="flex items-center gap-2 text-light-primary-text">
                    <span className="text-sm">jackson.graham@example.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-light-primary-text">
                    <span className="text-sm">(405) 555-0128</span>
                  </div>
                  <div className="flex items-center gap-2 text-light-primary-text">
                    <span className="text-sm">3517 W. Gray St. Utica, Pennsylvania 57867</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
