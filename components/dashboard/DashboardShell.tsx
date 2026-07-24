"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Avatar } from "./ui";

export type DashboardRole = "admin" | "seller";

type IconName =
  | "dashboard"
  | "users"
  | "customers"
  | "sellers"
  | "categories"
  | "support"
  | "products"
  | "orders"
  | "settings"
  | "inbox";

type NavItem = {
  label: string;
  href: string;
  icon: IconName;
};

const navigation: Record<
  DashboardRole,
  { brand: string; items: NavItem[]; communications: NavItem[] }
> = {
  admin: {
    brand: "StealDeal Admin",
    items: [
      { label: "Dashboard", href: "/admin", icon: "dashboard" },
      { label: "User Accounts", href: "/admin/users", icon: "users" },
      { label: "Customer Accounts", href: "/admin/customers", icon: "customers" },
      { label: "Seller Approvals", href: "/admin/sellers", icon: "sellers" },
      { label: "Food Categories", href: "/admin/categories", icon: "categories" },
      { label: "Support Tickets", href: "/admin/support", icon: "support" },
    ],
    communications: [
      { label: "Inbox & Chats", href: "/admin/inbox", icon: "inbox" },
    ],
  },
  seller: {
    brand: "StealDeal Seller",
    items: [
      { label: "Dashboard", href: "/seller", icon: "dashboard" },
      { label: "Surplus Bags", href: "/seller/products", icon: "products" },
      { label: "Orders", href: "/seller/orders", icon: "orders" },
      { label: "Store Profile", href: "/seller/settings", icon: "settings" },
    ],
    communications: [
      { label: "Inbox & Chats", href: "/seller/inbox", icon: "inbox" },
    ],
  },
};

const iconPaths: Record<IconName, string> = {
  dashboard: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  users:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  customers:
    "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  sellers:
    "M3 10h18M5 6h14l1 4H4zM5 10v10h14V10M9 20v-6h6v6",
  categories: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  support:
    "M4 13a8 8 0 0 1 16 0M4 13v4a2 2 0 0 0 2 2h1v-6H4zM20 13v4a2 2 0 0 1-2 2h-1v-6h3z",
  products: "M4 7h16l-1 13H5zM8 7a4 4 0 0 1 8 0",
  orders: "M6 3h12v18H6zM9 8h6M9 12h6M9 16h4",
  settings:
    "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 8.97 4.6 1.7 1.7 0 0 0 10 3.08V3h4v.08a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9 1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15",
  inbox: "M4 5h16v12H8l-4 4zM8 9h8M8 13h5",
};

function Icon({ name, className = "size-5.5" }: { name: IconName; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

function Sidebar({
  role,
  isOpen,
  onClose,
}: {
  role: DashboardRole;
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const config = navigation[role];

  const renderItem = (item: NavItem) => {
    const root = item.href === `/${role}`;
    const active = pathname === item.href || (!root && pathname.startsWith(`${item.href}/`));

    return (
      <Link
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-white transition-colors ${
          active ? "bg-primary-dark font-semibold" : "hover:bg-white/10"
        }`}
        href={item.href}
        key={item.href}
        onClick={onClose}
      >
        <Icon name={item.icon} />
        <span className="whitespace-nowrap">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {isOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-45 bg-black/50 xl:hidden"
          onClick={onClose}
          type="button"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-primary-darker transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
        }`}
      >
        <div className="flex h-[70px] shrink-0 items-center justify-between gap-2 p-4">
          <Link className="text-xl font-bold tracking-wide text-white" href={`/${role}`}>
            {config.brand}
          </Link>
          <button
            aria-label="Close navigation"
            className="rounded-md p-1 text-white hover:bg-white/10 xl:hidden"
            onClick={onClose}
            type="button"
          >
            <span aria-hidden="true" className="text-2xl leading-none">
              ×
            </span>
          </button>
        </div>
        <nav
          aria-label={`${role === "admin" ? "Admin" : "Seller"} navigation`}
          className="dashboard-scrollbar flex-1 space-y-1.5 overflow-y-auto p-4 pb-10"
        >
          {config.items.map(renderItem)}
          <p className="px-4 pb-1 pt-5 text-xs font-semibold uppercase tracking-wider text-warning-light">
            Communications
          </p>
          {config.communications.map(renderItem)}
        </nav>
      </aside>
    </>
  );
}

function Header({
  role,
  onToggleSidebar,
}: {
  role: DashboardRole;
  onToggleSidebar: () => void;
}) {
  const [openMenu, setOpenMenu] = useState<"language" | "notifications" | "profile" | null>(
    null,
  );
  const seller = role === "seller";
  const toggle = (menu: NonNullable<typeof openMenu>) =>
    setOpenMenu((current) => (current === menu ? null : menu));

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-4 lg:px-6 xl:px-10">
      <div className="flex items-center gap-4">
        <button
          aria-label="Open navigation"
          className="rounded-md p-2 text-gray-800 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary xl:hidden"
          onClick={onToggleSidebar}
          type="button"
        >
          <span aria-hidden="true" className="text-xl leading-none">
            ☰
          </span>
        </button>
        {seller && (
          <label className="relative hidden md:block">
            <span className="sr-only">Search surplus bags</span>
            <span
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
            >
              ⌕
            </span>
            <input
              className="h-10 w-[344px] rounded-full bg-gray-100 py-2 pl-10 pr-4 text-sm ring-1 ring-gray-500/20 focus:ring-primary"
              placeholder="Search surplus bags..."
              readOnly
              type="search"
            />
          </label>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative">
          <button
            aria-expanded={openMenu === "language"}
            aria-label="Choose language"
            className="flex items-center gap-1 rounded-full px-2 py-1 text-sm hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => toggle("language")}
            type="button"
          >
            <span aria-hidden="true">🇬🇧</span>
            <span className="hidden sm:inline">English</span>
          </button>
          {openMenu === "language" && (
            <div className="absolute right-0 z-50 mt-2 w-36 rounded-lg border border-gray-100 bg-white p-1 shadow-lg">
              <button
                className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50"
                onClick={() => setOpenMenu(null)}
                type="button"
              >
                🇬🇧 English
              </button>
            </div>
          )}
        </div>

        <Link
          aria-label="Open inbox, 5 unread messages"
          className="relative flex size-9 items-center justify-center rounded-full hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary"
          href={`/${role}/inbox`}
        >
          <Icon className="size-5" name="inbox" />
          <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-warning text-[10px] font-bold">
            5
          </span>
        </Link>

        <div className="relative">
          <button
            aria-expanded={openMenu === "notifications"}
            aria-label="Show notifications"
            className="relative flex size-9 items-center justify-center rounded-full hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => toggle("notifications")}
            type="button"
          >
            <span aria-hidden="true">♢</span>
            <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white">
              8
            </span>
          </button>
          {openMenu === "notifications" && (
            <div className="absolute right-0 z-50 mt-2 w-72 rounded-lg border border-gray-100 bg-white shadow-lg">
              <p className="border-b border-gray-100 px-4 py-2 text-sm font-semibold">
                Notifications
              </p>
              <p className="px-4 py-4 text-center text-xs text-gray-500">
                No new notifications
              </p>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            aria-expanded={openMenu === "profile"}
            className="flex items-center gap-2 rounded-lg p-1 text-sm hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => toggle("profile")}
            type="button"
          >
            <Avatar name="John Smith" size="sm" />
            <span className="hidden text-left md:block">
              <span className="block font-semibold">John Smith</span>
              <span className="block text-xs text-gray-500">
                {seller ? "Store Owner" : "Administrator"}
              </span>
            </span>
            <span aria-hidden="true">⌄</span>
          </button>
          {openMenu === "profile" && (
            <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-100 bg-white p-1 text-sm shadow-lg">
              <p className="border-b border-gray-100 px-3 py-2 text-xs text-gray-500">
                {seller ? "Manage shop account" : "Manage account"}
              </p>
              {seller ? (
                <Link
                  className="block rounded-md px-3 py-2 hover:bg-gray-50"
                  href="/seller/settings"
                >
                  Store profile
                </Link>
              ) : (
                <>
                  <button className="block w-full rounded-md px-3 py-2 text-left hover:bg-gray-50" type="button">
                    Profile
                  </button>
                  <button className="block w-full rounded-md px-3 py-2 text-left hover:bg-gray-50" type="button">
                    Settings
                  </button>
                </>
              )}
              <button
                className="block w-full border-t border-gray-100 px-3 py-2 text-left text-error hover:bg-gray-50"
                type="button"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function DashboardShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role: DashboardRole;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role={role} />
      <div className="flex min-h-screen min-w-0 flex-col bg-primary-alpha-16 xl:ml-[280px]">
        <Header onToggleSidebar={() => setSidebarOpen(true)} role={role} />
        <main className="flex-1 overflow-auto px-4 py-4 lg:p-6 xl:px-10">{children}</main>
      </div>
    </div>
  );
}
