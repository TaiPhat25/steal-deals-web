"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { getAdminUser, listAdminUsers } from "@/lib/api/admin";
import type { PagedResult, UserDetail, UserSummary } from "@/lib/api/admin-types";
import { Avatar, DashboardCard, StatusBadge } from "@/components/dashboard/ui";
import { DashboardDialog } from "@/components/dashboard/Dialog";

const PAGE_SIZE = 10;

export default function AdminCustomers() {
  const { accessToken, isInitialized } = useAuth();
  const [result, setResult] = useState<PagedResult<UserSummary> | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<UserSummary | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    if (!isInitialized) return;
    let active = true;
    if (!accessToken) {
      const timeout = window.setTimeout(() => {
        setLoading(false);
        setError("Sign in before opening Customer Operations.");
      }, 0);
      return () => window.clearTimeout(timeout);
    }
    const timeout = window.setTimeout(() => {
      const query = new URLSearchParams({ role: "Customer", page: String(page), pageSize: String(PAGE_SIZE) });
      if (search) query.set("searchTerm", search);
      if (status) query.set("accountStatus", status);
      setLoading(true);
      setError("");
      void listAdminUsers(accessToken, query)
        .then((data) => { if (active) setResult(data); })
        .catch(() => { if (active) setError("Customer accounts could not be loaded."); })
        .finally(() => { if (active) setLoading(false); });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [accessToken, isInitialized, page, search, status]);

  useEffect(() => {
    if (!selected || !accessToken) return;
    let active = true;
    const timeout = window.setTimeout(() => {
      setDetail(null);
      setDetailError("");
      void getAdminUser(accessToken, selected.id)
        .then((data) => { if (active) setDetail(data); })
        .catch(() => { if (active) setDetailError("Customer details could not be loaded."); });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [accessToken, selected]);

  return (
    <>
      <DashboardCard className="w-full overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">Customer trust and activity</p><h1 className="text-xl font-bold">Customer Operations</h1></div>
            <Link href="/admin/users?role=Customer" className="inline-flex h-9 items-center justify-center rounded-full border border-gray-300 px-4 text-sm font-bold text-gray-700 hover:bg-gray-50">Manage customer identities</Link>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative w-full sm:w-72"><span className="sr-only">Search customers</span><span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-secondary-text">⌕</span><input type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search name or email..." className="h-9 w-full rounded-full border-none bg-gray-100 pl-9 pr-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" /></label>
            <div className="flex items-center gap-3"><select aria-label="Account status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-9 rounded-full border-none bg-gray-100 px-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select>{(searchInput || status) && <button type="button" onClick={() => { setSearchInput(""); setStatus(""); setPage(1); }} className="h-9 rounded-full px-3 text-sm font-semibold text-primary hover:bg-primary-lighter">Clear</button>}</div>
          </div>
        </div>
        {error ? <div className="border-t border-gray-500/20 px-4 py-14 text-center text-sm text-error-dark">{error}</div> : loading && !result ? <div className="space-y-3 border-t border-gray-500/20 p-6" role="status">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}</div> : <>
          <div className="overflow-x-auto border-t border-gray-500/20">
            <table className="w-full text-sm"><thead className="bg-gray-100 text-left"><tr><th className="p-3 pl-5">Customer</th><th className="p-3">Phone</th><th className="p-3">Trust score</th><th className="p-3">Orders</th><th className="p-3">No-shows</th><th className="p-3">Disputes</th><th className="p-3">Status</th><th className="p-3 pr-5 text-right">Actions</th></tr></thead>
              <tbody>{result?.items.map((customer) => <tr key={customer.id} className="border-t border-gray-500/20 hover:bg-gray-50/50">
                <td className="p-3 pl-5"><div className="flex items-center gap-3"><Avatar name={customer.fullName} /><div><strong className="block">{customer.fullName}</strong><span className="text-xs text-light-secondary-text">{customer.email}</span></div></div></td>
                <td className="p-3">{customer.phone ?? "—"}</td><td className="p-3 font-semibold">{customer.userTrustScore?.score ?? "Not calculated"}</td><td className="p-3">{customer.userTrustScore?.totalOrders ?? 0}</td><td className="p-3">{customer.userTrustScore?.noShowCount ?? 0}</td><td className="p-3">{customer.userTrustScore?.disputeCount ?? 0}</td><td className="p-3"><StatusBadge tone={customer.isActive ? "success" : "error"}>{customer.isActive ? "Active" : "Inactive"}</StatusBadge></td>
                <td className="p-3 pr-5 text-right"><button type="button" onClick={() => setSelected(customer)} className="h-8 rounded-lg px-3 font-semibold text-primary hover:bg-primary-lighter">View</button></td>
              </tr>)}</tbody>
            </table>
            {result?.items.length === 0 && <div className="px-4 py-14 text-center text-sm text-light-secondary-text">No customer accounts match these filters.</div>}
          </div>
          {result && result.totalCount > 0 && <div className="flex items-center justify-between border-t border-gray-500/20 p-4 sm:px-6"><span className="text-sm text-light-secondary-text">{result.totalCount} customers</span><div className="flex items-center gap-2"><button type="button" aria-label="Previous page" disabled={page === 1 || loading} onClick={() => setPage(page - 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40">‹</button><span className="text-sm font-semibold">Page {result.page} of {result.totalPages}</span><button type="button" aria-label="Next page" disabled={page >= result.totalPages || loading} onClick={() => setPage(page + 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40">›</button></div></div>}
        </>}
      </DashboardCard>

      {selected && <DashboardDialog title={selected.fullName} onClose={() => setSelected(null)}>
        {detailError ? <p className="p-6 text-sm text-error-dark">{detailError}</p> : !detail ? <div className="flex h-40 items-center justify-center" role="status"><div className="size-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div> : <div className="space-y-6 p-5 text-sm sm:p-6">
          <div className="flex items-center gap-3"><Avatar name={detail.fullName} size="lg" /><div><strong className="block text-base">{detail.email}</strong><span className="text-light-secondary-text">{detail.phone ?? "No phone number"}</span></div></div>
          <section><h3 className="mb-3 font-bold">Trust activity</h3><dl className="grid grid-cols-2 gap-3 rounded-xl bg-gray-100 p-4"><div><dt className="text-light-secondary-text">Score</dt><dd className="mt-1 font-bold">{detail.userTrustScore?.score ?? "Not calculated"}</dd></div><div><dt className="text-light-secondary-text">Orders</dt><dd className="mt-1 font-bold">{detail.userTrustScore?.totalOrders ?? 0}</dd></div><div><dt className="text-light-secondary-text">Successful pickups</dt><dd className="mt-1 font-bold">{detail.userTrustScore?.successfulPickups ?? 0}</dd></div><div><dt className="text-light-secondary-text">No-shows / disputes</dt><dd className="mt-1 font-bold">{detail.userTrustScore?.noShowCount ?? 0} / {detail.userTrustScore?.disputeCount ?? 0}</dd></div></dl></section>
          <section><h3 className="mb-3 font-bold">Addresses</h3>{detail.userAddresses.length ? <ul className="space-y-2">{detail.userAddresses.map((address) => <li key={address.id} className="rounded-xl border border-gray-500/20 p-3"><strong>{address.label}{address.isDefault ? " · Default" : ""}</strong><span className="mt-1 block text-light-secondary-text">{address.address}, {address.district}, {address.city}</span></li>)}</ul> : <p className="text-light-secondary-text">No saved addresses.</p>}</section>
        </div>}
        <footer className="flex justify-end border-t border-gray-500/20 p-4 sm:px-6"><Link href={`/admin/users?role=Customer&search=${encodeURIComponent(selected.email)}`} className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-bold text-white hover:bg-primary-dark">Manage identity</Link></footer>
      </DashboardDialog>}
    </>
  );
}
