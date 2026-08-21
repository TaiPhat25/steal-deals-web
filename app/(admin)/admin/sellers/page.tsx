"use client";

import { Suspense, use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import AdminUsersPage from "@/components/admin/users/AdminUsersPage";
import { DashboardButton, DashboardCard, StatusBadge } from "@/components/dashboard/ui";
import { DashboardDialog, DashboardToast } from "@/components/dashboard/Dialog";
import type { PendingStoreResponse, StoreProfileResponse } from "@/lib/api/dashboard-types";
import { listPendingStores, listStores, rejectPendingStore, toggleStoreActive, verifyStore } from "@/lib/api/store";

type SellerTab = "accounts" | "stores" | "applications";

const INITIAL_STORES: StoreProfileResponse[] = [
  { id: "20000000-0000-0000-0000-000000000001", ownerId: "70000000-0000-0000-0000-000000000001", name: "Daily Basket", description: "Short-date groceries and fresh essentials.", address: "18 Nguyen Hue, District 1, Ho Chi Minh City", latitude: 10.7731, longitude: 106.703, avatarUrl: null, phone: "+84 28 3822 1234", ratingScore: 4.8, isVerify: true, isActive: true, createdAt: "2026-01-12T08:00:00+07:00" },
  { id: "20000000-0000-0000-0000-000000000002", ownerId: "70000000-0000-0000-0000-000000000002", name: "Fresh Corner", description: "Produce rescue bags packed every evening.", address: "42 Le Loi, District 1, Ho Chi Minh City", latitude: 10.7726, longitude: 106.698, avatarUrl: null, phone: "+84 28 3822 1235", ratingScore: 4.4, isVerify: true, isActive: true, createdAt: "2026-02-03T08:00:00+07:00" },
  { id: "20000000-0000-0000-0000-000000000003", ownerId: "70000000-0000-0000-0000-000000000003", name: "Sunrise Bakery", description: "Breads and pastries from the day’s bake.", address: "90 Pasteur, District 3, Ho Chi Minh City", latitude: 10.7796, longitude: 106.695, avatarUrl: null, phone: "+84 28 3822 1236", ratingScore: 4.9, isVerify: true, isActive: true, createdAt: "2026-02-18T08:00:00+07:00" },
  { id: "20000000-0000-0000-0000-000000000004", ownerId: "70000000-0000-0000-0000-000000000004", name: "Meal Box", description: null, address: "11 Vo Van Tan, District 3, Ho Chi Minh City", latitude: 10.7769, longitude: 106.692, avatarUrl: null, phone: null, ratingScore: 3.8, isVerify: false, isActive: false, createdAt: "2026-03-07T08:00:00+07:00" },
  { id: "20000000-0000-0000-0000-000000000005", ownerId: "70000000-0000-0000-0000-000000000005", name: "Sweet Again", description: "Desserts and café treats.", address: "5 Phan Xich Long, Phu Nhuan, Ho Chi Minh City", latitude: 10.798, longitude: 106.686, avatarUrl: null, phone: "+84 28 3822 1238", ratingScore: 4.6, isVerify: false, isActive: true, createdAt: "2026-04-11T08:00:00+07:00" },
];

const PAGE_SIZE = 4;
const date = (value: string) => new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));

export default function AdminSellers({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const requestedTab = use(searchParams).tab;
  const router = useRouter();
  const { accessToken, isInitialized } = useAuth();
  const [tab, setTab] = useState<SellerTab>(requestedTab === "stores" || requestedTab === "applications" ? requestedTab : "accounts");
  const [stores, setStores] = useState(INITIAL_STORES);
  const [pendingStores, setPendingStores] = useState<PendingStoreResponse[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [activeStore, setActiveStore] = useState<StoreProfileResponse | null>(null);
  const [activePendingStore, setActivePendingStore] = useState<PendingStoreResponse | null>(null);
  const [toast, setToast] = useState("");
  const [storesLoading, setStoresLoading] = useState(true);
  const [storesDemoReason, setStoresDemoReason] = useState("");
  const [storesError, setStoresError] = useState("");
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingError, setPendingError] = useState("");
  const [busyStoreId, setBusyStoreId] = useState("");
  const [busyAction, setBusyAction] = useState<"verify" | "reject" | "">("");
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    if (!isInitialized) return;
    let active = true;
    const timeout = window.setTimeout(() => {
      setStoresLoading(true);
      setStoresDemoReason("");
      setStoresError("");
      void listStores()
        .then((items) => {
          if (active) setStores(items);
        })
        .catch((caught) => {
          if (!active) return;
          setStores(INITIAL_STORES);
          setStoresDemoReason(caught instanceof Error ? caught.message : "The Store Service could not be reached.");
        })
        .finally(() => {
          if (active) setStoresLoading(false);
        });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [isInitialized, reloadVersion]);

  useEffect(() => {
    if (!isInitialized) return;
    let active = true;
    const timeout = window.setTimeout(() => {
      setPendingLoading(true);
      setPendingError("");

      if (!accessToken) {
        setPendingError("An admin session is required to load pending stores.");
        setPendingLoading(false);
        return;
      }

      void listPendingStores(accessToken)
        .then((items) => {
          if (active) setPendingStores(items);
        })
        .catch((caught) => {
          if (active) setPendingError(caught instanceof Error ? caught.message : "Unable to load pending stores.");
        })
        .finally(() => {
          if (active) setPendingLoading(false);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [accessToken, isInitialized, reloadVersion]);

  const filteredStores = useMemo(() => stores.filter((store) => {
    const query = search.trim().toLowerCase();
    return (!query || `${store.name} ${store.ownerId} ${store.address ?? ""}`.toLowerCase().includes(query))
      && (!status || status === "verified" && store.isVerify || status === "active" && store.isActive || status === "inactive" && !store.isActive);
  }), [search, status, stores]);
  const filteredPendingStores = useMemo(() => pendingStores.filter((store) => {
    const query = search.trim().toLowerCase();
    return !query || `${store.name} ${store.ownerId} ${store.address ?? ""} ${store.phone ?? ""}`.toLowerCase().includes(query);
  }), [pendingStores, search]);
  const filtered = tab === "stores" ? filteredStores : filteredPendingStores;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function changeTab(next: SellerTab) {
    setTab(next);
    router.replace(next === "accounts" ? "/admin/sellers" : `/admin/sellers?tab=${next}`, { scroll: false });
    setSearch("");
    setStatus("");
    setPage(1);
  }

  async function updateStore(store: StoreProfileResponse, changes: Partial<Pick<StoreProfileResponse, "isVerify" | "isActive">>) {
    setBusyStoreId(store.id);
    setStoresError("");
    try {
      if (!storesDemoReason) {
        if (!accessToken) throw new Error("An admin session is required to update stores.");
        if (changes.isVerify) await verifyStore(accessToken, store.id);
        if (changes.isActive !== undefined) await toggleStoreActive(accessToken, store.id);
      }
      setStores((items) => items.map((item) => item.id === store.id ? { ...item, ...changes } : item));
      setActiveStore(null);
      setToast(`${store.name} was updated.`);
    } catch (caught) {
      setStoresError(caught instanceof Error ? caught.message : "Unable to update this store.");
    } finally {
      setBusyStoreId("");
    }
  }

  async function approvePendingStore(store: PendingStoreResponse) {
    if (!accessToken) {
      setPendingError("An admin session is required to verify stores.");
      return;
    }
    setBusyStoreId(store.id);
    setBusyAction("verify");
    setPendingError("");
    try {
      await verifyStore(accessToken, store.id);
      setPendingStores((items) => items.filter((item) => item.id !== store.id));
      setStores((items) => items.map((item) => item.id === store.id ? { ...item, isVerify: true } : item));
      setActivePendingStore(null);
      setToast(`${store.name} was verified.`);
    } catch (caught) {
      setPendingError(caught instanceof Error ? caught.message : "Unable to verify this store.");
    } finally {
      setBusyStoreId("");
      setBusyAction("");
    }
  }

  async function rejectPendingStoreAction(store: PendingStoreResponse) {
    if (!accessToken) {
      setPendingError("An admin session is required to reject stores.");
      return;
    }
    setBusyStoreId(store.id);
    setBusyAction("reject");
    setPendingError("");
    try {
      await rejectPendingStore(accessToken, store.id);
      setPendingStores((items) => items.filter((item) => item.id !== store.id));
      setActivePendingStore(null);
      setToast(`${store.name} was rejected.`);
    } catch (caught) {
      setPendingError(caught instanceof Error ? caught.message : "Unable to reject this store.");
    } finally {
      setBusyStoreId("");
      setBusyAction("");
    }
  }

  return (
    <>
      {toast && <DashboardToast key={toast}>{toast}</DashboardToast>}
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[["Managed stores", stores.length], ["Active stores", stores.filter((store) => store.isActive).length], ["Verified stores", stores.filter((store) => store.isVerify).length], ["Pending verification", pendingStores.length]].map(([label, value]) => <DashboardCard key={label} className="p-4 sm:p-5"><p className="text-sm text-light-secondary-text">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></DashboardCard>)}
      </div>
      <DashboardCard className="mb-4 w-full overflow-hidden">
        <div className="p-4 sm:p-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">Marketplace operations</p><h1 className="text-xl font-bold">Seller Management</h1>
          <div className="mt-5 flex gap-2 overflow-x-auto border-b border-gray-500/20"><button type="button" aria-pressed={tab === "accounts"} onClick={() => changeTab("accounts")} className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold ${tab === "accounts" ? "border-primary text-primary" : "border-transparent text-light-secondary-text"}`}>Seller accounts</button><button type="button" aria-pressed={tab === "stores"} onClick={() => changeTab("stores")} className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold ${tab === "stores" ? "border-primary text-primary" : "border-transparent text-light-secondary-text"}`}>Stores</button><button type="button" aria-pressed={tab === "applications"} onClick={() => changeTab("applications")} className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold ${tab === "applications" ? "border-primary text-primary" : "border-transparent text-light-secondary-text"}`}>Pending verification</button></div>
        </div>
      </DashboardCard>
      {tab === "accounts" && (
        <Suspense fallback={null}>
          <AdminUsersPage basePath="/admin/sellers" baseQuery="tab=accounts" fixedRole="Seller" title="Seller accounts" />
        </Suspense>
      )}
      <DashboardCard className={tab === "accounts" ? "hidden" : "w-full overflow-hidden"}>
        <div className="p-4 sm:p-6">
          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative w-full lg:w-80"><span className="sr-only">Search {tab}</span><span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-secondary-text">⌕</span><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search store, owner ID, address..." className="h-9 w-full rounded-full border-none bg-gray-100 pl-9 pr-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" /></label>
            <div className="flex gap-3">
              {tab === "stores" && <select aria-label="Store status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-9 rounded-full border-none bg-gray-100 px-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Disabled</option><option value="verified">Verified</option></select>}
              {(search || status) && <button type="button" onClick={() => { setSearch(""); setStatus(""); setPage(1); }} className="h-9 rounded-full px-3 text-sm font-semibold text-primary hover:bg-primary-lighter">Clear</button>}
            </div>
          </div>
        </div>
        {tab === "stores" && storesDemoReason && <div className="flex flex-col gap-3 border-t border-warning/30 bg-warning/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6" role="status"><p><strong>Demo data active.</strong> {storesDemoReason}</p><button type="button" onClick={() => setReloadVersion((version) => version + 1)} className="h-8 shrink-0 rounded-full px-3 font-semibold text-warning-dark hover:bg-warning/15">Retry API</button></div>}
        {tab === "stores" && storesError && <div role="alert" className="border-t border-error/30 bg-error-alpha-16 px-4 py-3 text-sm text-error-dark sm:px-6">{storesError}</div>}
        {tab === "applications" && pendingError && <div role="alert" className="flex flex-col gap-3 border-t border-error/30 bg-error-alpha-16 px-4 py-3 text-sm text-error-dark sm:flex-row sm:items-center sm:justify-between sm:px-6"><span>{pendingError}</span><button type="button" onClick={() => setReloadVersion((version) => version + 1)} className="h-8 shrink-0 rounded-full px-3 font-semibold hover:bg-error-alpha-16">Retry API</button></div>}
        <div className="overflow-x-auto border-t border-gray-500/20">
          {tab === "stores" && storesLoading ? <div className="px-4 py-14 text-center text-sm text-light-secondary-text" role="status">Loading stores…</div> : tab === "stores" ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left"><tr><th className="p-3 pl-5">No.</th><th className="p-3">Store</th><th className="p-3">Address</th><th className="p-3">Rating</th><th className="p-3">Verification</th><th className="p-3">Status</th><th className="p-3 pr-5 text-right">Action</th></tr></thead>
              <tbody>{(rows as StoreProfileResponse[]).map((store, index) => <tr key={store.id} className="border-t border-gray-500/20 hover:bg-gray-50/50"><td className="p-3 pl-5 text-light-secondary-text">{(currentPage - 1) * PAGE_SIZE + index + 1}</td><td className="p-3"><strong className="block">{store.name}</strong><span className="text-xs text-light-secondary-text">{store.phone ?? "No phone"}</span></td><td className="max-w-64 p-3"><span className="block truncate" title={store.address ?? ""}>{store.address ?? "Not set"}</span></td><td className="p-3">{store.ratingScore.toFixed(1)}</td><td className="p-3"><StatusBadge tone={store.isVerify ? "success" : "warning"}>{store.isVerify ? "Verified" : "Unverified"}</StatusBadge></td><td className="p-3"><StatusBadge tone={store.isActive ? "success" : "error"}>{store.isActive ? "Active" : "Inactive"}</StatusBadge></td><td className="p-3 pr-5 text-right"><button type="button" onClick={() => setActiveStore(store)} className="h-8 rounded-lg px-3 font-semibold text-primary hover:bg-primary-lighter">View</button></td></tr>)}</tbody>
            </table>
          ) : pendingLoading ? <div className="px-4 py-14 text-center text-sm text-light-secondary-text" role="status">Loading pending stores…</div> : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left"><tr><th className="p-3 pl-5">No.</th><th className="p-3">Store</th><th className="p-3">Address</th><th className="p-3">Submitted</th><th className="p-3">Status</th><th className="p-3 pr-5 text-right">Action</th></tr></thead>
              <tbody>{(rows as PendingStoreResponse[]).map((store, index) => <tr key={store.id} className="border-t border-gray-500/20 hover:bg-gray-50/50"><td className="p-3 pl-5 text-light-secondary-text">{(currentPage - 1) * PAGE_SIZE + index + 1}</td><td className="p-3"><strong className="block">{store.name}</strong><span className="text-xs text-light-secondary-text">{store.phone ?? "No phone"}</span></td><td className="max-w-64 p-3"><span className="block truncate" title={store.address ?? ""}>{store.address ?? "Not set"}</span></td><td className="p-3">{date(store.createdAt)}</td><td className="p-3"><StatusBadge tone="warning">Pending</StatusBadge></td><td className="p-3 pr-5 text-right"><button type="button" onClick={() => setActivePendingStore(store)} className="h-8 rounded-lg px-3 font-semibold text-primary hover:bg-primary-lighter">Review</button></td></tr>)}</tbody>
            </table>
          )}
          {(tab === "stores" ? !storesLoading : !pendingLoading) && rows.length === 0 && <div className="px-4 py-14 text-center text-sm text-light-secondary-text">No {tab === "applications" ? "pending stores" : "stores"} match these filters.</div>}
        </div>
        <div className="flex items-center justify-between border-t border-gray-500/20 p-4 sm:px-6"><span className="text-sm text-light-secondary-text">{filtered.length} {tab}</span><div className="flex items-center gap-2"><button type="button" aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40">‹</button><span className="text-sm font-semibold">Page {currentPage} of {totalPages}</span><button type="button" aria-label="Next page" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40">›</button></div></div>
      </DashboardCard>
      {activeStore && <DashboardDialog title={activeStore.name} onClose={() => !busyStoreId && setActiveStore(null)}><div className="space-y-5 p-5 text-sm sm:p-6"><div className="flex gap-2"><StatusBadge tone={activeStore.isVerify ? "success" : "warning"}>{activeStore.isVerify ? "Verified" : "Unverified"}</StatusBadge><StatusBadge tone={activeStore.isActive ? "success" : "error"}>{activeStore.isActive ? "Active" : "Inactive"}</StatusBadge></div><p className="leading-6 text-light-secondary-text">{activeStore.description ?? "No description provided."}</p><dl className="grid grid-cols-[100px_1fr] gap-3"><dt className="text-light-secondary-text">Store ID</dt><dd className="break-all font-mono text-xs">{activeStore.id}</dd><dt className="text-light-secondary-text">Owner ID</dt><dd className="break-all font-mono text-xs">{activeStore.ownerId}</dd><dt className="text-light-secondary-text">Address</dt><dd>{activeStore.address ?? "Not set"}</dd><dt className="text-light-secondary-text">Coordinates</dt><dd>{activeStore.latitude}, {activeStore.longitude}</dd><dt className="text-light-secondary-text">Created</dt><dd>{date(activeStore.createdAt)}</dd></dl></div><footer className="flex flex-wrap justify-end gap-3 border-t border-gray-500/20 p-4 sm:px-6"><DashboardButton disabled={Boolean(busyStoreId)} variant="secondary" onClick={() => setActiveStore(null)}>Close</DashboardButton>{!activeStore.isVerify && <DashboardButton disabled={Boolean(busyStoreId)} onClick={() => updateStore(activeStore, { isVerify: true })}>{busyStoreId ? "Updating…" : "Verify store"}</DashboardButton>}<DashboardButton disabled={Boolean(busyStoreId)} variant={activeStore.isActive ? "danger" : "primary"} onClick={() => updateStore(activeStore, { isActive: !activeStore.isActive })}>{busyStoreId ? "Updating…" : activeStore.isActive ? "Deactivate" : "Activate"}</DashboardButton></footer></DashboardDialog>}
      {activePendingStore && <DashboardDialog title={activePendingStore.name} onClose={() => !busyStoreId && setActivePendingStore(null)}><div className="space-y-5 p-5 text-sm sm:p-6"><StatusBadge tone="warning">Pending verification</StatusBadge><p className="leading-6 text-light-secondary-text">{activePendingStore.description ?? "No description provided."}</p><dl className="grid grid-cols-[100px_1fr] gap-3"><dt className="text-light-secondary-text">Owner ID</dt><dd className="break-all font-mono text-xs">{activePendingStore.ownerId}</dd><dt className="text-light-secondary-text">Phone</dt><dd>{activePendingStore.phone ?? "Not set"}</dd><dt className="text-light-secondary-text">Address</dt><dd>{activePendingStore.address ?? "Not set"}</dd><dt className="text-light-secondary-text">Coordinates</dt><dd>{activePendingStore.latitude}, {activePendingStore.longitude}</dd><dt className="text-light-secondary-text">License</dt><dd>{activePendingStore.licenseUrl ? <a className="font-semibold text-primary hover:text-primary-dark" href={activePendingStore.licenseUrl} rel="noreferrer" target="_blank">Open license</a> : "Not provided"}</dd><dt className="text-light-secondary-text">Submitted</dt><dd>{date(activePendingStore.createdAt)}</dd></dl></div><footer className="flex flex-wrap justify-end gap-3 border-t border-gray-500/20 p-4 sm:px-6"><DashboardButton disabled={Boolean(busyStoreId)} variant="secondary" onClick={() => setActivePendingStore(null)}>Close</DashboardButton><DashboardButton disabled={Boolean(busyStoreId)} variant="danger" onClick={() => rejectPendingStoreAction(activePendingStore)}>{busyStoreId === activePendingStore.id && busyAction === "reject" ? "Rejecting…" : "Reject store"}</DashboardButton><DashboardButton disabled={Boolean(busyStoreId)} onClick={() => approvePendingStore(activePendingStore)}>{busyStoreId === activePendingStore.id && busyAction === "verify" ? "Verifying…" : "Verify store"}</DashboardButton></footer></DashboardDialog>}
    </>
  );
}
