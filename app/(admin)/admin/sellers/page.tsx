"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  Avatar,
  DashboardButton,
  DashboardCard,
  StatusBadge,
} from "@/components/dashboard/ui";
import {
  DashboardDialog,
  DashboardToast,
  DialogActions,
} from "@/components/dashboard/Dialog";

type SellerTab = "stores" | "applications";
type StoreStatus = "Active" | "Warned" | "Suspended";
type ApplicationStatus = "Pending" | "Approved" | "Rejected";
type ModerationAction = "warn" | "suspend" | "reinstate";

type Store = {
  id: number;
  name: string;
  owner: string;
  email: string;
  phone: string;
  category: string;
  joinedAt: string;
  status: StoreStatus;
  openReports: number;
  warningCount: number;
  lastAction?: string;
};

type SellerApplication = {
  id: number;
  name: string;
  email: string;
  phone: string;
  storeName: string;
  category: string;
  submittedAt: string;
  status: ApplicationStatus;
  reason?: string;
};

const INITIAL_STORES: Store[] = [
  { id: 5101, name: "Daily Basket", owner: "Nora Garcia", email: "nora@example.com", phone: "+1 555 123 1004", category: "Groceries", joinedAt: "2026-01-12", status: "Active", openReports: 0, warningCount: 0 },
  { id: 5102, name: "Fresh Corner", owner: "Ali Rahman", email: "ali@example.com", phone: "+1 555 123 1005", category: "Produce", joinedAt: "2026-02-03", status: "Warned", openReports: 2, warningCount: 1, lastAction: "Warning issued for repeated pickup-window changes." },
  { id: 5103, name: "Sunrise Bakery", owner: "Emily Chen", email: "emily@example.com", phone: "+1 555 123 1000", category: "Bakery", joinedAt: "2026-02-18", status: "Active", openReports: 1, warningCount: 0 },
  { id: 5104, name: "Meal Box", owner: "Michael Johnson", email: "michael@example.com", phone: "+1 555 123 1001", category: "Prepared meals", joinedAt: "2026-03-07", status: "Suspended", openReports: 3, warningCount: 2, lastAction: "Suspended while misleading listing reports are reviewed." },
  { id: 5105, name: "Sweet Again", owner: "Sarah Smith", email: "sarah@example.com", phone: "+1 555 123 1002", category: "Desserts", joinedAt: "2026-04-11", status: "Active", openReports: 0, warningCount: 0 },
  { id: 5106, name: "Bottle & Bean", owner: "David Williams", email: "david@example.com", phone: "+1 555 123 1003", category: "Drinks", joinedAt: "2026-05-21", status: "Active", openReports: 1, warningCount: 0 },
];

const INITIAL_APPLICATIONS: SellerApplication[] = [
  { id: 73423, name: "Linh Nguyen", email: "linh@example.com", phone: "+84 912 345 600", storeName: "Green Table", category: "Prepared meals", submittedAt: "2026-07-20", status: "Pending" },
  { id: 73424, name: "Daniel Lee", email: "daniel@example.com", phone: "+84 912 345 601", storeName: "Bread Rescue", category: "Bakery", submittedAt: "2026-07-19", status: "Approved" },
  { id: 73425, name: "Mai Tran", email: "mai@example.com", phone: "+84 912 345 602", storeName: "Fruitful Day", category: "Produce", submittedAt: "2026-07-18", status: "Pending" },
  { id: 73426, name: "An Pham", email: "an@example.com", phone: "+84 912 345 603", storeName: "Last Slice", category: "Desserts", submittedAt: "2026-07-17", status: "Rejected", reason: "Business address could not be verified." },
  { id: 73427, name: "Huy Le", email: "huy@example.com", phone: "+84 912 345 604", storeName: "Pantry Plus", category: "Groceries", submittedAt: "2026-07-16", status: "Pending" },
];

const PAGE_SIZE = 4;

function storeTone(status: StoreStatus) {
  return status === "Active" ? "success" : status === "Warned" ? "warning" : "error";
}

function applicationTone(status: ApplicationStatus) {
  return status === "Approved" ? "success" : status === "Rejected" ? "error" : "warning";
}

export default function AdminSellers() {
  const [tab, setTab] = useState<SellerTab>("stores");
  const [stores, setStores] = useState(INITIAL_STORES);
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [activeStore, setActiveStore] = useState<Store | null>(null);
  const [moderating, setModerating] = useState<{
    store: Store;
    action: ModerationAction;
  } | null>(null);
  const [activeApplication, setActiveApplication] = useState<SellerApplication | null>(null);
  const [rejecting, setRejecting] = useState<SellerApplication | null>(null);
  const [toast, setToast] = useState("");

  const filteredStores = useMemo(
    () =>
      stores.filter((store) => {
        const query = search.trim().toLowerCase();
        return (
          (!query ||
            `${store.name} ${store.owner} ${store.email}`.toLowerCase().includes(query)) &&
          (!status || store.status === status)
        );
      }),
    [search, status, stores],
  );

  const filteredApplications = useMemo(
    () =>
      applications.filter((application) => {
        const query = search.trim().toLowerCase();
        return (
          (!query ||
            `${application.name} ${application.storeName} ${application.email}`
              .toLowerCase()
              .includes(query)) &&
          (!status || application.status === status)
        );
      }),
    [applications, search, status],
  );

  const filtered = tab === "stores" ? filteredStores : filteredApplications;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const suspendedCount = stores.filter((store) => store.status === "Suspended").length;
  const reportCount = stores.reduce((sum, store) => sum + store.openReports, 0);
  const pendingCount = applications.filter(
    (application) => application.status === "Pending",
  ).length;

  function changeTab(next: SellerTab) {
    setTab(next);
    setSearch("");
    setStatus("");
    setPage(1);
  }

  function startModeration(store: Store, action: ModerationAction) {
    setActiveStore(null);
    setModerating({ store, action });
  }

  function moderate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!moderating) return;
    const reason = String(new FormData(event.currentTarget).get("reason") ?? "").trim();
    const { action, store } = moderating;
    const nextStatus: StoreStatus =
      action === "warn" ? "Warned" : action === "suspend" ? "Suspended" : "Active";
    const actionText =
      action === "warn"
        ? `Warning issued: ${reason}`
        : action === "suspend"
          ? `Suspended: ${reason}`
          : "Store reinstated.";

    setStores((items) =>
      items.map((item) =>
        item.id === store.id
          ? {
              ...item,
              status: nextStatus,
              warningCount: item.warningCount + (action === "warn" ? 1 : 0),
              lastAction: actionText,
            }
          : item,
      ),
    );
    setModerating(null);
    setPage(1);
    setToast(
      action === "warn"
        ? `Warning issued to ${store.name}.`
        : action === "suspend"
          ? `${store.name} was suspended.`
          : `${store.name} was reinstated.`,
    );
  }

  function updateApplication(
    application: SellerApplication,
    next: ApplicationStatus,
    reason?: string,
  ) {
    setApplications((items) =>
      items.map((item) =>
        item.id === application.id ? { ...item, status: next, reason } : item,
      ),
    );
    setActiveApplication(null);
    setRejecting(null);
    setPage(1);
    setToast(`${application.storeName} was ${next.toLowerCase()}.`);
  }

  function reject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rejecting) return;
    const reason = String(new FormData(event.currentTarget).get("reason") ?? "").trim();
    if (reason) updateApplication(rejecting, "Rejected", reason);
  }

  return (
    <>
      {toast && <DashboardToast key={toast}>{toast}</DashboardToast>}

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard className="p-4 sm:p-5">
          <p className="text-sm text-light-secondary-text">Managed stores</p>
          <p className="mt-1 text-2xl font-bold">{stores.length}</p>
        </DashboardCard>
        <DashboardCard className="p-4 sm:p-5">
          <p className="text-sm text-light-secondary-text">Suspended stores</p>
          <p className="mt-1 text-2xl font-bold">{suspendedCount}</p>
        </DashboardCard>
        <DashboardCard className="p-4 sm:p-5">
          <p className="text-sm text-light-secondary-text">Open reports</p>
          <p className="mt-1 text-2xl font-bold">{reportCount}</p>
        </DashboardCard>
        <DashboardCard className="p-4 sm:p-5">
          <p className="text-sm text-light-secondary-text">Pending applications</p>
          <p className="mt-1 text-2xl font-bold">{pendingCount}</p>
        </DashboardCard>
      </div>

      <DashboardCard className="w-full overflow-hidden">
        <div className="p-4 sm:p-6">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Marketplace operations
            </p>
            <h1 className="text-xl font-bold">Seller Accounts</h1>
          </div>

          <div
            aria-label="Seller account sections"
            className="mt-5 flex gap-2 border-b border-gray-500/20"
          >
            {(["stores", "applications"] as const).map((item) => (
              <button
                aria-pressed={tab === item}
                className={`border-b-2 px-3 py-2 text-sm font-semibold ${
                  tab === item
                    ? "border-primary text-primary"
                    : "border-transparent text-light-secondary-text hover:text-light-primary-text"
                }`}
                key={item}
                onClick={() => changeTab(item)}
                type="button"
              >
                {item === "stores" ? "Stores" : `Applications (${pendingCount})`}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative w-full sm:w-80">
              <span className="sr-only">
                Search {tab === "stores" ? "stores" : "seller applications"}
              </span>
              <span
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-light-secondary-text"
              >
                ⌕
              </span>
              <input
                className="h-9 w-full rounded-full border-none bg-gray-100 pl-9 pr-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder={tab === "stores" ? "Search store or owner..." : "Search applications..."}
                type="search"
                value={search}
              />
            </label>
            <div className="flex gap-3">
              <select
                aria-label={tab === "stores" ? "Store status" : "Application status"}
                className="h-9 rounded-full border-none bg-gray-100 px-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
                value={status}
              >
                <option value="">All statuses</option>
                {tab === "stores" ? (
                  <>
                    <option>Active</option>
                    <option>Warned</option>
                    <option>Suspended</option>
                  </>
                ) : (
                  <>
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                  </>
                )}
              </select>
              {(search || status) && (
                <button
                  className="h-9 rounded-full px-3 text-sm font-semibold text-primary hover:bg-primary-lighter"
                  onClick={() => {
                    setSearch("");
                    setStatus("");
                    setPage(1);
                  }}
                  type="button"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border-t border-gray-500/20">
          {tab === "stores" ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3 pl-5">Store</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Open reports</th>
                  <th className="p-3">Joined</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(rows as Store[]).map((store) => (
                  <tr
                    className="border-t border-gray-500/20 hover:bg-gray-50/50"
                    key={store.id}
                  >
                    <td className="p-3 pl-5">
                      <div className="flex items-center gap-3">
                        <Avatar name={store.name} />
                        <div>
                          <strong className="block">{store.name}</strong>
                          <span className="text-xs text-light-secondary-text">
                            {store.owner} · {store.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{store.category}</td>
                    <td className="p-3 font-semibold">{store.openReports}</td>
                    <td className="p-3">{store.joinedAt}</td>
                    <td className="p-3">
                      <StatusBadge tone={storeTone(store.status)}>{store.status}</StatusBadge>
                    </td>
                    <td className="p-3 pr-5 text-right">
                      <button
                        className="h-8 rounded-lg px-3 font-semibold text-primary hover:bg-primary-lighter"
                        onClick={() => setActiveStore(store)}
                        type="button"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3 pl-5">Applicant</th>
                  <th className="p-3">Store</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Submitted</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(rows as SellerApplication[]).map((application) => (
                  <tr
                    className="border-t border-gray-500/20 hover:bg-gray-50/50"
                    key={application.id}
                  >
                    <td className="p-3 pl-5">
                      <div className="flex items-center gap-3">
                        <Avatar name={application.name} />
                        <div>
                          <strong className="block">{application.name}</strong>
                          <span className="text-xs text-light-secondary-text">
                            {application.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-semibold">{application.storeName}</td>
                    <td className="p-3">{application.category}</td>
                    <td className="p-3">{application.submittedAt}</td>
                    <td className="p-3">
                      <StatusBadge tone={applicationTone(application.status)}>
                        {application.status}
                      </StatusBadge>
                    </td>
                    <td className="p-3 pr-5 text-right">
                      <button
                        className="h-8 rounded-lg px-3 font-semibold text-primary hover:bg-primary-lighter"
                        onClick={() => setActiveApplication(application)}
                        type="button"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {rows.length === 0 && (
            <div className="px-4 py-14 text-center text-sm text-light-secondary-text">
              No {tab} match these filters.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-500/20 p-4 sm:px-6">
          <span className="text-sm text-light-secondary-text">
            {filtered.length} {tab}
          </span>
          <div className="flex items-center gap-2">
            <button
              aria-label="Previous page"
              className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              type="button"
            >
              ‹
            </button>
            <span className="text-sm font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              aria-label="Next page"
              className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40"
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
              type="button"
            >
              ›
            </button>
          </div>
        </div>
      </DashboardCard>

      {activeStore && (
        <DashboardDialog title={activeStore.name} onClose={() => setActiveStore(null)}>
          <div className="space-y-5 p-5 text-sm sm:p-6">
            <div className="flex items-center gap-3">
              <Avatar name={activeStore.name} size="lg" />
              <div>
                <strong className="block text-base">{activeStore.owner}</strong>
                <span className="text-light-secondary-text">Store #{activeStore.id}</span>
              </div>
            </div>
            <dl className="grid grid-cols-[120px_1fr] gap-3">
              <dt className="text-light-secondary-text">Email</dt>
              <dd>{activeStore.email}</dd>
              <dt className="text-light-secondary-text">Phone</dt>
              <dd>{activeStore.phone}</dd>
              <dt className="text-light-secondary-text">Category</dt>
              <dd>{activeStore.category}</dd>
              <dt className="text-light-secondary-text">Open reports</dt>
              <dd>{activeStore.openReports}</dd>
              <dt className="text-light-secondary-text">Warnings</dt>
              <dd>{activeStore.warningCount}</dd>
              <dt className="text-light-secondary-text">Status</dt>
              <dd>
                <StatusBadge tone={storeTone(activeStore.status)}>
                  {activeStore.status}
                </StatusBadge>
              </dd>
            </dl>
            {activeStore.lastAction && (
              <div className="rounded-xl bg-gray-100 p-3">
                <strong className="block text-xs">Latest moderation action</strong>
                <p className="mt-1 text-light-secondary-text">{activeStore.lastAction}</p>
              </div>
            )}
          </div>
          <footer className="flex flex-wrap justify-end gap-3 border-t border-gray-500/20 p-4 sm:px-6">
            <DashboardButton variant="secondary" onClick={() => setActiveStore(null)}>
              Close
            </DashboardButton>
            {activeStore.status === "Suspended" ? (
              <DashboardButton onClick={() => startModeration(activeStore, "reinstate")}>
                Reinstate store
              </DashboardButton>
            ) : (
              <>
                <DashboardButton
                  variant="secondary"
                  onClick={() => startModeration(activeStore, "warn")}
                >
                  Issue warning
                </DashboardButton>
                <DashboardButton
                  variant="danger"
                  onClick={() => startModeration(activeStore, "suspend")}
                >
                  Suspend store
                </DashboardButton>
              </>
            )}
          </footer>
        </DashboardDialog>
      )}

      {moderating && (
        <DashboardDialog
          title={
            moderating.action === "warn"
              ? `Warn ${moderating.store.name}?`
              : moderating.action === "suspend"
                ? `Suspend ${moderating.store.name}?`
                : `Reinstate ${moderating.store.name}?`
          }
          onClose={() => setModerating(null)}
        >
          <form onSubmit={moderate}>
            <div className="space-y-4 p-5 text-sm sm:p-6">
              <p className="text-light-secondary-text">
                {moderating.action === "warn"
                  ? "The warning is recorded for the store owner but does not restrict the store."
                  : moderating.action === "suspend"
                    ? "Suspension represents hiding listings and blocking new orders. The owner can still sign in to handle existing obligations."
                    : "Reinstating represents making listings visible and allowing new orders again."}
              </p>
              {moderating.action !== "reinstate" && (
                <label className="block font-semibold">
                  Reason
                  <textarea
                    autoFocus
                    className="mt-2 w-full rounded-xl border-none bg-gray-100 p-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"
                    name="reason"
                    required
                    rows={4}
                  />
                </label>
              )}
            </div>
            <DialogActions onCancel={() => setModerating(null)}>
              <DashboardButton
                type="submit"
                variant={moderating.action === "suspend" ? "danger" : "primary"}
              >
                {moderating.action === "warn"
                  ? "Issue warning"
                  : moderating.action === "suspend"
                    ? "Suspend store"
                    : "Reinstate store"}
              </DashboardButton>
            </DialogActions>
          </form>
        </DashboardDialog>
      )}

      {activeApplication && (
        <DashboardDialog
          title={activeApplication.storeName}
          onClose={() => setActiveApplication(null)}
        >
          <div className="space-y-4 p-5 text-sm sm:p-6">
            <div className="flex items-center gap-3">
              <Avatar name={activeApplication.name} size="lg" />
              <div>
                <strong className="block text-base">{activeApplication.name}</strong>
                <span className="text-light-secondary-text">
                  Application #{activeApplication.id}
                </span>
              </div>
            </div>
            <dl className="grid grid-cols-[110px_1fr] gap-3">
              <dt className="text-light-secondary-text">Email</dt>
              <dd>{activeApplication.email}</dd>
              <dt className="text-light-secondary-text">Phone</dt>
              <dd>{activeApplication.phone}</dd>
              <dt className="text-light-secondary-text">Category</dt>
              <dd>{activeApplication.category}</dd>
              <dt className="text-light-secondary-text">Submitted</dt>
              <dd>{activeApplication.submittedAt}</dd>
              <dt className="text-light-secondary-text">Status</dt>
              <dd>
                <StatusBadge tone={applicationTone(activeApplication.status)}>
                  {activeApplication.status}
                </StatusBadge>
              </dd>
              {activeApplication.reason && (
                <>
                  <dt className="text-light-secondary-text">Reason</dt>
                  <dd>{activeApplication.reason}</dd>
                </>
              )}
            </dl>
          </div>
          <footer className="flex flex-wrap justify-end gap-3 border-t border-gray-500/20 p-4 sm:px-6">
            <DashboardButton
              variant="secondary"
              onClick={() => setActiveApplication(null)}
            >
              Close
            </DashboardButton>
            {activeApplication.status !== "Rejected" && (
              <DashboardButton
                variant="danger"
                onClick={() => {
                  setRejecting(activeApplication);
                  setActiveApplication(null);
                }}
              >
                Reject
              </DashboardButton>
            )}
            {activeApplication.status !== "Approved" && (
              <DashboardButton
                onClick={() => updateApplication(activeApplication, "Approved")}
              >
                Approve seller
              </DashboardButton>
            )}
          </footer>
        </DashboardDialog>
      )}

      {rejecting && (
        <DashboardDialog
          title={`Reject ${rejecting.storeName}?`}
          onClose={() => setRejecting(null)}
        >
          <form onSubmit={reject}>
            <div className="p-5 sm:p-6">
              <label className="block text-sm font-semibold">
                Reason
                <textarea
                  autoFocus
                  className="mt-2 w-full rounded-xl border-none bg-gray-100 p-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"
                  defaultValue={rejecting.reason}
                  name="reason"
                  required
                  rows={4}
                />
              </label>
            </div>
            <DialogActions onCancel={() => setRejecting(null)}>
              <DashboardButton type="submit" variant="danger">
                Reject application
              </DashboardButton>
            </DialogActions>
          </form>
        </DashboardDialog>
      )}
    </>
  );
}
