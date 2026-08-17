"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSellerDemo, type BagStatus, type SurplusBag } from "@/components/seller/SellerDemoProvider";
import { DashboardButton, DashboardCard, PageHeader, ProductImage, StatusBadge } from "@/components/dashboard/ui";
import { DashboardDialog, DashboardToast, DialogActions } from "@/components/dashboard/Dialog";
import { deleteBag, updateBagStatus } from "@/lib/api/store";

const PAGE_SIZE = 4;
const statusTone = (status: string) => status === "Active" ? "success" : status === "Sold out" ? "error" : "warning";
const money = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
const time = (value: string) => new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));

export default function SellerProducts() {
  const { accessToken } = useAuth();
  const {
    products,
    setProducts,
    productsLoading: loading,
    productsDemoReason: demoReason,
    retryApi,
  } = useSellerDemo();
  // ponytail: expiry refreshes on page load; add a timer only if sellers keep this screen open across expiry.
  const [now] = useState(Date.now);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<BagStatus | "">("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<SurplusBag | "selected" | null>(null);
  const [toast, setToast] = useState("");
  const [mutating, setMutating] = useState(false);
  const [actionError, setActionError] = useState("");
  const categories = [...new Set(products.flatMap((product) => product.categories.map((item) => item.name)))];
  const filtered = useMemo(() => products.filter((product) => {
    const query = search.trim().toLowerCase();
    return (!query || `${product.name} ${product.categories.map((item) => item.name).join(" ")}`.toLowerCase().includes(query))
      && (!category || product.categories.some((item) => item.name === category))
      && (!status || product.status === status);
  }), [category, products, search, status]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allVisibleSelected = rows.length > 0 && rows.every((row) => selected.includes(row.id));

  function resetPage() {
    setPage(1);
    setSelected([]);
  }

  async function updateSelected(next: BagStatus) {
    setMutating(true);
    setActionError("");
    try {
      if (!demoReason) {
        if (!accessToken) throw new Error("A seller session is required to update bags.");
        await Promise.all(selected.map((id) => {
          const product = products.find((item) => item.id === id);
          const status = next === "Active" && product?.quantityRemaining === 0 ? "Sold out" : next;
          return updateBagStatus(accessToken, id, status);
        }));
      }
      setProducts((items) => items.map((item) => selected.includes(item.id) ? { ...item, status: next === "Active" && item.quantityRemaining === 0 ? "Sold out" : next } : item));
      setToast(`${selected.length} bag${selected.length === 1 ? "" : "s"} marked ${next.toLowerCase()}.`);
      setSelected([]);
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "Unable to update the selected bags.");
    } finally {
      setMutating(false);
    }
  }

  async function confirmDelete() {
    const ids = deleting === "selected" ? selected : deleting ? [deleting.id] : [];
    setMutating(true);
    setActionError("");
    try {
      if (!demoReason) {
        if (!accessToken) throw new Error("A seller session is required to delete bags.");
        await Promise.all(ids.map((id) => deleteBag(accessToken, id)));
      }
      setProducts((items) => items.filter((item) => !ids.includes(item.id)));
      setToast(`${ids.length} bag${ids.length === 1 ? "" : "s"} deleted.`);
      setDeleting(null);
      resetPage();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "Unable to delete the selected bags.");
    } finally {
      setMutating(false);
    }
  }

  return (
    <>
      {toast && <DashboardToast key={toast}>{toast}</DashboardToast>}
      <DashboardCard className="w-full overflow-hidden">
        <div className="p-4 sm:p-6">
          <PageHeader title="Surplus Bags" action={<Link href="/seller/products/add" className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-bold text-white hover:bg-primary-dark">+ Create bag</Link>} />
          <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative w-full lg:w-72"><span className="sr-only">Search surplus bags</span><span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-secondary-text">⌕</span><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); resetPage(); }} placeholder="Search bags..." className="h-9 w-full rounded-full border-none bg-gray-100 pl-9 pr-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" /></label>
            <div className="flex flex-wrap gap-3">
              <select aria-label="Food category" value={category} onChange={(event) => { setCategory(event.target.value); resetPage(); }} className="h-9 rounded-full border-none bg-gray-100 px-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
              <select aria-label="Bag status" value={status} onChange={(event) => { setStatus(event.target.value as BagStatus | ""); resetPage(); }} className="h-9 rounded-full border-none bg-gray-100 px-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"><option value="">All statuses</option><option>Active</option><option>Draft</option><option>Sold out</option></select>
              {(search || category || status) && <button type="button" onClick={() => { setSearch(""); setCategory(""); setStatus(""); resetPage(); }} className="h-9 rounded-full px-3 text-sm font-semibold text-primary hover:bg-primary-lighter">Clear</button>}
            </div>
          </div>
          {selected.length > 0 && <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-gray-100 p-3"><span className="text-sm font-semibold">{selected.length} selected</span><button type="button" disabled={mutating} onClick={() => updateSelected("Active")} className="text-sm font-semibold text-primary disabled:opacity-40">Activate</button><button type="button" disabled={mutating} onClick={() => updateSelected("Draft")} className="text-sm font-semibold text-warning-dark disabled:opacity-40">Move to draft</button><button type="button" disabled={mutating} onClick={() => setDeleting("selected")} className="text-sm font-semibold text-error-dark disabled:opacity-40">Delete</button></div>}
        </div>
        {demoReason && <div className="flex flex-col gap-3 border-t border-warning/30 bg-warning/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6" role="status"><p><strong>Demo data active.</strong> {demoReason}</p><button type="button" onClick={retryApi} className="h-8 shrink-0 rounded-full px-3 font-semibold text-warning-dark hover:bg-warning/15">Retry API</button></div>}
        {actionError && <div role="alert" className="border-t border-error/30 bg-error-alpha-16 px-4 py-3 text-sm text-error-dark sm:px-6">{actionError}</div>}
        {loading ? <div className="border-t border-gray-500/20 px-4 py-14 text-center text-sm text-light-secondary-text" role="status">Loading surplus bags…</div> : <>
        <div className="overflow-x-auto border-t border-gray-500/20">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left"><tr><th className="p-3 pl-5"><input type="checkbox" aria-label="Select visible bags" checked={allVisibleSelected} onChange={() => setSelected(allVisibleSelected ? selected.filter((id) => !rows.some((row) => row.id === id)) : [...new Set([...selected, ...rows.map((row) => row.id)])])} className="size-4 accent-primary" /></th><th className="p-3">Bag</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Remaining</th><th className="p-3">Pickup</th><th className="p-3">Status</th><th className="p-3 pr-5 text-right">Actions</th></tr></thead>
            <tbody>{rows.map((product) => <tr key={product.id} className="border-t border-gray-500/20 hover:bg-gray-50/50">
              <td className="p-3 pl-5"><input type="checkbox" aria-label={`Select ${product.name}`} checked={selected.includes(product.id)} onChange={() => setSelected((ids) => ids.includes(product.id) ? ids.filter((id) => id !== product.id) : [...ids, product.id])} className="size-4 accent-primary" /></td>
              <td className="p-3"><div className="flex items-center gap-3"><span className="size-11 overflow-hidden rounded-xl"><ProductImage alt="" /></span><div><strong className="block">{product.name}</strong><span className="text-xs text-light-secondary-text">#{product.id.slice(0, 8)}</span></div></div></td>
              <td className="p-3">{product.categories.map((item) => item.name).join(", ")}</td>
              <td className="p-3"><strong>{money(product.salePrice)}</strong><span className="ml-2 text-xs text-light-secondary-text line-through">{money(product.originalPrice)}</span></td>
              <td className="p-3">{product.quantityRemaining}</td>
              <td className="p-3 whitespace-nowrap">{time(product.pickupStartTime)}–{time(product.pickupEndTime)}</td>
              <td className="p-3"><div className="flex flex-wrap gap-2"><StatusBadge tone={statusTone(product.status)}>{product.status}</StatusBadge>{Date.parse(product.expiryDate) < now && <StatusBadge tone="error">Expired</StatusBadge>}</div></td>
              <td className="p-3 pr-5 text-right whitespace-nowrap"><Link href={`/seller/products/details?id=${product.id}`} className="inline-flex h-8 items-center rounded-lg px-2 font-semibold text-primary hover:bg-primary-lighter">View</Link><Link href={`/seller/products/edit?id=${product.id}`} className="inline-flex h-8 items-center rounded-lg px-2 font-semibold text-primary hover:bg-primary-lighter">Edit</Link><button type="button" onClick={() => setDeleting(product)} className="h-8 rounded-lg px-2 font-semibold text-error-dark hover:bg-error-alpha-16">Delete</button></td>
            </tr>)}</tbody>
          </table>
          {rows.length === 0 && <div className="px-4 py-14 text-center text-sm text-light-secondary-text">No surplus bags match these filters.</div>}
        </div>
        <div className="flex items-center justify-between border-t border-gray-500/20 p-4 sm:px-6"><span className="text-sm text-light-secondary-text">{filtered.length} bags</span><div className="flex items-center gap-2"><button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage(page - 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40">‹</button><span className="text-sm font-semibold">Page {page} of {totalPages}</span><button type="button" aria-label="Next page" disabled={page === totalPages} onClick={() => setPage(page + 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40">›</button></div></div>
        </>}
      </DashboardCard>
      {deleting && <DashboardDialog title={deleting === "selected" ? `Delete ${selected.length} bags?` : `Delete ${deleting.name}?`} onClose={() => !mutating && setDeleting(null)}><p className="p-5 text-sm leading-6 text-light-secondary-text sm:p-6">{demoReason ? "This only removes the selected data from the current demo state." : "This deletes the selected bags from the Store Service."}</p><DialogActions onCancel={() => !mutating && setDeleting(null)}><DashboardButton variant="danger" disabled={mutating} onClick={confirmDelete}>{mutating ? "Deleting…" : "Delete"}</DashboardButton></DialogActions></DashboardDialog>}
    </>
  );
}
