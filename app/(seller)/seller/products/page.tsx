"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSellerDemo, type BagStatus, type SurplusBag } from "@/components/seller/SellerDemoProvider";
import { DashboardButton, DashboardCard, PageHeader, ProductImage, StatusBadge } from "@/components/dashboard/ui";
import { DashboardDialog, DashboardToast, DialogActions } from "@/components/dashboard/Dialog";

const PAGE_SIZE = 4;
const statusTone = (status: BagStatus) => status === "Active" ? "success" : status === "Sold out" ? "error" : "warning";

export default function SellerProducts() {
  const { products, setProducts } = useSellerDemo();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<BagStatus | "">("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<SurplusBag | "selected" | null>(null);
  const [toast, setToast] = useState("");
  const categories = [...new Set(products.map((product) => product.category))];
  const filtered = useMemo(() => products.filter((product) => {
    const query = search.trim().toLowerCase();
    return (!query || `${product.name} ${product.category}`.toLowerCase().includes(query))
      && (!category || product.category === category)
      && (!status || product.status === status);
  }), [category, products, search, status]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allVisibleSelected = rows.length > 0 && rows.every((row) => selected.includes(row.id));

  function resetPage() {
    setPage(1);
    setSelected([]);
  }

  function updateSelected(next: BagStatus) {
    setProducts((items) => items.map((item) => selected.includes(item.id) ? { ...item, status: next } : item));
    setToast(`${selected.length} bag${selected.length === 1 ? "" : "s"} marked ${next.toLowerCase()}.`);
    setSelected([]);
  }

  function confirmDelete() {
    const ids = deleting === "selected" ? selected : deleting ? [deleting.id] : [];
    setProducts((items) => items.filter((item) => !ids.includes(item.id)));
    setToast(`${ids.length} bag${ids.length === 1 ? "" : "s"} deleted.`);
    setDeleting(null);
    resetPage();
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
          {selected.length > 0 && <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-gray-100 p-3"><span className="text-sm font-semibold">{selected.length} selected</span><button type="button" onClick={() => updateSelected("Active")} className="text-sm font-semibold text-primary">Activate</button><button type="button" onClick={() => updateSelected("Draft")} className="text-sm font-semibold text-warning-dark">Move to draft</button><button type="button" onClick={() => setDeleting("selected")} className="text-sm font-semibold text-error-dark">Delete</button></div>}
        </div>
        <div className="overflow-x-auto border-t border-gray-500/20">
          <table className="w-full text-sm"><thead className="bg-gray-100 text-left"><tr><th className="p-3 pl-5"><input type="checkbox" aria-label="Select visible bags" checked={allVisibleSelected} onChange={() => setSelected(allVisibleSelected ? selected.filter((id) => !rows.some((row) => row.id === id)) : [...new Set([...selected, ...rows.map((row) => row.id)])])} className="size-4 accent-primary" /></th><th className="p-3">Bag</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Available</th><th className="p-3">Pickup</th><th className="p-3">Status</th><th className="p-3 pr-5 text-right">Actions</th></tr></thead>
            <tbody>{rows.map((product) => <tr key={product.id} className="border-t border-gray-500/20 hover:bg-gray-50/50">
              <td className="p-3 pl-5"><input type="checkbox" aria-label={`Select ${product.name}`} checked={selected.includes(product.id)} onChange={() => setSelected((ids) => ids.includes(product.id) ? ids.filter((id) => id !== product.id) : [...ids, product.id])} className="size-4 accent-primary" /></td>
              <td className="p-3"><div className="flex items-center gap-3"><span className="size-11 overflow-hidden rounded-xl"><ProductImage alt="" /></span><div><strong className="block">{product.name}</strong><span className="text-xs text-light-secondary-text">#{product.id}</span></div></div></td><td className="p-3">{product.category}</td><td className="p-3"><strong>${product.price.toFixed(2)}</strong><span className="ml-2 text-xs text-light-secondary-text line-through">${product.originalPrice.toFixed(2)}</span></td>
              <td className="p-3"><input type="number" min="0" aria-label={`Available quantity for ${product.name}`} value={product.quantity} onChange={(event) => { const quantity = Math.max(0, Number(event.target.value)); setProducts((items) => items.map((item) => item.id === product.id ? { ...item, quantity, status: quantity === 0 ? "Sold out" : item.status === "Sold out" ? "Active" : item.status } : item)); }} className="h-8 w-16 rounded-lg border-none bg-gray-100 px-2 ring ring-gray-500/20 focus:ring-2 focus:ring-primary" /></td>
              <td className="p-3 whitespace-nowrap">{product.pickupStart}–{product.pickupEnd}</td><td className="p-3"><StatusBadge tone={statusTone(product.status)}>{product.status}</StatusBadge></td>
              <td className="p-3 pr-5 text-right whitespace-nowrap"><Link href={`/seller/products/details?id=${product.id}`} className="inline-flex h-8 items-center rounded-lg px-2 font-semibold text-primary hover:bg-primary-lighter">View</Link><Link href={`/seller/products/edit?id=${product.id}`} className="inline-flex h-8 items-center rounded-lg px-2 font-semibold text-primary hover:bg-primary-lighter">Edit</Link><button type="button" onClick={() => setDeleting(product)} className="h-8 rounded-lg px-2 font-semibold text-error-dark hover:bg-error-alpha-16">Delete</button></td>
            </tr>)}</tbody>
          </table>
          {rows.length === 0 && <div className="px-4 py-14 text-center text-sm text-light-secondary-text">No surplus bags match these filters.</div>}
        </div>
        <div className="flex items-center justify-between border-t border-gray-500/20 p-4 sm:px-6"><span className="text-sm text-light-secondary-text">{filtered.length} bags</span><div className="flex items-center gap-2"><button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage(page - 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40">‹</button><span className="text-sm font-semibold">Page {page} of {totalPages}</span><button type="button" aria-label="Next page" disabled={page === totalPages} onClick={() => setPage(page + 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40">›</button></div></div>
      </DashboardCard>
      {deleting && <DashboardDialog title={deleting === "selected" ? `Delete ${selected.length} bags?` : `Delete ${deleting.name}?`} onClose={() => setDeleting(null)}><p className="p-5 text-sm leading-6 text-light-secondary-text sm:p-6">This removes the selected dummy data until the page is refreshed.</p><DialogActions onCancel={() => setDeleting(null)}><DashboardButton variant="danger" onClick={confirmDelete}>Delete</DashboardButton></DialogActions></DashboardDialog>}
    </>
  );
}
