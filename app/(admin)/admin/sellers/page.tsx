"use client";

import { use, useMemo, useState, type FormEvent } from "react";
import { Avatar, DashboardButton, DashboardCard, StatusBadge } from "@/components/dashboard/ui";
import { DashboardDialog, DashboardToast, DialogActions } from "@/components/dashboard/Dialog";
import type { StoreProfileResponse } from "@/lib/api/dashboard-types";

type SellerTab = "stores" | "applications";
type ApplicationStatus = "Pending" | "Approved" | "Rejected";
type SellerApplication = {
  id: string;
  ownerName: string;
  email: string;
  phone: string;
  storeName: string;
  category: string;
  submittedAt: string;
  status: ApplicationStatus;
  reason?: string;
};

const INITIAL_STORES: StoreProfileResponse[] = [
  { id: "20000000-0000-0000-0000-000000000001", ownerId: "70000000-0000-0000-0000-000000000001", name: "Daily Basket", description: "Short-date groceries and fresh essentials.", address: "18 Nguyen Hue, District 1, Ho Chi Minh City", latitude: 10.7731, longitude: 106.703, avatarUrl: null, phone: "+84 28 3822 1234", ratingScore: 4.8, isVerify: true, isActive: true, createdAt: "2026-01-12T08:00:00+07:00" },
  { id: "20000000-0000-0000-0000-000000000002", ownerId: "70000000-0000-0000-0000-000000000002", name: "Fresh Corner", description: "Produce rescue bags packed every evening.", address: "42 Le Loi, District 1, Ho Chi Minh City", latitude: 10.7726, longitude: 106.698, avatarUrl: null, phone: "+84 28 3822 1235", ratingScore: 4.4, isVerify: true, isActive: true, createdAt: "2026-02-03T08:00:00+07:00" },
  { id: "20000000-0000-0000-0000-000000000003", ownerId: "70000000-0000-0000-0000-000000000003", name: "Sunrise Bakery", description: "Breads and pastries from the day’s bake.", address: "90 Pasteur, District 3, Ho Chi Minh City", latitude: 10.7796, longitude: 106.695, avatarUrl: null, phone: "+84 28 3822 1236", ratingScore: 4.9, isVerify: true, isActive: true, createdAt: "2026-02-18T08:00:00+07:00" },
  { id: "20000000-0000-0000-0000-000000000004", ownerId: "70000000-0000-0000-0000-000000000004", name: "Meal Box", description: null, address: "11 Vo Van Tan, District 3, Ho Chi Minh City", latitude: 10.7769, longitude: 106.692, avatarUrl: null, phone: null, ratingScore: 3.8, isVerify: false, isActive: false, createdAt: "2026-03-07T08:00:00+07:00" },
  { id: "20000000-0000-0000-0000-000000000005", ownerId: "70000000-0000-0000-0000-000000000005", name: "Sweet Again", description: "Desserts and café treats.", address: "5 Phan Xich Long, Phu Nhuan, Ho Chi Minh City", latitude: 10.798, longitude: 106.686, avatarUrl: null, phone: "+84 28 3822 1238", ratingScore: 4.6, isVerify: false, isActive: true, createdAt: "2026-04-11T08:00:00+07:00" },
];

const INITIAL_APPLICATIONS: SellerApplication[] = [
  { id: "80000000-0000-0000-0000-000000000001", ownerName: "Linh Nguyen", email: "linh@example.com", phone: "+84 912 345 600", storeName: "Green Table", category: "Prepared meals", submittedAt: "2026-07-20", status: "Pending" },
  { id: "80000000-0000-0000-0000-000000000002", ownerName: "Daniel Lee", email: "daniel@example.com", phone: "+84 912 345 601", storeName: "Bread Rescue", category: "Bakery", submittedAt: "2026-07-19", status: "Approved" },
  { id: "80000000-0000-0000-0000-000000000003", ownerName: "Mai Tran", email: "mai@example.com", phone: "+84 912 345 602", storeName: "Fruitful Day", category: "Produce", submittedAt: "2026-07-18", status: "Pending" },
  { id: "80000000-0000-0000-0000-000000000004", ownerName: "An Pham", email: "an@example.com", phone: "+84 912 345 603", storeName: "Last Slice", category: "Desserts", submittedAt: "2026-07-17", status: "Rejected", reason: "Business address could not be verified." },
];

const PAGE_SIZE = 4;
const date = (value: string) => new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
const applicationTone = (status: ApplicationStatus) => status === "Approved" ? "success" : status === "Rejected" ? "error" : "warning";

export default function AdminSellers({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const requestedTab = use(searchParams).tab;
  const [tab, setTab] = useState<SellerTab>(requestedTab === "applications" ? "applications" : "stores");
  const [stores, setStores] = useState(INITIAL_STORES);
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [activeStore, setActiveStore] = useState<StoreProfileResponse | null>(null);
  const [activeApplication, setActiveApplication] = useState<SellerApplication | null>(null);
  const [rejecting, setRejecting] = useState<SellerApplication | null>(null);
  const [toast, setToast] = useState("");

  const filteredStores = useMemo(() => stores.filter((store) => {
    const query = search.trim().toLowerCase();
    return (!query || `${store.name} ${store.ownerId} ${store.address ?? ""}`.toLowerCase().includes(query))
      && (!status || status === "verified" && store.isVerify || status === "active" && store.isActive || status === "inactive" && !store.isActive);
  }), [search, status, stores]);
  const filteredApplications = useMemo(() => applications.filter((application) => {
    const query = search.trim().toLowerCase();
    return (!query || `${application.ownerName} ${application.storeName} ${application.email}`.toLowerCase().includes(query))
      && (!status || application.status === status);
  }), [applications, search, status]);
  const filtered = tab === "stores" ? filteredStores : filteredApplications;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function changeTab(next: SellerTab) {
    setTab(next);
    setSearch("");
    setStatus("");
    setPage(1);
  }

  function updateStore(store: StoreProfileResponse, changes: Partial<Pick<StoreProfileResponse, "isVerify" | "isActive">>) {
    setStores((items) => items.map((item) => item.id === store.id ? { ...item, ...changes } : item));
    setActiveStore(null);
    setToast(`${store.name} was updated.`);
  }

  function updateApplication(application: SellerApplication, next: ApplicationStatus, reason?: string) {
    setApplications((items) => items.map((item) => item.id === application.id ? { ...item, status: next, reason } : item));
    setActiveApplication(null);
    setRejecting(null);
    setToast(`${application.storeName} was ${next.toLowerCase()}.`);
  }

  function reject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rejecting) return;
    const reason = String(new FormData(event.currentTarget).get("reason")).trim();
    if (reason) updateApplication(rejecting, "Rejected", reason);
  }

  return (
    <>
      {toast && <DashboardToast key={toast}>{toast}</DashboardToast>}
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[["Managed stores", stores.length], ["Active stores", stores.filter((store) => store.isActive).length], ["Verified stores", stores.filter((store) => store.isVerify).length], ["Pending applications", applications.filter((application) => application.status === "Pending").length]].map(([label, value]) => <DashboardCard key={label} className="p-4 sm:p-5"><p className="text-sm text-light-secondary-text">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></DashboardCard>)}
      </div>
      <DashboardCard className="w-full overflow-hidden">
        <div className="p-4 sm:p-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">Marketplace operations</p><h1 className="text-xl font-bold">Seller Accounts</h1>
          <div className="mt-5 flex gap-2 border-b border-gray-500/20"><button type="button" aria-pressed={tab === "stores"} onClick={() => changeTab("stores")} className={`border-b-2 px-3 py-2 text-sm font-semibold ${tab === "stores" ? "border-primary text-primary" : "border-transparent text-light-secondary-text"}`}>Stores</button><button type="button" aria-pressed={tab === "applications"} onClick={() => changeTab("applications")} className={`border-b-2 px-3 py-2 text-sm font-semibold ${tab === "applications" ? "border-primary text-primary" : "border-transparent text-light-secondary-text"}`}>Applications (future contract)</button></div>
          {tab === "applications" && <p className="mt-4 rounded-xl bg-warning/15 px-4 py-3 text-sm text-warning-dark">Seller onboarding is retained as a future UI workflow; the backend reference does not define this record yet.</p>}
          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><label className="relative w-full lg:w-80"><span className="sr-only">Search {tab}</span><span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-secondary-text">⌕</span><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={tab === "stores" ? "Search store, owner ID, address..." : "Search applicant or store..."} className="h-9 w-full rounded-full border-none bg-gray-100 pl-9 pr-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" /></label><div className="flex gap-3"><select aria-label={`${tab} status`} value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-9 rounded-full border-none bg-gray-100 px-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"><option value="">All statuses</option>{tab === "stores" ? <><option value="active">Active</option><option value="inactive">Inactive</option><option value="verified">Verified</option></> : <><option>Pending</option><option>Approved</option><option>Rejected</option></>}</select>{(search || status) && <button type="button" onClick={() => { setSearch(""); setStatus(""); setPage(1); }} className="h-9 rounded-full px-3 text-sm font-semibold text-primary hover:bg-primary-lighter">Clear</button>}</div></div>
        </div>
        <div className="overflow-x-auto border-t border-gray-500/20">
          {tab === "stores" ? <table className="w-full text-sm"><thead className="bg-gray-100 text-left"><tr><th className="p-3 pl-5">Store</th><th className="p-3">Owner ID</th><th className="p-3">Address</th><th className="p-3">Rating</th><th className="p-3">Verification</th><th className="p-3">Status</th><th className="p-3 pr-5 text-right">Action</th></tr></thead><tbody>{(rows as StoreProfileResponse[]).map((store) => <tr key={store.id} className="border-t border-gray-500/20 hover:bg-gray-50/50"><td className="p-3 pl-5"><strong className="block">{store.name}</strong><span className="text-xs text-light-secondary-text">{store.phone ?? "No phone"}</span></td><td className="p-3 font-mono text-xs">{store.ownerId.slice(0, 8)}…</td><td className="max-w-64 p-3"><span className="block truncate" title={store.address ?? ""}>{store.address ?? "Not set"}</span></td><td className="p-3">{store.ratingScore.toFixed(1)}</td><td className="p-3"><StatusBadge tone={store.isVerify ? "success" : "warning"}>{store.isVerify ? "Verified" : "Unverified"}</StatusBadge></td><td className="p-3"><StatusBadge tone={store.isActive ? "success" : "error"}>{store.isActive ? "Active" : "Inactive"}</StatusBadge></td><td className="p-3 pr-5 text-right"><button type="button" onClick={() => setActiveStore(store)} className="h-8 rounded-lg px-3 font-semibold text-primary hover:bg-primary-lighter">View</button></td></tr>)}</tbody></table> : <table className="w-full text-sm"><thead className="bg-gray-100 text-left"><tr><th className="p-3 pl-5">Applicant</th><th className="p-3">Store</th><th className="p-3">Category</th><th className="p-3">Submitted</th><th className="p-3">Status</th><th className="p-3 pr-5 text-right">Action</th></tr></thead><tbody>{(rows as SellerApplication[]).map((application) => <tr key={application.id} className="border-t border-gray-500/20 hover:bg-gray-50/50"><td className="p-3 pl-5"><div className="flex items-center gap-3"><Avatar name={application.ownerName} size="sm" /><div><strong className="block">{application.ownerName}</strong><span className="text-xs text-light-secondary-text">{application.email}</span></div></div></td><td className="p-3 font-semibold">{application.storeName}</td><td className="p-3">{application.category}</td><td className="p-3">{date(application.submittedAt)}</td><td className="p-3"><StatusBadge tone={applicationTone(application.status)}>{application.status}</StatusBadge></td><td className="p-3 pr-5 text-right"><button type="button" onClick={() => setActiveApplication(application)} className="h-8 rounded-lg px-3 font-semibold text-primary hover:bg-primary-lighter">Review</button></td></tr>)}</tbody></table>}
          {rows.length === 0 && <div className="px-4 py-14 text-center text-sm text-light-secondary-text">No {tab} match these filters.</div>}
        </div>
        <div className="flex items-center justify-between border-t border-gray-500/20 p-4 sm:px-6"><span className="text-sm text-light-secondary-text">{filtered.length} {tab}</span><div className="flex items-center gap-2"><button type="button" aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40">‹</button><span className="text-sm font-semibold">Page {currentPage} of {totalPages}</span><button type="button" aria-label="Next page" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40">›</button></div></div>
      </DashboardCard>
      {activeStore && <DashboardDialog title={activeStore.name} onClose={() => setActiveStore(null)}><div className="space-y-5 p-5 text-sm sm:p-6"><div className="flex gap-2"><StatusBadge tone={activeStore.isVerify ? "success" : "warning"}>{activeStore.isVerify ? "Verified" : "Unverified"}</StatusBadge><StatusBadge tone={activeStore.isActive ? "success" : "error"}>{activeStore.isActive ? "Active" : "Inactive"}</StatusBadge></div><p className="leading-6 text-light-secondary-text">{activeStore.description ?? "No description provided."}</p><dl className="grid grid-cols-[100px_1fr] gap-3"><dt className="text-light-secondary-text">Store ID</dt><dd className="break-all font-mono text-xs">{activeStore.id}</dd><dt className="text-light-secondary-text">Owner ID</dt><dd className="break-all font-mono text-xs">{activeStore.ownerId}</dd><dt className="text-light-secondary-text">Address</dt><dd>{activeStore.address ?? "Not set"}</dd><dt className="text-light-secondary-text">Coordinates</dt><dd>{activeStore.latitude}, {activeStore.longitude}</dd><dt className="text-light-secondary-text">Created</dt><dd>{date(activeStore.createdAt)}</dd></dl></div><footer className="flex flex-wrap justify-end gap-3 border-t border-gray-500/20 p-4 sm:px-6"><DashboardButton variant="secondary" onClick={() => setActiveStore(null)}>Close</DashboardButton>{!activeStore.isVerify && <DashboardButton onClick={() => updateStore(activeStore, { isVerify: true })}>Verify store</DashboardButton>}<DashboardButton variant={activeStore.isActive ? "danger" : "primary"} onClick={() => updateStore(activeStore, { isActive: !activeStore.isActive })}>{activeStore.isActive ? "Deactivate" : "Activate"}</DashboardButton></footer></DashboardDialog>}
      {activeApplication && <DashboardDialog title={activeApplication.storeName} onClose={() => setActiveApplication(null)}><div className="space-y-4 p-5 text-sm sm:p-6"><p className="rounded-xl bg-warning/15 p-3 text-warning-dark">Future-only onboarding record; no current backend DTO.</p><dl className="grid grid-cols-[100px_1fr] gap-3"><dt className="text-light-secondary-text">Owner</dt><dd>{activeApplication.ownerName}</dd><dt className="text-light-secondary-text">Email</dt><dd>{activeApplication.email}</dd><dt className="text-light-secondary-text">Phone</dt><dd>{activeApplication.phone}</dd><dt className="text-light-secondary-text">Category</dt><dd>{activeApplication.category}</dd><dt className="text-light-secondary-text">Submitted</dt><dd>{date(activeApplication.submittedAt)}</dd>{activeApplication.reason && <><dt className="text-light-secondary-text">Reason</dt><dd>{activeApplication.reason}</dd></>}</dl></div><footer className="flex justify-end gap-3 border-t border-gray-500/20 p-4 sm:px-6"><DashboardButton variant="secondary" onClick={() => setActiveApplication(null)}>Close</DashboardButton>{activeApplication.status === "Pending" && <><DashboardButton variant="danger" onClick={() => { setRejecting(activeApplication); setActiveApplication(null); }}>Reject</DashboardButton><DashboardButton onClick={() => updateApplication(activeApplication, "Approved")}>Approve</DashboardButton></>}</footer></DashboardDialog>}
      {rejecting && <DashboardDialog title={`Reject ${rejecting.storeName}?`} onClose={() => setRejecting(null)}><form onSubmit={reject}><div className="p-5 sm:p-6"><label className="block text-sm font-semibold">Reason<textarea name="reason" required rows={4} className="mt-2 w-full rounded-xl border-none bg-gray-100 p-3 ring ring-gray-500/20 focus:ring-2 focus:ring-primary" /></label></div><DialogActions onCancel={() => setRejecting(null)}><DashboardButton type="submit" variant="danger">Reject application</DashboardButton></DialogActions></form></DashboardDialog>}
    </>
  );
}
