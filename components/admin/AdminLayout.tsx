"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="xl:flex min-h-screen">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col bg-[rgba(0,171,85,0.08)] transition-[margin] duration-300 ml-0 xl:ml-[280px]">
        <AdminHeader onToggleSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 py-4 px-4 lg:p-6 xl:px-10 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
