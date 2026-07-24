"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  DashboardButton,
  DashboardCard,
  PageHeader,
  ProductImage,
} from "@/components/dashboard/ui";
import {
  DashboardDialog,
  DashboardToast,
  DialogActions,
} from "@/components/dashboard/Dialog";

type Category = {
  id: number;
  name: string;
  createdBy: string;
  createdAt: string;
};

const INITIAL_CATEGORIES: Category[] = [
  { id: 73423, name: "Bakery", createdBy: "Admin", createdAt: "2027-09-11" },
  { id: 73424, name: "Prepared meals", createdBy: "Admin", createdAt: "2027-09-12" },
  { id: 73425, name: "Groceries", createdBy: "Mina Patel", createdAt: "2027-09-13" },
  { id: 73426, name: "Drinks", createdBy: "Admin", createdAt: "2027-09-14" },
  { id: 73427, name: "Desserts", createdBy: "Mina Patel", createdAt: "2027-09-15" },
  { id: 73428, name: "Produce", createdBy: "Admin", createdAt: "2027-09-16" },
];

const PAGE_SIZE = 4;

export default function AdminCategories() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [search, setSearch] = useState("");
  const [creator, setCreator] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [deleting, setDeleting] = useState<Category | "selected" | null>(null);
  const [toast, setToast] = useState("");

  const filtered = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.name.toLowerCase().includes(search.trim().toLowerCase()) &&
          (!creator || category.createdBy === creator) &&
          (!date || category.createdAt === date),
      ),
    [categories, creator, date, search],
  );
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
    const name = String(data.get("name") ?? "").trim();
    const editingId = editing === "new" ? null : editing?.id;
    if (!name) return;
    if (categories.some((item) => item.name.toLowerCase() === name.toLowerCase() && item.id !== editingId)) {
      setToast("A category with that name already exists.");
      return;
    }
    if (editing === "new") {
      setCategories((items) => [
        { id: Date.now(), name, createdBy: "Admin", createdAt: new Date().toISOString().slice(0, 10) },
        ...items,
      ]);
      setToast(`${name} was created.`);
    } else if (editing) {
      setCategories((items) => items.map((item) => item.id === editing.id ? { ...item, name } : item));
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
          <PageHeader
            title="Categories"
            action={<DashboardButton onClick={() => setEditing("new")}>+ Create category</DashboardButton>}
          />
          <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative w-full lg:w-72">
              <span className="sr-only">Search categories</span>
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-light-secondary-text">⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) => { setSearch(event.target.value); resetPage(); }}
                placeholder="Search categories..."
                className="h-9 w-full rounded-full border-none bg-gray-100 pl-9 pr-3 text-sm ring ring-gray-500/20 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="sr-only" htmlFor="category-creator">Created by</label>
              <select id="category-creator" value={creator} onChange={(event) => { setCreator(event.target.value); resetPage(); }} className="h-9 rounded-full border-none bg-gray-100 px-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary">
                <option value="">All creators</option>
                <option>Admin</option>
                <option>Mina Patel</option>
              </select>
              <label className="sr-only" htmlFor="category-date">Created date</label>
              <input id="category-date" type="date" value={date} onChange={(event) => { setDate(event.target.value); resetPage(); }} className="h-9 rounded-full border-none bg-gray-100 px-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" />
              {(search || creator || date) && <button type="button" onClick={() => { setSearch(""); setCreator(""); setDate(""); resetPage(); }} className="h-9 rounded-full px-3 text-sm font-semibold text-primary hover:bg-primary-lighter">Clear</button>}
              {selected.length > 0 && <DashboardButton variant="danger" onClick={() => setDeleting("selected")}>Delete {selected.length}</DashboardButton>}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto border-t border-gray-500/20">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left text-light-primary-text">
              <tr>
                <th className="p-3 pl-5"><input aria-label="Select visible categories" type="checkbox" checked={allVisibleSelected} onChange={() => setSelected(allVisibleSelected ? selected.filter((id) => !rows.some((row) => row.id === id)) : [...new Set([...selected, ...rows.map((row) => row.id)])])} className="size-4 accent-primary" /></th>
                <th className="p-3">Category</th><th className="p-3">Created by</th><th className="p-3">Created</th><th className="p-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((category) => (
                <tr key={category.id} className="border-t border-gray-500/20 hover:bg-gray-50/50">
                  <td className="p-3 pl-5"><input aria-label={`Select ${category.name}`} type="checkbox" checked={selected.includes(category.id)} onChange={() => setSelected((ids) => ids.includes(category.id) ? ids.filter((id) => id !== category.id) : [...ids, category.id])} className="size-4 accent-primary" /></td>
                  <td className="p-3"><div className="flex items-center gap-3"><span className="size-10 overflow-hidden rounded-xl"><ProductImage alt="" /></span><span className="font-semibold">{category.name}</span></div></td>
                  <td className="p-3">{category.createdBy}</td>
                  <td className="p-3">{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(`${category.createdAt}T00:00:00`))}</td>
                  <td className="p-3 pr-5 text-right"><button type="button" onClick={() => setEditing(category)} className="h-8 rounded-lg px-3 font-semibold text-primary hover:bg-primary-lighter">Edit</button><button type="button" onClick={() => setDeleting(category)} className="h-8 rounded-lg px-3 font-semibold text-error-dark hover:bg-error-alpha-16">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div className="px-4 py-14 text-center text-sm text-light-secondary-text">No categories match these filters.</div>}
        </div>
        <div className="flex items-center justify-between border-t border-gray-500/20 p-4 sm:px-6">
          <span className="text-sm text-light-secondary-text">{filtered.length} categories</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40" aria-label="Previous page">‹</button>
            <span className="text-sm font-semibold">Page {page} of {totalPages}</span>
            <button type="button" disabled={page === totalPages} onClick={() => setPage(page + 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40" aria-label="Next page">›</button>
          </div>
        </div>
      </DashboardCard>

      {editing && <DashboardDialog title={editing === "new" ? "Create category" : "Edit category"} onClose={() => setEditing(null)}>
        <form onSubmit={saveCategory}>
          <div className="space-y-4 p-5 sm:p-6">
            <label className="block text-sm font-semibold">Category name<input name="name" required autoFocus defaultValue={editing === "new" ? "" : editing.name} className="mt-2 h-10 w-full rounded-xl border-none bg-gray-100 px-3.5 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" /></label>
            <p className="text-sm text-light-secondary-text">The shared dashboard placeholder remains until category image uploads are available.</p>
          </div>
          <DialogActions onCancel={() => setEditing(null)}><DashboardButton type="submit">{editing === "new" ? "Create" : "Save changes"}</DashboardButton></DialogActions>
        </form>
      </DashboardDialog>}

      {deleting && <DashboardDialog title={deleting === "selected" ? `Delete ${selected.length} categories?` : `Delete ${deleting.name}?`} onClose={() => setDeleting(null)}>
        <p className="p-5 text-sm leading-6 text-light-secondary-text sm:p-6">This removes the selected dummy data until the page is refreshed.</p>
        <DialogActions onCancel={() => setDeleting(null)}><DashboardButton variant="danger" onClick={confirmDelete}>Delete</DashboardButton></DialogActions>
      </DashboardDialog>}
    </>
  );
}
