"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Avatar, DashboardButton, DashboardCard, StatusBadge } from "@/components/dashboard/ui";
import { DashboardDialog, DashboardToast, DialogActions } from "@/components/dashboard/Dialog";

type SellerStatus = "Pending" | "Approved" | "Rejected";
type SellerApplication = {
  id: number;
  name: string;
  email: string;
  phone: string;
  storeName: string;
  category: string;
  submittedAt: string;
  status: SellerStatus;
  reason?: string;
};

const APPLICATIONS: SellerApplication[] = [
  { id: 73423, name: "Emily Chen", email: "emily@example.com", phone: "+1 555 123 1000", storeName: "Tech Hub", category: "Groceries", submittedAt: "2027-09-11", status: "Pending" },
  { id: 73424, name: "Michael Johnson", email: "michael@example.com", phone: "+1 555 123 1001", storeName: "Style Hub", category: "Bakery", submittedAt: "2027-09-12", status: "Approved" },
  { id: 73425, name: "Sarah Smith", email: "sarah@example.com", phone: "+1 555 123 1002", storeName: "Gadget Hub", category: "Prepared meals", submittedAt: "2027-09-13", status: "Pending" },
  { id: 73426, name: "David Williams", email: "david@example.com", phone: "+1 555 123 1003", storeName: "Beauty Hub", category: "Desserts", submittedAt: "2027-09-14", status: "Rejected", reason: "Business address could not be verified." },
  { id: 73427, name: "Nora Garcia", email: "nora@example.com", phone: "+1 555 123 1004", storeName: "Daily Basket", category: "Produce", submittedAt: "2027-09-15", status: "Pending" },
  { id: 73428, name: "Ali Rahman", email: "ali@example.com", phone: "+1 555 123 1005", storeName: "Fresh Corner", category: "Drinks", submittedAt: "2027-09-16", status: "Approved" },
];
const PAGE_SIZE = 4;

function tone(status: SellerStatus) {
  return status === "Approved" ? "success" : status === "Rejected" ? "error" : "warning";
}

export default function AdminSellers() {
  const [applications, setApplications] = useState(APPLICATIONS);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SellerStatus | "">("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<SellerApplication | null>(null);
  const [rejecting, setRejecting] = useState<SellerApplication | null>(null);
  const [toast, setToast] = useState("");

  const filtered = useMemo(() => applications.filter((application) => {
    const query = search.trim().toLowerCase();
    return (!query || `${application.name} ${application.storeName} ${application.email}`.toLowerCase().includes(query))
      && (!status || application.status === status)
      && (!date || application.submittedAt === date);
  }), [applications, date, search, status]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function updateStatus(application: SellerApplication, next: SellerStatus, reason?: string) {
    setApplications((items) => items.map((item) => item.id === application.id ? { ...item, status: next, reason } : item));
    setActive(null);
    setRejecting(null);
    setToast(`${application.storeName} was ${next.toLowerCase()}.`);
  }

  function reject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rejecting) return;
    const reason = String(new FormData(event.currentTarget).get("reason") ?? "").trim();
    if (reason) updateStatus(rejecting, "Rejected", reason);
  }

  function exportCsv() {
    const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const csv = [["ID", "Seller", "Store", "Email", "Category", "Status", "Submitted"], ...filtered.map((item) => [item.id, item.name, item.storeName, item.email, item.category, item.status, item.submittedAt])]
      .map((row) => row.map(escape).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "seller-applications.csv";
    link.click();
    URL.revokeObjectURL(url);
    setToast(`${filtered.length} applications exported.`);
  }

  function resetPage() {
    setPage(1);
  }

  return (
    <>
      {toast && <DashboardToast key={toast}>{toast}</DashboardToast>}
      <DashboardCard className="w-full overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">Marketplace onboarding</p><h1 className="text-xl font-bold">Seller approvals</h1></div>
            <DashboardButton onClick={exportCsv}>Export CSV</DashboardButton>
          </div>
          <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative w-full lg:w-72"><span className="sr-only">Search seller applications</span><span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-secondary-text">⌕</span><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); resetPage(); }} placeholder="Search seller or store..." className="h-9 w-full rounded-full border-none bg-gray-100 pl-9 pr-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" /></label>
            <div className="flex flex-wrap gap-3">
              <select aria-label="Application status" value={status} onChange={(event) => { setStatus(event.target.value as SellerStatus | ""); resetPage(); }} className="h-9 rounded-full border-none bg-gray-100 px-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"><option value="">All statuses</option><option>Pending</option><option>Approved</option><option>Rejected</option></select>
              <input aria-label="Submitted date" type="date" value={date} onChange={(event) => { setDate(event.target.value); resetPage(); }} className="h-9 rounded-full border-none bg-gray-100 px-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" />
              {(search || status || date) && <button type="button" onClick={() => { setSearch(""); setStatus(""); setDate(""); resetPage(); }} className="h-9 rounded-full px-3 text-sm font-semibold text-primary hover:bg-primary-lighter">Clear</button>}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto border-t border-gray-500/20">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left"><tr><th className="p-3 pl-5">Seller</th><th className="p-3">Store</th><th className="p-3">Category</th><th className="p-3">Submitted</th><th className="p-3">Status</th><th className="p-3 pr-5 text-right">Actions</th></tr></thead>
            <tbody>{rows.map((application) => <tr key={application.id} className="border-t border-gray-500/20 hover:bg-gray-50/50">
              <td className="p-3 pl-5"><div className="flex items-center gap-3"><Avatar name={application.name} /><div><strong className="block">{application.name}</strong><span className="text-xs text-light-secondary-text">{application.email}</span></div></div></td>
              <td className="p-3 font-semibold">{application.storeName}</td><td className="p-3">{application.category}</td><td className="p-3">{application.submittedAt}</td><td className="p-3"><StatusBadge tone={tone(application.status)}>{application.status}</StatusBadge></td>
              <td className="p-3 pr-5 text-right"><button type="button" onClick={() => setActive(application)} className="h-8 rounded-lg px-3 font-semibold text-primary hover:bg-primary-lighter">Review</button></td>
            </tr>)}</tbody>
          </table>
          {rows.length === 0 && <div className="px-4 py-14 text-center text-sm text-light-secondary-text">No applications match these filters.</div>}
        </div>
        <div className="flex items-center justify-between border-t border-gray-500/20 p-4 sm:px-6"><span className="text-sm text-light-secondary-text">{filtered.length} applications</span><div className="flex items-center gap-2"><button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage(page - 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40">‹</button><span className="text-sm font-semibold">Page {page} of {totalPages}</span><button type="button" aria-label="Next page" disabled={page === totalPages} onClick={() => setPage(page + 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40">›</button></div></div>
      </DashboardCard>

      {active && <DashboardDialog title={active.storeName} onClose={() => setActive(null)}>
        <div className="space-y-4 p-5 text-sm sm:p-6">
          <div className="flex items-center gap-3"><Avatar name={active.name} size="lg" /><div><strong className="block text-base">{active.name}</strong><span className="text-light-secondary-text">#{active.id}</span></div></div>
          <dl className="grid grid-cols-[110px_1fr] gap-3"><dt className="text-light-secondary-text">Email</dt><dd>{active.email}</dd><dt className="text-light-secondary-text">Phone</dt><dd>{active.phone}</dd><dt className="text-light-secondary-text">Category</dt><dd>{active.category}</dd><dt className="text-light-secondary-text">Submitted</dt><dd>{active.submittedAt}</dd><dt className="text-light-secondary-text">Status</dt><dd><StatusBadge tone={tone(active.status)}>{active.status}</StatusBadge></dd>{active.reason && <><dt className="text-light-secondary-text">Reason</dt><dd>{active.reason}</dd></>}</dl>
        </div>
        <footer className="flex flex-wrap justify-end gap-3 border-t border-gray-500/20 p-4 sm:px-6"><DashboardButton variant="secondary" onClick={() => setActive(null)}>Close</DashboardButton>{active.status !== "Rejected" && <DashboardButton variant="danger" onClick={() => { setRejecting(active); setActive(null); }}>Reject</DashboardButton>}{active.status !== "Approved" && <DashboardButton onClick={() => updateStatus(active, "Approved")}>Approve seller</DashboardButton>}</footer>
      </DashboardDialog>}

      {rejecting && <DashboardDialog title={`Reject ${rejecting.storeName}?`} onClose={() => setRejecting(null)}><form onSubmit={reject}><div className="p-5 sm:p-6"><label className="block text-sm font-semibold">Reason<textarea autoFocus required name="reason" rows={4} defaultValue={rejecting.reason} className="mt-2 w-full rounded-xl border-none bg-gray-100 p-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" /></label></div><DialogActions onCancel={() => setRejecting(null)}><DashboardButton type="submit" variant="danger">Reject application</DashboardButton></DialogActions></form></DashboardDialog>}
    </>
  );
}
