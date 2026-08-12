"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Avatar } from "./ui";

export type DashboardRole = "admin" | "seller";

type IconName =
  | "dashboard"
  | "users"
  | "sellers"
  | "categories"
  | "support"
  | "products"
  | "orders"
  | "reviews"
  | "settings"
  | "inbox"
  | "language"
  | "notifications";

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
      { label: "Buyer Management", href: "/admin/buyers", icon: "users" },
      { label: "Seller Management", href: "/admin/sellers", icon: "sellers" },
      { label: "Admin Management", href: "/admin/admins", icon: "users" },
      { label: "Food Categories", href: "/admin/categories", icon: "categories" },
      { label: "Support & Reports", href: "/admin/support", icon: "support" },
    ],
    communications: [],
  },
  seller: {
    brand: "StealDeal Seller",
    items: [
      { label: "Dashboard", href: "/seller", icon: "dashboard" },
      { label: "Surplus Bags", href: "/seller/products", icon: "products" },
      { label: "Orders", href: "/seller/orders", icon: "orders" },
      { label: "Store Reviews", href: "/seller/store-reviews", icon: "reviews" },
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
  sellers:
    "M3 10h18M5 6h14l1 4H4zM5 10v10h14V10M9 20v-6h6v6",
  categories: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  support:
    "M4 13a8 8 0 0 1 16 0M4 13v4a2 2 0 0 0 2 2h1v-6H4zM20 13v4a2 2 0 0 1-2 2h-1v-6h3z",
  products: "M4 7h16l-1 13H5zM8 7a4 4 0 0 1 8 0",
  orders: "M6 3h12v18H6zM9 8h6M9 12h6M9 16h4",
  reviews:
    "M4 5h16v11H8l-4 4V5zM12 8l1.1 2.3 2.5.3-1.8 1.7.4 2.5L12 13.6l-2.2 1.2.4-2.5-1.8-1.7 2.5-.3L12 8z",
  settings:
    "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 8.97 4.6 1.7 1.7 0 0 0 10 3.08V3h4v.08a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9 1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15",
  inbox: "M4 5h16v12H8l-4 4zM8 9h8M8 13h5",
  language: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M3 12h18M12 3c2.3 2.5 3.5 5.5 3.5 9s-1.2 6.5-3.5 9M12 3c-2.3 2.5-3.5 5.5-3.5 9s1.2 6.5 3.5 9",
  notifications: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
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
          {config.communications.length > 0 && (
            <>
              <p className="px-4 pb-1 pt-5 text-xs font-semibold uppercase tracking-wider text-warning-light">
                Communications
              </p>
              {config.communications.map(renderItem)}
            </>
          )}
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
  const { currentUser, isLoading, logout } = useAuth();
  const displayName = currentUser?.name || "Account";
  const [openMenu, setOpenMenu] = useState<"notifications" | "profile" | null>(
    null,
  );
  const seller = role === "seller";
  const toggle = (menu: NonNullable<typeof openMenu>) =>
    setOpenMenu((current) => (current === menu ? null : menu));
  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      window.location.assign("/login");
    }
  };

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
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div aria-label="Current language: English" className="flex items-center gap-1.5 px-2 py-1 text-sm">
          <Icon className="size-4.5" name="language" />
          <span className="hidden sm:inline">English</span>
        </div>

        {seller && (
          <Link
            aria-label="Open inbox, 5 unread messages"
            className="relative flex size-9 items-center justify-center rounded-full hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary"
            href="/seller/inbox"
          >
            <Icon className="size-5" name="inbox" />
            <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-warning text-[10px] font-bold">
              5
            </span>
          </Link>
        )}

        <div className="relative">
          <button
            aria-expanded={openMenu === "notifications"}
            aria-label="Show notifications"
            className="relative flex size-9 items-center justify-center rounded-full hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => toggle("notifications")}
            type="button"
          >
            <Icon className="size-5" name="notifications" />
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
            aria-label="Open account menu"
            className="flex items-center gap-2 rounded-lg p-1 text-sm hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => toggle("profile")}
            type="button"
          >
            <Avatar name={displayName} size="sm" />
            <span className="hidden text-left md:block">
              <span className="block font-semibold">{displayName}</span>
              <span className="block text-xs text-gray-500" title={seller ? undefined : "Frontend role code: SuperAdmin"}>{seller ? "Store Owner" : "Super Admin"}</span>
            </span>
            <span aria-hidden="true">⌄</span>
          </button>
          {openMenu === "profile" && (
            <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-100 bg-white p-1 text-sm shadow-lg">
              {seller && (
                <>
                  <p className="border-b border-gray-100 px-3 py-2 text-xs text-gray-500">
                    Manage shop account
                  </p>
                  <Link
                    className="block rounded-md px-3 py-2 hover:bg-gray-50"
                    href="/seller/settings"
                  >
                    Store profile
                  </Link>
                </>
              )}
              <button
                className={`block w-full px-3 py-2 text-left text-error hover:bg-gray-50 ${seller ? "border-t border-gray-100" : ""}`}
                disabled={isLoading}
                onClick={handleLogout}
                type="button"
              >
                {isLoading ? "Logging out…" : "Logout"}
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
