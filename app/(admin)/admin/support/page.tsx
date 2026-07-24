"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Avatar, DashboardButton, DashboardCard, StatusBadge } from "@/components/dashboard/ui";
import { DashboardDialog, DashboardToast } from "@/components/dashboard/Dialog";

type TicketStatus = "Open" | "In progress" | "Resolved";
type TicketMessage = { id: number; author: "Customer" | "Admin"; body: string; sentAt: string };
type Ticket = {
  id: number;
  customer: string;
  email: string;
  type: string;
  subject: string;
  createdAt: string;
  status: TicketStatus;
  messages: TicketMessage[];
};

const TICKETS: Ticket[] = [
  ["Payment declined", "James Smith", "james@example.com", "Payment", "2027-09-11"],
  ["Pickup code is missing", "Mary Johnson", "mary@example.com", "Pickup", "2027-09-12"],
  ["Seller changed collection time", "John Williams", "john@example.com", "Order", "2027-09-13"],
  ["Refund has not arrived", "Patricia Brown", "patricia@example.com", "Refund", "2027-09-14"],
  ["Unable to update my phone", "Jennifer Jones", "jennifer@example.com", "Account", "2027-09-15"],
  ["Wrong store address shown", "Michael Miller", "michael@example.com", "Store", "2027-09-16"],
].map(([subject, customer, email, type, createdAt], index) => ({
  id: 73423 + index,
  customer,
  email,
  type,
  subject,
  createdAt,
  status: index === 1 ? "In progress" : index === 3 ? "Resolved" : "Open",
  messages: [{ id: index + 1, author: "Customer", body: `${subject}. Please help me resolve this issue.`, sentAt: `${createdAt} 09:30` }],
})) as Ticket[];
const PAGE_SIZE = 4;

function tone(status: TicketStatus) {
  return status === "Resolved" ? "success" : status === "In progress" ? "warning" : "info";
}

export default function AdminSupport() {
  const [tickets, setTickets] = useState(TICKETS);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const active = tickets.find((ticket) => ticket.id === activeId) ?? null;
  const filtered = useMemo(() => tickets.filter((ticket) => {
    const query = search.trim().toLowerCase();
    return (!query || `${ticket.id} ${ticket.customer} ${ticket.email} ${ticket.subject}`.toLowerCase().includes(query))
      && (!status || ticket.status === status)
      && (!date || ticket.createdAt === date);
  }), [date, search, status, tickets]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetPage() {
    setPage(1);
  }

  function changeStatus(next: TicketStatus) {
    if (!active) return;
    setTickets((items) => items.map((ticket) => ticket.id === active.id ? { ...ticket, status: next } : ticket));
    setToast(`Ticket #${active.id} marked ${next.toLowerCase()}.`);
  }

  function reply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active) return;
    const form = event.currentTarget;
    const body = String(new FormData(form).get("reply") ?? "").trim();
    if (!body) return;
    setTickets((items) => items.map((ticket) => ticket.id === active.id ? {
      ...ticket,
      status: "In progress",
      messages: [...ticket.messages, { id: Date.now(), author: "Admin", body, sentAt: "Just now" }],
    } : ticket));
    form.reset();
    setToast("Reply added to the ticket.");
  }

  return (
    <>
      {toast && <DashboardToast key={toast}>{toast}</DashboardToast>}
      <DashboardCard className="w-full overflow-hidden">
        <div className="p-4 sm:p-6">
          <div><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">Customer care</p><h1 className="text-xl font-bold">Support tickets</h1></div>
          <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative w-full lg:w-72"><span className="sr-only">Search support tickets</span><span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-secondary-text">⌕</span><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); resetPage(); }} placeholder="Search tickets..." className="h-9 w-full rounded-full border-none bg-gray-100 pl-9 pr-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" /></label>
            <div className="flex flex-wrap gap-3"><select aria-label="Ticket status" value={status} onChange={(event) => { setStatus(event.target.value as TicketStatus | ""); resetPage(); }} className="h-9 rounded-full border-none bg-gray-100 px-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"><option value="">All statuses</option><option>Open</option><option>In progress</option><option>Resolved</option></select><input aria-label="Created date" type="date" value={date} onChange={(event) => { setDate(event.target.value); resetPage(); }} className="h-9 rounded-full border-none bg-gray-100 px-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" />{(search || status || date) && <button type="button" onClick={() => { setSearch(""); setStatus(""); setDate(""); resetPage(); }} className="h-9 rounded-full px-3 text-sm font-semibold text-primary hover:bg-primary-lighter">Clear</button>}</div>
          </div>
        </div>
        <div className="overflow-x-auto border-t border-gray-500/20">
          <table className="w-full text-sm"><thead className="bg-gray-100 text-left"><tr><th className="p-3 pl-5">Ticket</th><th className="p-3">Customer</th><th className="p-3">Type</th><th className="p-3">Created</th><th className="p-3">Status</th><th className="p-3 pr-5 text-right">Actions</th></tr></thead>
            <tbody>{rows.map((ticket) => <tr key={ticket.id} className="border-t border-gray-500/20 hover:bg-gray-50/50"><td className="max-w-sm p-3 pl-5"><strong className="block">#{ticket.id}</strong><span className="block truncate text-light-secondary-text" title={ticket.subject}>{ticket.subject}</span></td><td className="p-3"><div className="flex items-center gap-3"><Avatar name={ticket.customer} size="sm" /><span>{ticket.customer}</span></div></td><td className="p-3">{ticket.type}</td><td className="p-3">{ticket.createdAt}</td><td className="p-3"><StatusBadge tone={tone(ticket.status)}>{ticket.status}</StatusBadge></td><td className="p-3 pr-5 text-right"><button type="button" onClick={() => setActiveId(ticket.id)} className="h-8 rounded-lg px-3 font-semibold text-primary hover:bg-primary-lighter">Open</button></td></tr>)}</tbody>
          </table>
          {rows.length === 0 && <div className="px-4 py-14 text-center text-sm text-light-secondary-text">No tickets match these filters.</div>}
        </div>
        <div className="flex items-center justify-between border-t border-gray-500/20 p-4 sm:px-6"><span className="text-sm text-light-secondary-text">{filtered.length} tickets</span><div className="flex items-center gap-2"><button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage(page - 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40">‹</button><span className="text-sm font-semibold">Page {page} of {totalPages}</span><button type="button" aria-label="Next page" disabled={page === totalPages} onClick={() => setPage(page + 1)} className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40">›</button></div></div>
      </DashboardCard>

      {active && <DashboardDialog title={`Ticket #${active.id}`} onClose={() => setActiveId(null)}>
        <div className="max-h-[65vh] space-y-5 overflow-y-auto p-5 sm:p-6">
          <div><div className="flex items-center justify-between gap-3"><StatusBadge tone={tone(active.status)}>{active.status}</StatusBadge><span className="text-xs text-light-secondary-text">{active.createdAt}</span></div><h3 className="mt-3 font-bold">{active.subject}</h3><p className="mt-1 text-sm text-light-secondary-text">{active.customer} · {active.email}</p></div>
          <div className="space-y-3">{active.messages.map((message) => <div key={message.id} className={`rounded-xl p-3 text-sm ${message.author === "Admin" ? "ml-8 bg-primary-lighter" : "mr-8 bg-gray-100"}`}><strong className="block text-xs">{message.author}</strong><p className="mt-1 leading-6">{message.body}</p><span className="mt-1 block text-xs text-light-secondary-text">{message.sentAt}</span></div>)}</div>
          <form onSubmit={reply}><label className="sr-only" htmlFor="ticket-reply">Reply</label><textarea id="ticket-reply" name="reply" required rows={3} placeholder="Write a reply..." className="w-full rounded-xl border-none bg-gray-100 p-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" /><div className="mt-3 flex justify-end"><DashboardButton type="submit">Send reply</DashboardButton></div></form>
        </div>
        <footer className="flex flex-wrap justify-end gap-3 border-t border-gray-500/20 p-4 sm:px-6"><DashboardButton variant="secondary" onClick={() => setActiveId(null)}>Close</DashboardButton>{active.status === "Resolved" ? <DashboardButton onClick={() => changeStatus("Open")}>Reopen ticket</DashboardButton> : <DashboardButton onClick={() => changeStatus("Resolved")}>Resolve ticket</DashboardButton>}</footer>
      </DashboardDialog>}
    </>
  );
}
