"use client";

import SellerLayout from "@/components/seller/SellerLayout";

export default function SellerSettings() {
  const tabs = [
    { name: "General", active: false },
    { name: "Shop", active: true },
    { name: "SEO", active: false },
    { name: "Payment API", active: false },
    { name: "Maintains", active: false },
  ];

  const operatingHours = [
    { day: "Monday", open: "09:00 AM", close: "06:00 PM", active: true },
    { day: "Tuesday", open: "09:00 AM", close: "06:00 PM", active: true },
    { day: "Wednesday", open: "09:00 AM", close: "06:00 PM", active: true },
    { day: "Thursday", open: "09:00 AM", close: "06:00 PM", active: true },
    { day: "Friday", open: "09:00 AM", close: "06:00 PM", active: true },
    { day: "Saturday", open: "09:00 AM", close: "06:00 PM", active: false },
    { day: "Sunday", open: "Closed", close: "Closed", active: false },
  ];

  return (
    <SellerLayout>
      <div className="bg-white rounded-2xl p-4 sm:p-6 space-y-6">
        <div className="mb-1">
          <h2 className="text-xl font-bold text-light-primary-text">Settings</h2>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-500/20 scrollbar-hide">
          <nav aria-label="Tabs" className="-mb-px flex space-x-6 sm:space-x-10 min-w-max">
            {tabs.map((tab, idx) => (
              <button
                key={idx}
                className={`whitespace-nowrap py-3 border-b-3 font-semibold text-sm transition-colors ${
                  tab.active
                    ? "border-primary text-light-primary-text"
                    : "border-transparent text-light-secondary-text hover:text-light-primary-text hover:border-gray-300"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div className="border border-gray-500/20 rounded-2xl p-4 sm:p-6 space-y-6">
            <h3 className="text-lg font-bold text-light-primary-text">Shop Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div className="group relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-500/30 bg-white p-6 hover:bg-gray-50">
                <p className="text-sm font-semibold text-light-secondary-text">Shop Cover Image</p>
                <p className="text-xs text-light-secondary-text">Max size of 3.1 MB</p>
              </div>
              <div className="group relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-500/30 bg-white p-6 hover:bg-gray-50">
                <p className="text-sm font-semibold text-light-secondary-text">Shop Logo</p>
                <p className="text-xs text-light-secondary-text">Max size of 3.1 MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div className="relative">
                <input
                  className="block px-3.5 py-4 w-full h-14 text-sm text-light-primary-text bg-transparent rounded-full border border-gray-500/20 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                  defaultValue="Steal Deals Shop"
                  type="text"
                />
                <label className="absolute text-sm text-primary duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left left-3.5 bg-white px-1 start-1">
                  Shop Name
                </label>
              </div>
              <div className="relative">
                <input
                  className="block px-3.5 py-4 w-full h-14 text-sm text-light-primary-text bg-transparent rounded-full border border-gray-500/20 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                  defaultValue="steal-deals-shop"
                  type="text"
                />
                <label className="absolute text-sm text-primary duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left left-3.5 bg-white px-1 start-1">
                  Shop Slug
                </label>
              </div>
              <div className="relative">
                <input
                  className="block px-3.5 py-4 w-full h-14 text-sm text-light-primary-text bg-transparent rounded-full border border-gray-500/20 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                  defaultValue="+1 555-0128"
                  type="text"
                />
                <label className="absolute text-sm text-primary duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left left-3.5 bg-white px-1 start-1">
                  Phone Number
                </label>
              </div>
              <div className="relative">
                <input
                  className="block px-3.5 py-4 w-full h-14 text-sm text-light-primary-text bg-transparent rounded-full border border-gray-500/20 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                  defaultValue="shop@stealdeals.com"
                  type="text"
                />
                <label className="absolute text-sm text-primary duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left left-3.5 bg-white px-1 start-1">
                  Email Address
                </label>
              </div>
            </div>

            <div className="relative">
              <textarea
                className="block px-3.5 py-4 w-full text-sm text-light-primary-text bg-transparent rounded-2xl border border-gray-500/20 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer resize-none h-32"
                defaultValue="Steal Deals Shop offers curated streetwear jackets, footwear and premium brand items at the best prices."
              />
              <label className="absolute text-sm text-primary duration-300 transform -translate-y-4 scale-75 top-2 z-10 left-3.5 origin-left bg-white px-1 start-1">
                Shop Description
              </label>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="border border-gray-500/20 rounded-2xl p-4 sm:p-6 space-y-6">
            <h3 className="text-lg font-bold text-light-primary-text">Operating Hours</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {operatingHours.map((hour, idx) => (
                <div key={idx} className={`flex items-center justify-between rounded-lg p-4 ${hour.active ? "bg-primary-alpha-16" : "bg-gray-100"}`}>
                  <div>
                    <span className="text-sm font-bold text-light-primary-text block">{hour.day}</span>
                    <span className="text-xs font-semibold text-light-secondary-text">{hour.open} to {hour.close}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input className="peer sr-only" defaultChecked={hour.active} type="checkbox" />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:height-4 after:width-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button className="rounded-full inline-flex items-center justify-center cursor-pointer font-bold transition-colors focus:outline-none border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 text-sm leading-6">
              Cancel
            </button>
            <button className="rounded-full inline-flex items-center justify-center cursor-pointer font-bold transition-colors focus:outline-none bg-primary text-white hover:bg-primary-dark px-4 py-2 text-sm leading-6">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
