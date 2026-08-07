"use client";

import { useState } from "react";
import { DashboardCard } from "@/components/dashboard/ui";

const statistics = {
  day: [
    ["Confirmed order value", "₫4.8M", "Today", "bg-accent-1/60"],
    ["Orders", "47", "Today", "bg-accent-2/60"],
    ["Active customers", "39", "Ordered today", "bg-accent-3/60"],
    ["Active stores", "28", "Received orders today", "bg-accent-5/60"],
  ],
  month: [
    ["Confirmed order value", "₫128.6M", "This month", "bg-accent-1/60"],
    ["Orders", "1,248", "This month", "bg-accent-2/60"],
    ["Active customers", "942", "Ordered this month", "bg-accent-3/60"],
    ["Active stores", "186", "Received orders this month", "bg-accent-5/60"],
  ],
} as const;

export default function Statistics() {
  const [period, setPeriod] = useState<keyof typeof statistics>("month");

  return (
    <section aria-labelledby="statistics-title" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="statistics-title" className="text-lg font-bold">Statistics</h2>
          <p className="mt-1 text-sm text-light-secondary-text">Dummy marketplace totals for the selected period.</p>
        </div>
        <div aria-label="Statistics period" className="flex w-fit rounded-full bg-gray-100 p-1" role="group">
          {(["day", "month"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={period === option}
              className={`h-8 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary ${period === option ? "bg-primary text-white" : "text-light-secondary-text hover:text-gray-900"}`}
              onClick={() => setPeriod(option)}
            >
              Per {option}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics[period].map(([label, value, note, background]) => (
          <DashboardCard key={label} className={`${background} p-5`}>
            <p className="text-sm font-semibold text-light-secondary-text">{label}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
            <p className="mt-2 text-xs text-light-secondary-text">{note}</p>
          </DashboardCard>
        ))}
      </div>
    </section>
  );
}
