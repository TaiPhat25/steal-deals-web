"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  DashboardButton,
  DashboardCard,
  PageHeader,
  StatusBadge,
} from "@/components/dashboard/ui";
import { DashboardDialog, DashboardToast, DialogActions } from "@/components/dashboard/Dialog";
import { listPendingCategorySuggestions, reviewCategorySuggestion } from "@/lib/api/store";
import type { CategorySuggestionResponse } from "@/lib/api/dashboard-types";

const INITIAL_PENDING_SUGGESTIONS: CategorySuggestionResponse[] = [
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
    id: "90000000-0000-0000-0000-000000000004",
    storeId: "20000000-0000-0000-0000-000000000002",
    storeName: "Fresh Corner",
    suggestedName: "Artisan Juices & Smoothies",
    status: "Pending",
    adminComment: null,
    createdAt: "2026-08-12T09:00:00+07:00",
  },
  {
    id: "90000000-0000-0000-0000-000000000005",
    storeId: "20000000-0000-0000-0000-000000000003",
    storeName: "Sunrise Bakery",
    suggestedName: "Gluten-Free Pastries",
    status: "Pending",
    adminComment: null,
    createdAt: "2026-08-14T11:20:00+07:00",
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

type ReviewDecision = "Approved" | "Rejected";

export default function AdminCategoryRequests() {
  const { accessToken } = useAuth();
  const [suggestions, setSuggestions] = useState<CategorySuggestionResponse[]>(
    INITIAL_PENDING_SUGGESTIONS,
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const [reviewingItem, setReviewingItem] = useState<CategorySuggestionResponse | null>(null);
  const [viewingItem, setViewingItem] = useState<CategorySuggestionResponse | null>(null);
  const [decision, setDecision] = useState<ReviewDecision>("Approved");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
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
        setSuggestions(INITIAL_PENDING_SUGGESTIONS);
        setDemoReason("Sign in as an administrator to sync with the Store Service.");
        setLoading(false);
        return;
      }

      void listPendingCategorySuggestions(accessToken)
        .then((items) => {
          if (!active) return;
          setSuggestions(items);
          setPage(1);
        })
        .catch((caught) => {
          if (!active) return;
          setSuggestions(INITIAL_PENDING_SUGGESTIONS);
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
        item.storeName.toLowerCase().includes(query) ||
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
  const uniqueStoresCount = new Set(suggestions.map((s) => s.storeName)).size;

  function resetPage() {
    setPage(1);
  }

  function openReviewDialog(item: CategorySuggestionResponse) {
    setReviewingItem(item);
    setDecision("Approved");
    setReviewError("");
  }

  async function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reviewingItem) return;

    setReviewError("");
    const data = new FormData(event.currentTarget);
    const adminComment = String(data.get("adminComment") || "").trim() || null;
    const officialCategoryName =
      decision === "Approved"
        ? String(data.get("officialCategoryName") || "").trim() || null
        : null;
    const iconUrl =
      decision === "Approved"
        ? String(data.get("iconUrl") || "").trim() || null
        : null;

    if (decision === "Rejected" && !adminComment) {
      setReviewError("Please provide a reason / comment explaining the rejection.");
      return;
    }

    if (demoReason || !accessToken) {
      setSuggestions((prev) =>
        prev.map((item) =>
          item.id === reviewingItem.id
            ? {
                ...item,
                status: decision,
                adminComment,
              }
            : item,
        ),
      );
      setToast(
        `Category request "${reviewingItem.suggestedName}" was ${decision.toLowerCase()}.`,
      );
      setReviewingItem(null);
      resetPage();
      return;
    }

    setSubmitting(true);
    try {
      const reviewed = await reviewCategorySuggestion(accessToken, reviewingItem.id, {
        status: decision,
        adminComment,
        iconUrl,
        officialCategoryName,
      });

      setSuggestions((prev) =>
        prev.map((item) => (item.id === reviewingItem.id ? reviewed : item)),
      );
      setToast(
        `Category request "${reviewingItem.suggestedName}" was ${decision.toLowerCase()}.`,
      );
      setReviewingItem(null);
      resetPage();
    } catch (caught) {
      setReviewError(
        caught instanceof Error
          ? caught.message
          : `Unable to ${decision.toLowerCase()} this category request.`,
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
            Marketplace Moderation
          </p>
          <PageHeader
            title="Category Requests"
            action={
              <Link href="/admin/categories">
                <DashboardButton variant="secondary">
                  ← Food categories
                </DashboardButton>
              </Link>
            }
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard className="p-4 sm:p-5">
            <p className="text-sm text-light-secondary-text">Pending Review</p>
            <p className="mt-1 text-2xl font-bold text-warning-dark">{pendingCount}</p>
          </DashboardCard>
          <DashboardCard className="p-4 sm:p-5">
            <p className="text-sm text-light-secondary-text">Requesting Stores</p>
            <p className="mt-1 text-2xl font-bold">{uniqueStoresCount}</p>
          </DashboardCard>
          <DashboardCard className="p-4 sm:p-5">
            <p className="text-sm text-light-secondary-text">Approved (Session)</p>
            <p className="mt-1 text-2xl font-bold text-success-dark">{approvedCount}</p>
          </DashboardCard>
          <DashboardCard className="p-4 sm:p-5">
            <p className="text-sm text-light-secondary-text">Rejected (Session)</p>
            <p className="mt-1 text-2xl font-bold text-error-dark">{rejectedCount}</p>
          </DashboardCard>
        </div>

        <DashboardCard className="w-full overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="relative w-full lg:w-80">
                <span className="sr-only">Search category requests</span>
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
                  placeholder="Search category, store name, notes..."
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
                      <th className="p-3">Store</th>
                      <th className="p-3">Submitted</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 pr-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((item, index) => {
                      const isPending = item.status.toLowerCase() === "pending";
                      return (
                        <tr
                          key={item.id}
                          className="border-t border-gray-500/20 hover:bg-gray-50/50"
                        >
                          <td className="p-3 pl-5 text-light-secondary-text">
                            {(currentPage - 1) * PAGE_SIZE + index + 1}
                          </td>
                          <td className="p-3">
                            <strong className="block text-gray-900">
                              {item.suggestedName}
                            </strong>
                            {item.adminComment && (
                              <span
                                className="block max-w-xs truncate text-xs text-light-secondary-text"
                                title={item.adminComment}
                              >
                                Note: {item.adminComment}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-gray-800">
                              {item.storeName}
                            </span>
                            <span className="block font-mono text-xs text-light-secondary-text">
                              {item.storeId}
                            </span>
                          </td>
                          <td className="p-3 text-light-secondary-text">
                            {formatDate(item.createdAt)}
                          </td>
                          <td className="p-3">
                            <StatusBadge tone={statusTone(item.status)}>
                              {item.status}
                            </StatusBadge>
                          </td>
                          <td className="p-3 pr-5 text-right">
                            {isPending ? (
                              <DashboardButton
                                onClick={() => openReviewDialog(item)}
                              >
                                Review
                              </DashboardButton>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setViewingItem(item)}
                                className="h-8 rounded-lg px-3 font-semibold text-primary hover:bg-primary-lighter"
                              >
                                View
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {rows.length === 0 && (
                  <div className="px-4 py-14 text-center text-sm text-light-secondary-text">
                    {search || statusFilter
                      ? "No category requests match these filters."
                      : "No category requests require review at this time."}
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

      {/* Review Dialog */}
      {reviewingItem && (
        <DashboardDialog
          title={`Review Request: "${reviewingItem.suggestedName}"`}
          onClose={() => {
            if (!submitting) {
              setReviewingItem(null);
              setReviewError("");
            }
          }}
        >
          <form onSubmit={handleReviewSubmit}>
            <div className="space-y-4 p-5 sm:p-6 text-sm">
              <div className="rounded-xl bg-gray-50 p-3.5">
                <dl className="grid grid-cols-[110px_1fr] gap-2 text-xs">
                  <dt className="text-light-secondary-text">Requested Name</dt>
                  <dd className="font-semibold text-gray-900">
                    {reviewingItem.suggestedName}
                  </dd>
                  <dt className="text-light-secondary-text">Store</dt>
                  <dd className="text-gray-800">{reviewingItem.storeName}</dd>
                  <dt className="text-light-secondary-text">Submitted</dt>
                  <dd className="text-gray-700">{formatDate(reviewingItem.createdAt)}</dd>
                </dl>
              </div>

              {reviewError && (
                <div
                  role="alert"
                  className="rounded-xl border border-error/30 bg-error-alpha-16 p-3 text-sm text-error-dark"
                >
                  {reviewError}
                </div>
              )}

              <div>
                <span className="block text-sm font-semibold text-gray-800">
                  Review Decision
                </span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision("Approved")}
                    className={`h-10 rounded-xl border text-sm font-bold transition-colors ${
                      decision === "Approved"
                        ? "border-success bg-success-alpha-16 text-success-dark"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    ✓ Approve & Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision("Rejected")}
                    className={`h-10 rounded-xl border text-sm font-bold transition-colors ${
                      decision === "Rejected"
                        ? "border-error bg-error-alpha-16 text-error-dark"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    ✕ Reject Request
                  </button>
                </div>
              </div>

              {decision === "Approved" ? (
                <>
                  <label className="block text-sm font-semibold">
                    Official Category Name
                    <input
                      name="officialCategoryName"
                      defaultValue={reviewingItem.suggestedName}
                      placeholder="e.g. Organic Dairy & Cheeses"
                      className="mt-1.5 h-10 w-full rounded-xl border-none bg-gray-100 px-3.5 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"
                    />
                    <span className="mt-1 block text-xs text-light-secondary-text">
                      Adjust casing or correct typos before adding to the catalog.
                    </span>
                  </label>

                  <label className="block text-sm font-semibold">
                    Icon URL (optional)
                    <input
                      name="iconUrl"
                      type="url"
                      placeholder="https://example.com/icons/dairy.png"
                      className="mt-1.5 h-10 w-full rounded-xl border-none bg-gray-100 px-3.5 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"
                    />
                  </label>

                  <label className="block text-sm font-semibold">
                    Admin Comment (optional)
                    <input
                      name="adminComment"
                      placeholder="e.g. Approved and added to food categories catalog."
                      className="mt-1.5 h-10 w-full rounded-xl border-none bg-gray-100 px-3.5 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"
                    />
                  </label>

                  <div className="rounded-xl bg-success-alpha-16 p-3 text-xs text-success-dark">
                    ✓ Approving this suggestion will automatically generate its slug, create an
                    active official Category in the Store catalog, and notify the seller.
                  </div>
                </>
              ) : (
                <>
                  <label className="block text-sm font-semibold">
                    Rejection Reason / Comment
                    <textarea
                      name="adminComment"
                      rows={3}
                      required
                      autoFocus
                      placeholder="Explain why this request is being rejected (e.g., duplicate category, doesn't match food guidelines)..."
                      className="mt-1.5 w-full rounded-xl border-none bg-gray-100 p-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"
                    />
                    <span className="mt-1 block text-xs text-light-secondary-text">
                      This explanation will be visible to the requesting seller.
                    </span>
                  </label>

                  <div className="rounded-xl bg-error-alpha-16 p-3 text-xs text-error-dark">
                    ✕ Rejecting will close this request. No new category will be created.
                  </div>
                </>
              )}
            </div>

            <DialogActions
              onCancel={() => {
                if (!submitting) {
                  setReviewingItem(null);
                  setReviewError("");
                }
              }}
            >
              <DashboardButton
                type="submit"
                variant={decision === "Approved" ? "primary" : "danger"}
                disabled={submitting}
              >
                {submitting
                  ? "Processing…"
                  : decision === "Approved"
                    ? "Approve & Create Category"
                    : "Reject Request"}
              </DashboardButton>
            </DialogActions>
          </form>
        </DashboardDialog>
      )}

      {/* View Details Dialog */}
      {viewingItem && (
        <DashboardDialog
          title={`Category Request: "${viewingItem.suggestedName}"`}
          onClose={() => setViewingItem(null)}
        >
          <div className="space-y-4 p-5 sm:p-6 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">Status</span>
              <StatusBadge tone={statusTone(viewingItem.status)}>
                {viewingItem.status}
              </StatusBadge>
            </div>

            <dl className="grid grid-cols-[120px_1fr] gap-3 border-t border-gray-100 pt-3">
              <dt className="text-light-secondary-text">Suggested Name</dt>
              <dd className="font-semibold text-gray-900">{viewingItem.suggestedName}</dd>

              <dt className="text-light-secondary-text">Store Name</dt>
              <dd className="text-gray-800">{viewingItem.storeName}</dd>

              <dt className="text-light-secondary-text">Store ID</dt>
              <dd className="break-all font-mono text-xs text-gray-600">
                {viewingItem.storeId}
              </dd>

              <dt className="text-light-secondary-text">Submitted</dt>
              <dd className="text-gray-700">{formatDate(viewingItem.createdAt)}</dd>
            </dl>

            <div className="border-t border-gray-100 pt-3">
              <span className="block font-semibold text-gray-700">Admin Comment / Reason</span>
              <p className="mt-1 text-sm text-light-secondary-text">
                {viewingItem.adminComment || (
                  <span className="italic text-gray-400">No comment was recorded.</span>
                )}
              </p>
            </div>
          </div>

          <footer className="flex justify-end border-t border-gray-500/20 px-5 py-4 sm:px-6">
            <DashboardButton variant="secondary" onClick={() => setViewingItem(null)}>
              Close
            </DashboardButton>
          </footer>
        </DashboardDialog>
      )}
    </>
  );
}
