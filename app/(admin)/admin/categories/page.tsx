"use client";

import { useMemo, useState, type FormEvent } from "react";
import { DashboardButton, DashboardCard, PageHeader, ProductImage, StatusBadge } from "@/components/dashboard/ui";
import { DashboardDialog, DashboardToast, DialogActions } from "@/components/dashboard/Dialog";
import type { CategoryResponse } from "@/lib/api/dashboard-types";

const INITIAL_CATEGORIES: CategoryResponse[] = [
  { id: "10000000-0000-0000-0000-000000000001", name: "Bakery", slug: "bakery", iconUrl: null, isActive: true },
  { id: "10000000-0000-0000-0000-000000000002", name: "Prepared meals", slug: "prepared-meals", iconUrl: null, isActive: true },
  { id: "10000000-0000-0000-0000-000000000003", name: "Produce", slug: "produce", iconUrl: null, isActive: true },
  { id: "10000000-0000-0000-0000-000000000004", name: "Desserts", slug: "desserts", iconUrl: null, isActive: true },
  { id: "10000000-0000-0000-0000-000000000005", name: "Groceries", slug: "groceries", iconUrl: null, isActive: true },
  { id: "10000000-0000-0000-0000-000000000006", name: "Drinks", slug: "drinks", iconUrl: null, isActive: false },
];

const PAGE_SIZE = 4;

export default function AdminCategories() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<CategoryResponse | "new" | null>(null);
  const [deleting, setDeleting] = useState<CategoryResponse | "selected" | null>(null);
  const [toast, setToast] = useState("");
  const filtered = useMemo(() => categories.filter((category) => {
    const query = search.trim().toLowerCase();
    return (!query || `${category.name} ${category.slug}`.toLowerCase().includes(query))
      && (!active || category.isActive === (active === "active"));
  }), [active, categories, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allVisibleSelected = rows.length > 0 && rows.every((row) => selected.includes(row.id));

  function resetPage() {
    setPage(1);
    setSelected([]);
  }

  function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name")).trim();
    const slug = String(data.get("slug")).trim().toLowerCase();
    const iconUrl = String(data.get("iconUrl")).trim() || null;
    const editingId = editing === "new" ? null : editing?.id;
    if (categories.some((item) => (item.name.toLowerCase() === name.toLowerCase() || item.slug === slug) && item.id !== editingId)) {
      setToast("Category names and slugs must be unique.");
      return;
    }
    if (editing === "new") {
      setCategories((items) => [{ id: crypto.randomUUID(), name, slug, iconUrl, isActive: true }, ...items]);
      setToast(`${name} was created.`);
    } else if (editing) {
      const isActive = data.get("isActive") === "on";
      setCategories((items) => items.map((item) => item.id === editing.id ? { ...item, name, slug, iconUrl, isActive } : item));
      setToast(`${name} was updated.`);
    }
    setEditing(null);
    resetPage();
  }

  function confirmDelete() {
    const ids = deleting === "selected" ? selected : deleting ? [deleting.id] : [];
    setCategories((items) => items.filter((item) => !ids.includes(item.id)));
    setToast(`${ids.length} categor${ids.length === 1 ? "y" : "ies"} deleted.`);
    setDeleting(null);
    resetPage();
  }

  return (
    <>
      {toast && <DashboardToast key={toast}>{toast}</DashboardToast>}
      <DashboardCard className="w-full overflow-hidden">
        <div className="p-4 sm:p-6">
          <PageHeader title="Categories" action={<DashboardButton onClick={() => setEditing("new")}>+ Create category</DashboardButton>} />
          <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative w-full lg:w-72"><span className="sr-only">Search categories</span><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-light-secondary-text">⌕</span><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); resetPage(); }} placeholder="Search name or slug..." className="h-9 w-full rounded-full border-none bg-gray-100 pl-9 pr-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" /></label>
            <div className="flex flex-wrap items-center gap-3"><select aria-label="Category status" value={active} onChange={(event) => { setActive(event.target.value); resetPage(); }} className="h-9 rounded-full border-none bg-gray-100 px-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select>{(search || active) && <button type="button" onClick={() => { setSearch(""); setActive(""); resetPage(); }} className="h-9 rounded-full px-3 text-sm font-semibold text-primary hover:bg-primary-lighter">Clear</button>}{selected.length > 0 && <DashboardButton variant="danger" onClick={() => setDeleting("selected")}>Delete {selected.length}</DashboardButton>}</div>
          </div>
        </div>
        <div className="overflow-x-auto border-t border-gray-500/20">
          <table className="w-full text-sm"><thead className="bg-gray-100 text-left"><tr><th className="p-3 pl-5"><input aria-label="Select visible categories" type="checkbox" checked={allVisibleSelected} onChange={() => setSelected(allVisibleSelected ? selected.filter((id) => !rows.some((row) => row.id === id)) : [...new Set([...selected, ...rows.map((row) => row.id)])])} className="size-4 accent-primary" /></th><th className="p-3">Category</th><th className="p-3">Slug</th><th className="p-3">Icon URL</th><th className="p-3">Status</th><th className="p-3 pr-5 text-right">Actions</th></tr></thead>
            <tbody>{rows.map((category) => <tr key={category.id} className="border-t border-gray-500/20 hover:bg-gray-50/50"><td className="p-3 pl-5"><input aria-label={`Select ${category.name}`} type="checkbox" checked={selected.includes(category.id)} onChange={() => setSelected((ids) => ids.includes(category.id) ? ids.filter((id) => id !== category.id) : [...ids, category.id])} className="size-4 accent-primary" /></td><td className="p-3"><div className="flex items-center gap-3"><span className="size-10 overflow-hidden rounded-xl"><ProductImage alt="" /></span><span className="font-semibold">{category.name}</span></div></td><td className="p-3 font-mono text-xs">{category.slug}</td><td className="max-w-60 p-3"><span className="block truncate text-light-secondary-text" title={category.iconUrl ?? ""}>{category.iconUrl ?? "Not set"}</span></td><td className="p-3"><StatusBadge tone={category.isActive ? "success" : "error"}>{category.isActive ? "Active" : "Inactive"}</StatusBadge></td><td className="p-3 pr-5 text-right"><button type="button" onClick={() => setEditing(category)} className="h-8 rounded-lg px-3 font-semibold text-primary hover:bg-primary-lighter">Edit</button><button type="button" onClick={() => setDeleting(category)} className="h-8 rounded-lg px-3 font-semibold text-error-dark hover:bg-error-alpha-16">Delete</button></td></tr>)}</tbody>
          </table>
          {rows.length === 0 && <div className="px-4 py-14 text-center text-sm text-light-secondary-text">No categories match these filters.</div>}
        </div>
        <div className="flex items-center justify-between border-t border-gray-500/20 p-4 sm:px-6"><span className="text-sm text-light-secondary-text">{filtered.length} categories</span><div className="flex items-center gap-2"><button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40" aria-label="Previous page">‹</button><span className="text-sm font-semibold">Page {page} of {totalPages}</span><button type="button" disabled={page === totalPages} onClick={() => setPage(page + 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40" aria-label="Next page">›</button></div></div>
      </DashboardCard>
      {editing && <DashboardDialog title={editing === "new" ? "Create category" : "Edit category"} onClose={() => setEditing(null)}><form onSubmit={saveCategory}><div className="space-y-4 p-5 sm:p-6"><label className="block text-sm font-semibold">Category name<input name="name" required autoFocus defaultValue={editing === "new" ? "" : editing.name} className="mt-2 h-10 w-full rounded-xl border-none bg-gray-100 px-3.5 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" /></label><label className="block text-sm font-semibold">Slug<input name="slug" required pattern="[a-z0-9-]+" title="Use lowercase letters, numbers, and hyphens." defaultValue={editing === "new" ? "" : editing.slug} className="mt-2 h-10 w-full rounded-xl border-none bg-gray-100 px-3.5 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" /></label><label className="block text-sm font-semibold">Icon URL<input name="iconUrl" type="url" defaultValue={editing === "new" ? "" : editing.iconUrl ?? ""} className="mt-2 h-10 w-full rounded-xl border-none bg-gray-100 px-3.5 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" /></label>{editing !== "new" && <label className="flex items-center gap-2 text-sm font-semibold"><input name="isActive" type="checkbox" defaultChecked={editing.isActive} className="size-4 accent-primary" />Active</label>}</div><DialogActions onCancel={() => setEditing(null)}><DashboardButton type="submit">{editing === "new" ? "Create" : "Save changes"}</DashboardButton></DialogActions></form></DashboardDialog>}
      {deleting && <DashboardDialog title={deleting === "selected" ? `Delete ${selected.length} categories?` : `Delete ${deleting.name}?`} onClose={() => setDeleting(null)}><p className="p-5 text-sm leading-6 text-light-secondary-text sm:p-6">This removes the selected dummy data until the page is refreshed.</p><DialogActions onCancel={() => setDeleting(null)}><DashboardButton variant="danger" onClick={confirmDelete}>Delete</DashboardButton></DialogActions></DashboardDialog>}
    </>
  );
}
