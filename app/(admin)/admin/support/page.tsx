"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import {
  Avatar,
  DashboardButton,
  DashboardCard,
  StatusBadge,
} from "@/components/dashboard/ui";
import { DashboardDialog, DashboardToast } from "@/components/dashboard/Dialog";

type SupportTab = "tickets" | "reports";
type TicketStatus = "Open" | "In progress" | "Resolved";
type ReportStatus = "Open" | "Reviewing" | "Actioned" | "Dismissed";
type TargetType = "Food listing" | "Store" | "User";

type TicketMessage = {
  id: number;
  author: "Customer" | "Admin";
  body: string;
  sentAt: string;
};

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

type Report = {
  id: number;
  reporter: string;
  reporterEmail: string;
  targetType: TargetType;
  targetName: string;
  reason: string;
  details: string;
  createdAt: string;
  status: ReportStatus;
};

const INITIAL_TICKETS: Ticket[] = [
  ["Payment declined", "James Smith", "james@example.com", "Payment", "2026-07-22"],
  ["Pickup code is missing", "Mary Johnson", "mary@example.com", "Pickup", "2026-07-23"],
  ["Seller changed collection time", "John Williams", "john@example.com", "Order", "2026-07-24"],
  ["Refund has not arrived", "Patricia Brown", "patricia@example.com", "Refund", "2026-07-25"],
  ["Unable to update my phone", "Jennifer Jones", "jennifer@example.com", "Account", "2026-07-26"],
  ["Wrong store address shown", "Michael Miller", "michael@example.com", "Store", "2026-07-27"],
].map(([subject, customer, email, type, createdAt], index) => ({
  id: 73423 + index,
  customer,
  email,
  type,
  subject,
  createdAt,
  status: index === 1 ? "In progress" : index === 3 ? "Resolved" : "Open",
  messages: [
    {
      id: index + 1,
      author: "Customer",
      body: `${subject}. Please help me resolve this issue.`,
      sentAt: `${createdAt} 09:30`,
    },
  ],
})) as Ticket[];

const INITIAL_REPORTS: Report[] = [
  {
    id: 91001,
    reporter: "James Smith",
    reporterEmail: "james@example.com",
    targetType: "Food listing",
    targetName: "Family Surprise Bag",
    reason: "Misleading description",
    details: "The bag description promised bakery items, but the pickup contained only bottled drinks.",
    createdAt: "2026-07-27",
    status: "Open",
  },
  {
    id: 91002,
    reporter: "Mary Johnson",
    reporterEmail: "mary@example.com",
    targetType: "Store",
    targetName: "Meal Box",
    reason: "Store repeatedly closed",
    details: "The store was closed during the advertised pickup window on two separate orders.",
    createdAt: "2026-07-26",
    status: "Reviewing",
  },
  {
    id: 91003,
    reporter: "Fresh Corner",
    reporterEmail: "support@freshcorner.example",
    targetType: "User",
    targetName: "Robert Davis",
    reason: "Pickup harassment",
    details: "The customer used threatening language after arriving outside the collection window.",
    createdAt: "2026-07-25",
    status: "Open",
  },
  {
    id: 91004,
    reporter: "Jennifer Jones",
    reporterEmail: "jennifer@example.com",
    targetType: "Food listing",
    targetName: "Chef's Choice Dinner",
    reason: "Possible allergen issue",
    details: "The listing did not mention nuts, but the store said the meal may contain peanuts at pickup.",
    createdAt: "2026-07-24",
    status: "Actioned",
  },
  {
    id: 91005,
    reporter: "Michael Miller",
    reporterEmail: "michael@example.com",
    targetType: "Store",
    targetName: "Sunrise Bakery",
    reason: "Incorrect store address",
    details: "The map pin and written address point to different streets.",
    createdAt: "2026-07-23",
    status: "Dismissed",
  },
];

const PAGE_SIZE = 4;

function ticketTone(status: TicketStatus) {
  return status === "Resolved" ? "success" : status === "In progress" ? "warning" : "info";
}

function reportTone(status: ReportStatus) {
  if (status === "Actioned") return "success";
  if (status === "Dismissed") return "neutral";
  return status === "Reviewing" ? "warning" : "error";
}

export default function AdminSupport() {
  const [tab, setTab] = useState<SupportTab>("tickets");
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [activeTicketId, setActiveTicketId] = useState<number | null>(null);
  const [activeReportId, setActiveReportId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const activeTicket =
    tickets.find((ticket) => ticket.id === activeTicketId) ?? null;
  const activeReport =
    reports.find((report) => report.id === activeReportId) ?? null;

  const filteredTickets = useMemo(
    () =>
      tickets.filter((ticket) => {
        const query = search.trim().toLowerCase();
        return (
          (!query ||
            `${ticket.id} ${ticket.customer} ${ticket.email} ${ticket.subject}`
              .toLowerCase()
              .includes(query)) &&
          (!status || ticket.status === status) &&
          (!date || ticket.createdAt === date)
        );
      }),
    [date, search, status, tickets],
  );

  const filteredReports = useMemo(
    () =>
      reports.filter((report) => {
        const query = search.trim().toLowerCase();
        return (
          (!query ||
            `${report.id} ${report.reporter} ${report.targetName} ${report.reason}`
              .toLowerCase()
              .includes(query)) &&
          (!status || report.status === status) &&
          (!date || report.createdAt === date)
        );
      }),
    [date, reports, search, status],
  );

  const filtered = tab === "tickets" ? filteredTickets : filteredReports;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const ticketRows = filteredTickets.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const reportRows = filteredReports.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const openReportCount = reports.filter(
    (report) => report.status === "Open" || report.status === "Reviewing",
  ).length;

  function changeTab(next: SupportTab) {
    setTab(next);
    setSearch("");
    setStatus("");
    setDate("");
    setPage(1);
  }

  function changeTicketStatus(next: TicketStatus) {
    if (!activeTicket) return;
    setTickets((items) =>
      items.map((ticket) =>
        ticket.id === activeTicket.id ? { ...ticket, status: next } : ticket,
      ),
    );
    setToast(`Ticket #${activeTicket.id} marked ${next.toLowerCase()}.`);
  }

  function reply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeTicket) return;
    const form = event.currentTarget;
    const body = String(new FormData(form).get("reply") ?? "").trim();
    if (!body) return;
    setTickets((items) =>
      items.map((ticket) =>
        ticket.id === activeTicket.id
          ? {
              ...ticket,
              status: "In progress",
              messages: [
                ...ticket.messages,
                { id: Date.now(), author: "Admin", body, sentAt: "Just now" },
              ],
            }
          : ticket,
      ),
    );
    form.reset();
    setToast("Reply added to the ticket.");
  }

  function changeReportStatus(next: ReportStatus) {
    if (!activeReport) return;
    setReports((items) =>
      items.map((report) =>
        report.id === activeReport.id ? { ...report, status: next } : report,
      ),
    );
    setPage(1);
    setToast(`Report #${activeReport.id} marked ${next.toLowerCase()}.`);
  }

  return (
    <>
      {toast && <DashboardToast key={toast}>{toast}</DashboardToast>}

      <DashboardCard className="w-full overflow-hidden">
        <div className="p-4 sm:p-6">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Marketplace help desk
            </p>
            <h1 className="text-xl font-bold">Support & Reports</h1>
          </div>

          <div
            aria-label="Support and report sections"
            className="mt-5 flex gap-2 border-b border-gray-500/20"
          >
            <button
              aria-pressed={tab === "tickets"}
              className={`border-b-2 px-3 py-2 text-sm font-semibold ${
                tab === "tickets"
                  ? "border-primary text-primary"
                  : "border-transparent text-light-secondary-text hover:text-light-primary-text"
              }`}
              onClick={() => changeTab("tickets")}
              type="button"
            >
              Support tickets
            </button>
            <button
              aria-pressed={tab === "reports"}
              className={`border-b-2 px-3 py-2 text-sm font-semibold ${
                tab === "reports"
                  ? "border-primary text-primary"
                  : "border-transparent text-light-secondary-text hover:text-light-primary-text"
              }`}
              onClick={() => changeTab("reports")}
              type="button"
            >
              Reports ({openReportCount})
            </button>
          </div>

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative w-full lg:w-80">
              <span className="sr-only">
                Search {tab === "tickets" ? "support tickets" : "reports"}
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
                placeholder={tab === "tickets" ? "Search tickets..." : "Search reporter or target..."}
                type="search"
                value={search}
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <select
                aria-label={tab === "tickets" ? "Ticket status" : "Report status"}
                className="h-9 rounded-full border-none bg-gray-100 px-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
                value={status}
              >
                <option value="">All statuses</option>
                {tab === "tickets" ? (
                  <>
                    <option>Open</option>
                    <option>In progress</option>
                    <option>Resolved</option>
                  </>
                ) : (
                  <>
                    <option>Open</option>
                    <option>Reviewing</option>
                    <option>Actioned</option>
                    <option>Dismissed</option>
                  </>
                )}
              </select>
              <input
                aria-label="Created date"
                className="h-9 rounded-full border-none bg-gray-100 px-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"
                onChange={(event) => {
                  setDate(event.target.value);
                  setPage(1);
                }}
                type="date"
                value={date}
              />
              {(search || status || date) && (
                <button
                  className="h-9 rounded-full px-3 text-sm font-semibold text-primary hover:bg-primary-lighter"
                  onClick={() => {
                    setSearch("");
                    setStatus("");
                    setDate("");
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
          {tab === "tickets" ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3 pl-5">Ticket</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Created</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ticketRows.map((ticket) => (
                  <tr
                    className="border-t border-gray-500/20 hover:bg-gray-50/50"
                    key={ticket.id}
                  >
                    <td className="max-w-sm p-3 pl-5">
                      <strong className="block">#{ticket.id}</strong>
                      <span
                        className="block truncate text-light-secondary-text"
                        title={ticket.subject}
                      >
                        {ticket.subject}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={ticket.customer} size="sm" />
                        <span>{ticket.customer}</span>
                      </div>
                    </td>
                    <td className="p-3">{ticket.type}</td>
                    <td className="p-3">{ticket.createdAt}</td>
                    <td className="p-3">
                      <StatusBadge tone={ticketTone(ticket.status)}>
                        {ticket.status}
                      </StatusBadge>
                    </td>
                    <td className="p-3 pr-5 text-right">
                      <button
                        className="h-8 rounded-lg px-3 font-semibold text-primary hover:bg-primary-lighter"
                        onClick={() => setActiveTicketId(ticket.id)}
                        type="button"
                      >
                        Open
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
                  <th className="p-3 pl-5">Report</th>
                  <th className="p-3">Reporter</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Created</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reportRows.map((report) => (
                  <tr
                    className="border-t border-gray-500/20 hover:bg-gray-50/50"
                    key={report.id}
                  >
                    <td className="p-3 pl-5 font-semibold">#{report.id}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={report.reporter} size="sm" />
                        <div>
                          <strong className="block">{report.reporter}</strong>
                          <span className="text-xs text-light-secondary-text">
                            {report.reporterEmail}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <strong className="block">{report.targetName}</strong>
                      <span className="text-xs text-light-secondary-text">
                        {report.targetType}
                      </span>
                    </td>
                    <td className="max-w-56 p-3">
                      <span className="block truncate" title={report.reason}>
                        {report.reason}
                      </span>
                    </td>
                    <td className="p-3">{report.createdAt}</td>
                    <td className="p-3">
                      <StatusBadge tone={reportTone(report.status)}>
                        {report.status}
                      </StatusBadge>
                    </td>
                    <td className="p-3 pr-5 text-right">
                      <button
                        className="h-8 rounded-lg px-3 font-semibold text-primary hover:bg-primary-lighter"
                        onClick={() => setActiveReportId(report.id)}
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

          {(tab === "tickets" ? ticketRows.length : reportRows.length) === 0 && (
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

      {activeTicket && (
        <DashboardDialog
          title={`Ticket #${activeTicket.id}`}
          onClose={() => setActiveTicketId(null)}
        >
          <div className="max-h-[65vh] space-y-5 overflow-y-auto p-5 sm:p-6">
            <div>
              <div className="flex items-center justify-between gap-3">
                <StatusBadge tone={ticketTone(activeTicket.status)}>
                  {activeTicket.status}
                </StatusBadge>
                <span className="text-xs text-light-secondary-text">
                  {activeTicket.createdAt}
                </span>
              </div>
              <h3 className="mt-3 font-bold">{activeTicket.subject}</h3>
              <p className="mt-1 text-sm text-light-secondary-text">
                {activeTicket.customer} · {activeTicket.email}
              </p>
            </div>
            <div className="space-y-3">
              {activeTicket.messages.map((message) => (
                <div
                  className={`rounded-xl p-3 text-sm ${
                    message.author === "Admin"
                      ? "ml-8 bg-primary-lighter"
                      : "mr-8 bg-gray-100"
                  }`}
                  key={message.id}
                >
                  <strong className="block text-xs">{message.author}</strong>
                  <p className="mt-1 leading-6">{message.body}</p>
                  <span className="mt-1 block text-xs text-light-secondary-text">
                    {message.sentAt}
                  </span>
                </div>
              ))}
            </div>
            <form onSubmit={reply}>
              <label className="sr-only" htmlFor="ticket-reply">
                Reply
              </label>
              <textarea
                className="w-full rounded-xl border-none bg-gray-100 p-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"
                id="ticket-reply"
                name="reply"
                placeholder="Write a reply..."
                required
                rows={3}
              />
              <div className="mt-3 flex justify-end">
                <DashboardButton type="submit">Send reply</DashboardButton>
              </div>
            </form>
          </div>
          <footer className="flex flex-wrap justify-end gap-3 border-t border-gray-500/20 p-4 sm:px-6">
            <DashboardButton
              variant="secondary"
              onClick={() => setActiveTicketId(null)}
            >
              Close
            </DashboardButton>
            {activeTicket.status === "Resolved" ? (
              <DashboardButton onClick={() => changeTicketStatus("Open")}>
                Reopen ticket
              </DashboardButton>
            ) : (
              <DashboardButton onClick={() => changeTicketStatus("Resolved")}>
                Resolve ticket
              </DashboardButton>
            )}
          </footer>
        </DashboardDialog>
      )}

      {activeReport && (
        <DashboardDialog
          title={`Report #${activeReport.id}`}
          onClose={() => setActiveReportId(null)}
        >
          <div className="space-y-5 p-5 text-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <StatusBadge tone={reportTone(activeReport.status)}>
                {activeReport.status}
              </StatusBadge>
              <span className="text-xs text-light-secondary-text">
                {activeReport.createdAt}
              </span>
            </div>
            <section>
              <h3 className="font-bold">Reported {activeReport.targetType.toLowerCase()}</h3>
              <p className="mt-1 text-base">{activeReport.targetName}</p>
              <p className="mt-1 text-light-secondary-text">
                Reported by {activeReport.reporter} · {activeReport.reporterEmail}
              </p>
            </section>
            <section className="rounded-xl bg-gray-100 p-4">
              <h3 className="font-bold">{activeReport.reason}</h3>
              <p className="mt-2 leading-6 text-light-secondary-text">
                {activeReport.details}
              </p>
            </section>
            {activeReport.targetType === "Store" && (
              <Link className="font-semibold text-primary hover:underline" href="/admin/sellers">
                Open Seller Accounts to moderate this store
              </Link>
            )}
            {activeReport.targetType === "User" && (
              <Link className="font-semibold text-primary hover:underline" href="/admin/users">
                Open User Accounts to review this user
              </Link>
            )}
            {activeReport.targetType === "Food listing" && (
              <p className="text-light-secondary-text">
                Food-listing moderation can be connected when an admin listing screen exists.
              </p>
            )}
          </div>
          <footer className="flex flex-wrap justify-end gap-3 border-t border-gray-500/20 p-4 sm:px-6">
            <DashboardButton variant="secondary" onClick={() => setActiveReportId(null)}>
              Close
            </DashboardButton>
            {activeReport.status === "Open" && (
              <DashboardButton onClick={() => changeReportStatus("Reviewing")}>
                Start review
              </DashboardButton>
            )}
            {(activeReport.status === "Open" || activeReport.status === "Reviewing") && (
              <>
                <DashboardButton
                  variant="secondary"
                  onClick={() => changeReportStatus("Dismissed")}
                >
                  Dismiss
                </DashboardButton>
                <DashboardButton onClick={() => changeReportStatus("Actioned")}>
                  Mark actioned
                </DashboardButton>
              </>
            )}
            {(activeReport.status === "Actioned" ||
              activeReport.status === "Dismissed") && (
              <DashboardButton onClick={() => changeReportStatus("Open")}>
                Reopen report
              </DashboardButton>
            )}
          </footer>
        </DashboardDialog>
      )}
    </>
  );
}
