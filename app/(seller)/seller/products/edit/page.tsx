"use client";

import SellerLayout from "@/components/seller/SellerLayout";
import Link from "next/link";

export default function SellerEditProduct() {
  const variants = [
    { sku: "#73423", variantId: "#V-001", image: "/seller/images/next_assets/01a793.png", color: "Black", size: "L", visible: "1 x 80ml", status: "Active", statusClass: "bg-primary-alpha-16 text-primary-dark" },
    { sku: "#73424", variantId: "#V-002", image: "/seller/images/next_assets/023d38.png", color: "Black", size: "M", visible: "1 x 80ml", status: "Active", statusClass: "bg-primary-alpha-16 text-primary-dark" },
  ];

  return (
    <SellerLayout>
      <div className="w-full bg-white rounded-2xl mx-auto p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <Link
                className="text-light-primary-text hover:bg-gray-200 size-8 rounded-full flex items-center justify-center transition-colors"
                href="/seller/products"
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
              <h2 className="text-lg sm:text-xl font-bold text-light-primary-text">Edit Product</h2>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20 mb-4 sm:mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <input
                  className="block px-3.5 py-4 w-full h-14 text-sm text-light-primary-text bg-transparent rounded-full border border-gray-500/20 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                  defaultValue="Running Shoes"
                  type="text"
                />
                <label className="absolute text-sm text-primary duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left left-3.5 bg-white peer-placeholder-shown:bg-transparent peer-focus:bg-white px-1 peer-focus:px-1 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:text-light-disabled-text peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1 cursor-text">
                  Product Name
                </label>
              </div>
              <div className="relative">
                <input
                  className="block px-3.5 py-4 w-full h-14 text-sm text-light-primary-text bg-transparent rounded-full border border-gray-500/20 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                  defaultValue="running-shoes"
                  type="text"
                />
                <label className="absolute text-sm text-primary duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left left-3.5 bg-white peer-placeholder-shown:bg-transparent peer-focus:bg-white px-1 peer-focus:px-1 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:text-light-disabled-text peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1 cursor-text">
                  Slug
                </label>
              </div>
              <div className="relative">
                <input
                  className="block px-3.5 py-4 w-full h-14 text-sm text-light-primary-text bg-transparent rounded-full border border-gray-500/20 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                  defaultValue="Footwear"
                  type="text"
                />
                <label className="absolute text-sm text-primary duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left left-3.5 bg-white peer-placeholder-shown:bg-transparent peer-focus:bg-white px-1 peer-focus:px-1 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:text-light-disabled-text peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1 cursor-text">
                  Category
                </label>
              </div>
              <div className="relative">
                <input
                  className="block px-3.5 py-4 w-full h-14 text-sm text-light-primary-text bg-transparent rounded-full border border-gray-500/20 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                  defaultValue="Shoes"
                  type="text"
                />
                <label className="absolute text-sm text-primary duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left left-3.5 bg-white peer-placeholder-shown:bg-transparent peer-focus:bg-white px-1 peer-focus:px-1 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:text-light-disabled-text peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1 cursor-text">
                  Product Type
                </label>
              </div>
            </div>
            <div className="mt-6">
              <div className="relative">
                <textarea
                  className="block px-3.5 py-4 w-full text-sm text-light-primary-text bg-transparent rounded-2xl border border-gray-500/20 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer h-[150px] resize-none min-h-[120px]"
                  defaultValue="Delivery usually takes 2–5 business days, depending on your location and the selected shipping method."
                />
                <label className="absolute text-sm text-primary duration-300 transform -translate-y-4 scale-75 top-2 z-10 left-3.5 origin-left bg-white peer-placeholder-shown:bg-transparent peer-focus:bg-white px-1 peer-focus:px-2 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:text-light-disabled-text peer-placeholder-shown:translate-y-3 peer-placeholder-shown:top-1 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1 cursor-text">
                  Short Description
                </label>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20 mb-4 sm:mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Media</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="w-full">
                <div className="group relative flex h-full min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-500/30 bg-white p-6 text-center hover:bg-gray-50">
                  <div className="flex flex-col items-center gap-4">
                    <svg className="size-10 text-light-secondary-text" fill="none" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M19.167 3.75a1.25 1.25 0 0 1 0 2.5c-3.767 0-6.467.003-8.52.279-2.017.271-3.223.785-4.11 1.674-.89.888-1.404 2.094-1.675 4.111-.276 2.053-.278 4.753-.278 8.52s.002 6.467.278 8.52c.271 2.017.786 3.222 1.674 4.11.26.261.55.488.878.688 3.427-3.87 7.306-8.664 11.822-11.415 2.3-1.401 4.832-2.32 7.621-2.32 2.205-.001 4.497.574 6.891 1.836q.002-.682.003-1.42v-.832a1.25 1.25 0 0 1 2.5 0v.832c0 3.697.002 6.596-.302 8.854-.308 2.294-.953 4.115-2.384 5.545-1.43 1.43-3.25 2.075-5.544 2.384-2.259.303-5.158.301-8.854.301s-6.594.002-8.853-.301c-2.294-.309-4.115-.954-5.545-2.384s-2.076-3.25-2.384-5.545c-.304-2.258-.301-5.157-.301-8.854s-.003-6.594.3-8.852c.31-2.294.954-4.116 2.385-5.546S8.02 4.36 10.315 4.051c2.258-.303 5.156-.3 8.852-.3zm7.69 19.166c-2.216.001-4.301.726-6.32 1.956-3.845 2.342-7.216 6.343-10.567 10.16q.322.058.678.106c2.053.276 4.752.28 8.519.28s6.467-.004 8.52-.28c2.017-.271 3.223-.785 4.11-1.674.89-.888 1.403-2.093 1.675-4.11.157-1.173.224-2.558.254-4.232-2.54-1.582-4.812-2.206-6.869-2.206m3.144-20.832c.69 0 1.25.56 1.25 1.25V8.75h5.416a1.25 1.25 0 0 1 0 2.5h-5.416v5.416a1.25 1.25 0 0 1-2.5 0v-5.415h-5.417a1.25 1.25 0 0 1 0-2.5h5.417V3.333c0-.69.56-1.25 1.25-1.25z"
                        fill="currentColor"
                      ></path>
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-light-secondary-text">Upload Cover photo</p>
                      <p className="text-xs text-light-secondary-text">Allowed *.jpeg, *.jpg, *.png, *.gif</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full flex gap-3 items-center">
                <div className="size-20 rounded-lg overflow-hidden border border-gray-200 relative bg-gray-50">
                  <img alt="thumb" className="object-cover w-full h-full" src="/seller/images/next_assets/01651b.png" />
                </div>
                <div className="size-20 rounded-lg overflow-hidden border border-gray-200 relative bg-gray-50">
                  <img alt="thumb" className="object-cover w-full h-full" src="/seller/images/next_assets/02f93d.png" />
                </div>
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20 mb-4 sm:mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Variants</h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="h-12 p-3 pl-5 text-left font-semibold text-sm text-light-primary-text">SKU ID</th>
                    <th className="h-12 p-3 text-left font-semibold text-sm text-light-primary-text">Variant ID</th>
                    <th className="h-12 p-3 text-left font-semibold text-sm text-light-primary-text">Image</th>
                    <th className="h-12 p-3 text-left font-semibold text-sm text-light-primary-text">Color</th>
                    <th className="h-12 p-3 text-left font-semibold text-sm text-light-primary-text">Size</th>
                    <th className="h-12 p-3 text-left font-semibold text-sm text-light-primary-text">Visible</th>
                    <th className="h-12 p-3 pr-5 text-left font-semibold text-sm text-light-primary-text">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => (
                    <tr key={v.sku} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-3 py-3.5 pl-5 text-sm text-light-secondary-text">{v.sku}</td>
                      <td className="px-3 py-3.5 text-sm text-light-secondary-text">{v.variantId}</td>
                      <td className="px-3 py-3.5 text-sm text-light-secondary-text">
                        <div className="size-8 rounded-lg relative overflow-hidden bg-gray-50">
                          <img alt="variant" className="object-contain w-full h-full" src={v.image} />
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-sm text-light-secondary-text">{v.color}</td>
                      <td className="px-3 py-3.5 text-sm text-light-secondary-text">{v.size}</td>
                      <td className="px-3 py-3.5 text-sm text-light-secondary-text">{v.visible}</td>
                      <td className="px-3 py-3.5 pr-5">
                        <span className={`px-2 py-1 h-5.5 inline-flex items-center justify-center font-public-sans rounded-full text-xs font-medium ${v.statusClass}`}>
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4 sm:pt-6">
          <Link
            className="rounded-full inline-flex items-center justify-center cursor-pointer font-bold transition-colors focus:outline-none border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-1 h-9 text-sm leading-6"
            href="/seller/products"
          >
            Cancel
          </Link>
          <Link
            className="rounded-full inline-flex items-center justify-center cursor-pointer font-bold transition-colors focus:outline-none bg-primary text-white hover:bg-primary-dark px-4 py-1 h-9 text-sm leading-6"
            href="/seller/products"
          >
            Save
          </Link>
        </div>
      </div>
    </SellerLayout>
  );
}
