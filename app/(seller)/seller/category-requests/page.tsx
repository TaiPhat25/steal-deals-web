"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { DashboardButton, DashboardCard, PageHeader, StatusBadge } from "@/components/dashboard/ui";
import { DashboardDialog, DashboardToast, DialogActions } from "@/components/dashboard/Dialog";
import { createCategorySuggestion, listMyCategorySuggestions } from "@/lib/api/store";
import type { CategorySuggestionResponse } from "@/lib/api/dashboard-types";

const INITIAL_SUGGESTIONS: CategorySuggestionResponse[] = [
  {
    id: "90000000-0000-0000-0000-000000000001",
    storeId: "20000000-0000-0000-0000-000000000001",
    storeName: "Daily Basket",
    suggestedName: "Organic Dairy & Cheeses",
    status: "Pending",
    adminComment: null,
    createdAt: "2026-08-10T14:30:00+07:00",
  },
  {
    id: "90000000-0000-0000-0000-000000000002",
    storeId: "20000000-0000-0000-0000-000000000001",
    storeName: "Daily Basket",
    suggestedName: "Plant-Based & Vegan Deli",
    status: "Approved",
    adminComment: "Great suggestion! Added to official categories catalog.",
    createdAt: "2026-08-01T10:15:00+07:00",
  },
  {
    id: "90000000-0000-0000-0000-000000000003",
    storeId: "20000000-0000-0000-0000-000000000001",
    storeName: "Daily Basket",
    suggestedName: "Household Cleaning Supplies",
    status: "Rejected",
    adminComment: "StealDeal only accepts food, beverage, bakery, and produce rescue categories at this time.",
    createdAt: "2026-07-25T16:00:00+07:00",
  },
];

const PAGE_SIZE = 5;

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const statusTone = (status: string): "warning" | "success" | "error" | "neutral" => {
  switch (status.toLowerCase()) {
    case "pending":
      return "warning";
    case "approved":
      return "success";
    case "rejected":
      return "error";
    default:
      return "neutral";
  }
};

export default function SellerCategoryRequests() {
  const { accessToken } = useAuth();
  const [suggestions, setSuggestions] = useState<CategorySuggestionResponse[]>(INITIAL_SUGGESTIONS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [viewingSuggestion, setViewingSuggestion] = useState<CategorySuggestionResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [demoReason, setDemoReason] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(() => {
      setLoading(true);
      setDemoReason("");

      if (!accessToken) {
        setSuggestions(INITIAL_SUGGESTIONS);
        setDemoReason("Sign in as a seller to sync with the Store Service.");
        setLoading(false);
        return;
      }

      void listMyCategorySuggestions(accessToken)
        .then((items) => {
          if (!active) return;
          setSuggestions(items);
          setPage(1);
        })
        .catch((caught) => {
          if (!active) return;
          setSuggestions(INITIAL_SUGGESTIONS);
          setPage(1);
          setDemoReason(
            caught instanceof Error
              ? caught.message
              : "The Store Service could not be reached.",
          );
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [accessToken, reloadVersion]);

  const filtered = useMemo(() => {
    return suggestions.filter((item) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.suggestedName.toLowerCase().includes(query) ||
        (item.adminComment && item.adminComment.toLowerCase().includes(query));
      const matchesStatus =
        !statusFilter || item.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [suggestions, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const pendingCount = suggestions.filter((s) => s.status.toLowerCase() === "pending").length;
  const approvedCount = suggestions.filter((s) => s.status.toLowerCase() === "approved").length;
  const rejectedCount = suggestions.filter((s) => s.status.toLowerCase() === "rejected").length;

  function resetPage() {
    setPage(1);
  }

  async function handleCreateRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    const data = new FormData(event.currentTarget);
    const suggestedName = String(data.get("suggestedName") || "").trim();

    if (!suggestedName) {
      setSubmitError("Please enter a category name.");
      return;
    }

    if (
      suggestions.some(
        (item) =>
          item.suggestedName.toLowerCase() === suggestedName.toLowerCase() &&
          item.status.toLowerCase() === "pending",
      )
    ) {
      setSubmitError("You already have a pending request for this category name.");
      return;
    }

    if (demoReason || !accessToken) {
      const newDemoItem: CategorySuggestionResponse = {
        id: `demo-${Date.now()}`,
        storeId: "20000000-0000-0000-0000-000000000001",
        storeName: "Daily Basket",
        suggestedName,
        status: "Pending",
        adminComment: null,
        createdAt: new Date().toISOString(),
      };
      setSuggestions((prev) => [newDemoItem, ...prev]);
      setIsRequestModalOpen(false);
      setToast(`Category request for "${suggestedName}" submitted.`);
      resetPage();
      return;
    }

    setSubmitting(true);
    try {
      const created = await createCategorySuggestion(accessToken, { suggestedName });
      setSuggestions((prev) => [created, ...prev]);
      setIsRequestModalOpen(false);
      setToast(`Category request for "${suggestedName}" submitted.`);
      resetPage();
    } catch (caught) {
      setSubmitError(
        caught instanceof Error
          ? caught.message
          : "Unable to submit your category request.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {toast && <DashboardToast key={toast}>{toast}</DashboardToast>}

      <div className="space-y-6">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Store Catalog Expansion
          </p>
          <PageHeader
            title="Category Requests"
            action={
              <DashboardButton
                disabled={loading}
                onClick={() => {
                  setSubmitError("");
                  setIsRequestModalOpen(true);
                }}
              >
                + Request new category
              </DashboardButton>
            }
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard className="p-4 sm:p-5">
            <p className="text-sm text-light-secondary-text">Total Requests</p>
            <p className="mt-1 text-2xl font-bold">{suggestions.length}</p>
          </DashboardCard>
          <DashboardCard className="p-4 sm:p-5">
            <p className="text-sm text-light-secondary-text">Pending Review</p>
            <p className="mt-1 text-2xl font-bold text-warning-dark">{pendingCount}</p>
          </DashboardCard>
          <DashboardCard className="p-4 sm:p-5">
            <p className="text-sm text-light-secondary-text">Approved</p>
            <p className="mt-1 text-2xl font-bold text-success-dark">{approvedCount}</p>
          </DashboardCard>
          <DashboardCard className="p-4 sm:p-5">
            <p className="text-sm text-light-secondary-text">Rejected</p>
            <p className="mt-1 text-2xl font-bold text-error-dark">{rejectedCount}</p>
          </DashboardCard>
        </div>

        <DashboardCard className="w-full overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="relative w-full lg:w-80">
                <span className="sr-only">Search requests</span>
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-light-secondary-text">
                  ⌕
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    resetPage();
                  }}
                  placeholder="Search category name or notes..."
                  className="h-9 w-full rounded-full border-none bg-gray-100 pl-9 pr-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"
                />
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  aria-label="Filter by request status"
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    resetPage();
                  }}
                  className="h-9 rounded-full border-none bg-gray-100 px-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"
                >
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                {(search || statusFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("");
                      resetPage();
                    }}
                    className="h-9 rounded-full px-3 text-sm font-semibold text-primary hover:bg-primary-lighter"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {demoReason && (
            <div
              className="flex flex-col gap-3 border-t border-warning/30 bg-warning/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6"
              role="status"
            >
              <p>
                <strong>Demo data active.</strong> {demoReason}
              </p>
              <button
                type="button"
                onClick={() => setReloadVersion((version) => version + 1)}
                className="h-8 shrink-0 rounded-full px-3 font-semibold text-warning-dark hover:bg-warning/15"
              >
                Retry API
              </button>
            </div>
          )}

          {loading ? (
            <div
              className="border-t border-gray-500/20 px-4 py-14 text-center text-sm text-light-secondary-text"
              role="status"
            >
              Loading category requests…
            </div>
          ) : (
            <>
              <div className="overflow-x-auto border-t border-gray-500/20">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-left">
                    <tr>
                      <th className="p-3 pl-5">No.</th>
                      <th className="p-3">Suggested Category</th>
                      <th className="p-3">Submitted</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Admin Feedback</th>
                      <th className="p-3 pr-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-t border-gray-500/20 hover:bg-gray-50/50"
                      >
                        <td className="p-3 pl-5 text-light-secondary-text">
                          {(currentPage - 1) * PAGE_SIZE + index + 1}
                        </td>
                        <td className="p-3 font-semibold text-gray-900">
                          {item.suggestedName}
                        </td>
                        <td className="p-3 text-light-secondary-text">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="p-3">
                          <StatusBadge tone={statusTone(item.status)}>
                            {item.status}
                          </StatusBadge>
                        </td>
                        <td className="max-w-xs p-3">
                          {item.adminComment ? (
                            <span
                              className="block truncate text-light-secondary-text"
                              title={item.adminComment}
                            >
                              {item.adminComment}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">
                              {item.status.toLowerCase() === "pending"
                                ? "Awaiting review"
                                : "No comment"}
                            </span>
                          )}
                        </td>
                        <td className="p-3 pr-5 text-right">
                          <button
                            type="button"
                            onClick={() => setViewingSuggestion(item)}
                            className="h-8 rounded-lg px-3 font-semibold text-primary hover:bg-primary-lighter"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {rows.length === 0 && (
                  <div className="px-4 py-14 text-center text-sm text-light-secondary-text">
                    {search || statusFilter
                      ? "No category requests match these filters."
                      : "You haven't submitted any category requests yet. Click '+ Request new category' to suggest one."}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-gray-500/20 p-4 sm:px-6">
                <span className="text-sm text-light-secondary-text">
                  {filtered.length} request{filtered.length === 1 ? "" : "s"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                    className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    ‹
                  </button>
                  <span className="text-sm font-semibold">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setPage(currentPage + 1)}
                    className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40"
                    aria-label="Next page"
                  >
                    ›
                  </button>
                </div>
              </div>
            </>
          )}
        </DashboardCard>
      </div>

      {/* New Request Modal */}
      {isRequestModalOpen && (
        <DashboardDialog
          title="Request New Category"
          onClose={() => {
            if (!submitting) {
              setIsRequestModalOpen(false);
              setSubmitError("");
            }
          }}
        >
          <form onSubmit={handleCreateRequest}>
            <div className="space-y-4 p-5 sm:p-6">
              <p className="text-sm text-light-secondary-text">
                Suggest a new food category to organize your surprise bags. StealDeal
                administrators will review your submission before it appears in the official
                catalog.
              </p>

              {submitError && (
                <div
                  role="alert"
                  className="rounded-xl border border-error/30 bg-error-alpha-16 p-3 text-sm text-error-dark"
                >
                  {submitError}
                </div>
              )}

              <label className="block text-sm font-semibold">
                Category name
                <input
                  name="suggestedName"
                  required
                  autoFocus
                  placeholder="e.g. Vegan & Plant-Based, Gluten-Free Bakery..."
                  className="mt-2 h-10 w-full rounded-xl border-none bg-gray-100 px-3.5 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"
                />
              </label>

              <div className="rounded-xl bg-gray-50 p-3 text-xs text-light-secondary-text">
                💡 Tip: Check existing food categories first to avoid duplicate requests. Your
                request will be placed in the admin review queue.
              </div>
            </div>

            <DialogActions
              onCancel={() => {
                if (!submitting) {
                  setIsRequestModalOpen(false);
                  setSubmitError("");
                }
              }}
            >
              <DashboardButton type="submit" disabled={submitting}>
                {submitting ? "Submitting…" : "Submit request"}
              </DashboardButton>
            </DialogActions>
          </form>
        </DashboardDialog>
      )}

      {/* Details Modal */}
      {viewingSuggestion && (
        <DashboardDialog
          title="Category Request Details"
          onClose={() => setViewingSuggestion(null)}
        >
          <div className="space-y-4 p-5 sm:p-6 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">Status</span>
              <StatusBadge tone={statusTone(viewingSuggestion.status)}>
                {viewingSuggestion.status}
              </StatusBadge>
            </div>

            <dl className="grid grid-cols-[120px_1fr] gap-3 border-t border-gray-100 pt-3">
              <dt className="text-light-secondary-text">Suggested Name</dt>
              <dd className="font-semibold text-gray-900">
                {viewingSuggestion.suggestedName}
              </dd>

              <dt className="text-light-secondary-text">Submitted</dt>
              <dd className="text-gray-700">{formatDate(viewingSuggestion.createdAt)}</dd>

              <dt className="text-light-secondary-text">Store</dt>
              <dd className="text-gray-700">{viewingSuggestion.storeName}</dd>
            </dl>

            <div className="border-t border-gray-100 pt-3">
              <span className="block font-semibold text-gray-700">Admin Feedback</span>
              <p className="mt-1 text-sm text-light-secondary-text">
                {viewingSuggestion.adminComment || (
                  <span className="italic text-gray-400">
                    {viewingSuggestion.status.toLowerCase() === "pending"
                      ? "No feedback yet. Administrators will review your suggestion shortly."
                      : "No comment was provided with this decision."}
                  </span>
                )}
              </p>
            </div>
          </div>

          <footer className="flex justify-end border-t border-gray-500/20 px-5 py-4 sm:px-6">
            <DashboardButton variant="secondary" onClick={() => setViewingSuggestion(null)}>
              Close
            </DashboardButton>
          </footer>
        </DashboardDialog>
      )}
    </>
  );
}
