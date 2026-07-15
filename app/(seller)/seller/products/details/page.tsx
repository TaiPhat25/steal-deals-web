"use client";

import SellerLayout from "@/components/seller/SellerLayout";
import Link from "next/link";

export default function SellerProductDetails() {
  const variants = [
    { sku: "#73423", variantId: "#V-001", image: "/seller/images/next_assets/01a793.png", color: "Black", size: "S", visible: "1 x 80ml", status: "Draft", statusClass: "bg-warning-alpha-16 text-warning-dark" },
    { sku: "#73424", variantId: "#V-002", image: "/seller/images/next_assets/023d38.png", color: "White", size: "M", visible: "1 x 80ml", status: "Active", statusClass: "bg-primary-alpha-16 text-primary-dark" },
    { sku: "#73425", variantId: "#V-003", image: "/seller/images/next_assets/034b1d.png", color: "Blue", size: "L", visible: "1 x 80ml", status: "Active", statusClass: "bg-primary-alpha-16 text-primary-dark" },
    { sku: "#73426", variantId: "#V-004", image: "/seller/images/next_assets/04ba25.png", color: "Red", size: "XL", visible: "1 x 80ml", status: "Draft", statusClass: "bg-warning-alpha-16 text-warning-dark" },
  ];

  return (
    <SellerLayout>
      <div className="bg-white rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
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
            <h2 className="text-lg sm:text-xl font-bold text-light-primary-text">Product Details</h2>
          </div>
          <Link
            className="rounded-full inline-flex items-center justify-center cursor-pointer font-bold transition-colors focus:outline-none border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-1.5 text-[13px] leading-5.5"
            href="/seller/products/edit"
          >
            Edit
          </Link>
        </div>

        {/* Basic Information */}
        <div className="border rounded-2xl border-gray-500/20">
          <h2 className="text-lg py-4 px-6 font-bold text-light-primary-text border-b border-gray-500/20">Basic Information</h2>
          <div className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center pb-4 sm:pb-6">
              <div className="rounded-full size-20 shrink-0 relative overflow-hidden bg-gray-100">
                <img alt="Product" className="object-cover w-full h-full" src="/seller/images/next_assets/03c8fb.png" />
              </div>
              <div className="flex-1 flex items-start justify-between">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-light-primary-text">Running Shoes</h3>
                  <div className="flex items-center gap-4 text-base text-light-primary-text">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-light-secondary-text">Category:</span>
                      <span className="text-sm text-light-primary-text">Footwear</span>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="h-5.5 inline-flex items-center justify-center font-public-sans rounded-full bg-primary-alpha-16 text-primary-dark px-2.5 py-0.5 text-xs font-semibold">
                    Published
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 rounded-lg border border-gray-500/20">
              <h4 className="mb-1 text-sm font-semibold text-light-primary-text">Short Description</h4>
              <p className="text-base max-w-2xl leading-relaxed text-light-secondary-text">
                Delivery usually takes 2–5 business days, depending on your location and the selected shipping method. You’ll receive a tracking
                number once your order is shipped.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 pt-4 sm:pt-6 sm:grid-cols-3">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center rounded-full size-10 bg-success-lighter text-success shrink-0">
                  <svg className="size-6" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M8.397 21.923c1.461 1.131 3.556 1.118 4.959-.138a93 93 0 0 0 8.584-8.768c.363-.422.595-.947.647-1.515.084-.91.213-2.69.141-4.432-.036-.87-.123-1.756-.3-2.53-.173-.748-.454-1.506-.958-2.01s-1.262-.785-2.01-.957c-.774-.178-1.66-.265-2.53-.301-1.742-.072-3.522.057-4.432.14a2.7 2.7 0 0 0-1.515.648 93 93 0 0 0-8.768 8.584c-1.256 1.403-1.27 3.498-.138 4.959a34.8 34.8 0 0 0 6.32 6.32m3.958-1.255c-.838.749-2.123.779-3.04.069a33.3 33.3 0 0 1-6.052-6.052c-.71-.917-.68-2.202.07-3.04a92 92 0 0 1 8.628-8.447c.196-.169.43-.27.673-.292.886-.082 2.59-.204 4.235-.136.823.034 1.607.116 2.255.265.672.154 1.088.357 1.286.555s.4.614.555 1.286c.15.648.23 1.432.265 2.255.068 1.644-.054 3.35-.136 4.235a1.2 1.2 0 0 1-.292.674 92 92 0 0 1-8.447 8.628M17.5 8.75a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs mb-1 font-normal text-light-secondary-text">Discount Title</p>
                  <p className="text-sm font-semibold text-light-primary-text">Weekly Promo</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center text-error rounded-full size-10 bg-error-lighter shrink-0">
                  <svg className="size-6" fill="none" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M4.584 1.918a3.42 3.42 0 0 1 3.314 2.588l.004.014.003.014.711 3.384h17.242c.708 0 1.33-.002 1.817.075.518.082 1.021.274 1.375.76.342.472.393 1.012.356 1.547-.036.521-.168 1.172-.323 1.941-.543 2.7-1.068 5.177-2.285 6.952-.625.913-1.435 1.649-2.513 2.149-1.069.496-2.363.743-3.934.743h-9.078c-1.312.01-2.427 1.085-2.514 2.499h14.574q.04 0 .078.004a2.748 2.748 0 0 1-.078 5.496 2.75 2.75 0 0 1-2.447-4h-4.439a2.75 2.75 0 1 1-4.895 0H8.55c-.746 0-1.299-.62-1.299-1.321 0-1.747 1.047-3.27 2.554-3.887L7.287 8.89a.7.7 0 0 1-.034-.164l-.81-3.856-.046-.157a1.92 1.92 0 0 0-1.813-1.295H3.333a.75.75 0 0 1 0-1.5z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs mb-1 font-normal text-light-secondary-text">Slug</p>
                  <p className="text-sm font-semibold text-light-primary-text">running-shoes-v001</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center text-warning rounded-full size-10 bg-warning-lighter shrink-0">
                  <svg className="size-6" fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M8 8.734c3.576 0 6.6 2.592 6.6 5.933v.6H1.4v-.6c0-3.341 3.024-5.933 6.6-5.933m0 1.2c-2.808 0-5.021 1.85-5.355 4.133h10.71C13.022 11.785 10.808 9.934 8 9.934m0-9.2a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-normal mb-1 text-light-secondary-text">Seller</p>
                  <p className="text-sm font-semibold text-light-primary-text">Arlene McCoy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="border rounded-2xl border-gray-500/20">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-500/20 py-4 px-4 sm:px-6">Media</h2>
          <div className="p-4 sm:p-6">
            <div className="flex gap-3 flex-wrap">
              {["01b848.png", "02a502.png", "03c8fb.png", "045d79.png"].map((img, idx) => (
                <div key={idx} className="size-16 sm:size-25 rounded-lg overflow-hidden border border-gray-100">
                  <img alt="Media" className="object-cover w-full h-full" src={`/seller/images/next_assets/${img}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Variant */}
        <div className="border rounded-2xl border-gray-500/20">
          <h2 className="text-lg font-bold px-4 sm:px-6 py-4">Variants</h2>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-500/20">
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
                  <tr key={v.sku} className="border-b border-gray-500/20 last:border-0 hover:bg-gray-50/50 transition-colors">
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
    </SellerLayout>
  );
}
