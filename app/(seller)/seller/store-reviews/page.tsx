"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  DashboardButton,
  DashboardCard,
  PageHeader,
  ProductImage,
  StatusBadge,
} from "@/components/dashboard/ui";
import { DashboardDialog, DashboardToast } from "@/components/dashboard/Dialog";
import { useSellerDemo } from "@/components/seller/SellerDemoProvider";
import {
  deleteReviewReply,
  listMyStoreReviews,
  replyToStoreReview,
  reportReview,
  unreportReview,
} from "@/lib/api/store";
import type { StoreReviewResponse } from "@/lib/api/dashboard-types";

const PAGE_SIZE = 10;
const RATING_OPTIONS = [5, 4, 3, 2, 1] as const;

const INITIAL_REVIEWS: StoreReviewResponse[] = [
  {
    id: "80000000-0000-0000-0000-000000000001",
    orderId: "40000000-0000-0000-0000-000000000001",
    buyerId: "50000000-0000-0000-0000-000000000001",
    buyerName: "Linh Nguyen",
    storeId: "20000000-0000-0000-0000-000000000001",
    bagId: "30000000-0000-0000-0000-000000000101",
    bagName: "Bakery Surprise Bag",
    ratingScore: 5,
    comment: "Great value and the pastries were still fresh at pickup.",
    storeReply: "Thank you for rescuing our bakery bag. We are happy you enjoyed it.",
    repliedAt: "2026-07-31T09:00:00+07:00",
    createdAt: "2026-07-31T08:25:00+07:00",
    isReported: false,
  },
  {
    id: "80000000-0000-0000-0000-000000000002",
    orderId: "40000000-0000-0000-0000-000000000002",
    buyerId: "50000000-0000-0000-0000-000000000002",
    buyerName: "Daniel Lee",
    storeId: "20000000-0000-0000-0000-000000000001",
    bagId: "30000000-0000-0000-0000-000000000102",
    bagName: "Fresh Lunch Bag",
    ratingScore: 4,
    comment: "Good lunch set. Pickup was quick, but I wish the bag had one more side dish.",
    storeReply: null,
    repliedAt: null,
    createdAt: "2026-07-31T07:40:00+07:00",
    isReported: false,
  },
  {
    id: "80000000-0000-0000-0000-000000000003",
    orderId: "40000000-0000-0000-0000-000000000005",
    buyerId: "50000000-0000-0000-0000-000000000005",
    buyerName: "Quoc Bao",
    storeId: "20000000-0000-0000-0000-000000000001",
    bagId: "30000000-0000-0000-0000-000000000103",
    bagName: "Fruit and Veg Rescue",
    ratingScore: 2,
    comment: "Some fruit was bruised and the pickup counter was hard to find.",
    storeReply: null,
    repliedAt: null,
    createdAt: "2026-07-30T20:10:00+07:00",
    isReported: true,
  },
  {
    id: "80000000-0000-0000-0000-000000000004",
    orderId: "40000000-0000-0000-0000-000000000003",
    buyerId: "50000000-0000-0000-0000-000000000003",
    buyerName: "Mai Tran",
    storeId: "20000000-0000-0000-0000-000000000001",
    bagId: "30000000-0000-0000-0000-000000000105",
    bagName: "Grocery Essentials",
    ratingScore: 3,
    comment: "The essentials were useful, though one chilled item was close to expiry.",
    storeReply: "Thanks for the note. We will double-check chilled bags before handoff.",
    repliedAt: "2026-07-30T19:00:00+07:00",
    createdAt: "2026-07-30T18:35:00+07:00",
    isReported: false,
  },
  {
    id: "80000000-0000-0000-0000-000000000005",
    orderId: "40000000-0000-0000-0000-000000000004",
    buyerId: "50000000-0000-0000-0000-000000000004",
    buyerName: "An Pham",
    storeId: "20000000-0000-0000-0000-000000000001",
    bagId: "30000000-0000-0000-0000-000000000101",
    bagName: "Bakery Surprise Bag",
    ratingScore: 1,
    comment: "Order failed before pickup and I could not reserve the bag.",
    storeReply: null,
    repliedAt: null,
    createdAt: "2026-07-30T16:30:00+07:00",
    isReported: false,
  },
  {
    id: "80000000-0000-0000-0000-000000000006",
    orderId: "40000000-0000-0000-0000-000000000002",
    buyerId: "50000000-0000-0000-0000-000000000002",
    buyerName: "Daniel Lee",
    storeId: "20000000-0000-0000-0000-000000000001",
    bagId: "30000000-0000-0000-0000-000000000102",
    bagName: "Fresh Lunch Bag",
    ratingScore: 5,
    comment: "Friendly staff and the pickup code worked without any delay.",
    storeReply: "We appreciate the feedback and hope to see you again.",
    repliedAt: "2026-07-29T16:00:00+07:00",
    createdAt: "2026-07-29T15:15:00+07:00",
    isReported: false,
  },
  {
    id: "80000000-0000-0000-0000-000000000007",
    orderId: "40000000-0000-0000-0000-000000000001",
    buyerId: "50000000-0000-0000-0000-000000000001",
    buyerName: "Linh Nguyen",
    storeId: "20000000-0000-0000-0000-000000000001",
    bagId: "30000000-0000-0000-0000-000000000104",
    bagName: "Dessert Box",
    ratingScore: 4,
    comment: "Dessert box looked nice and was packed carefully.",
    storeReply: null,
    repliedAt: null,
    createdAt: "2026-07-29T13:00:00+07:00",
    isReported: false,
  },
];

type ReplyFilter = "all" | "unanswered" | "replied";
type ReportFilter = "all" | "reported" | "not_reported";
type StatusTone = "neutral" | "info" | "success" | "warning" | "error";

type InlineAction = "report" | "unreport" | "delete_reply";

const shortId = (value: string) => value.slice(0, 8);
const hasReply = (value: string | null | undefined) => Boolean(value?.trim());
const dateTime = (value: string) =>
  new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
const ratingTone = (score: number): StatusTone =>
  score >= 4 ? "success" : score === 3 ? "warning" : "error";

function RatingPips({ score }: { score: number }) {
  return (
    <span aria-label={`${score} out of 5`} className="inline-flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => (
        <span
          className={
            index < score
              ? "size-2 rounded-full bg-warning"
              : "size-2 rounded-full bg-gray-200"
          }
          key={index}
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-light-secondary-text">
        {score} / 5
      </span>
    </span>
  );
}

export default function StoreReviews() {
  const { accessToken } = useAuth();
  const { orders, products, settings, settingsLoading } = useSellerDemo();

  const [demoReviews, setDemoReviews] = useState<StoreReviewResponse[]>(INITIAL_REVIEWS);
  const [reviews, setReviews] = useState<StoreReviewResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsDemoReason, setReviewsDemoReason] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [rating, setRating] = useState("");
  const [replyStatus, setReplyStatus] = useState<ReplyFilter>("all");
  const [reportStatus, setReportStatus] = useState<ReportFilter>("all");
  const [page, setPage] = useState(1);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [replyError, setReplyError] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const [inlineAction, setInlineAction] = useState<InlineAction | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState("");

  const [toast, setToast] = useState("");

  const retryReviews = useCallback(() => {
    setReviewsDemoReason("");
    setReloadVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed !== debouncedSearch) {
        setDebouncedSearch(trimmed);
        setPage(1);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput, debouncedSearch]);

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const orderById = useMemo(
    () => new Map(orders.map((order) => [order.id, order])),
    [orders],
  );

  useEffect(() => {
    if (settingsLoading) return;

    let active = true;
    const timer = window.setTimeout(() => {
      if (!active) return;
      setReviewsLoading(true);

      if (accessToken && !reviewsDemoReason) {
        listMyStoreReviews(accessToken, {
          page,
          pageSize: PAGE_SIZE,
          search: debouncedSearch || undefined,
          ratingScore: rating ? Number(rating) : undefined,
          hasReply:
            replyStatus === "replied"
              ? true
              : replyStatus === "unanswered"
                ? false
                : undefined,
          isReported:
            reportStatus === "reported"
              ? true
              : reportStatus === "not_reported"
                ? false
                : undefined,
        })
          .then((result) => {
            if (!active) return;
            setReviews(result.items);
            setTotalCount(result.totalCount);
            setTotalPages(
              result.totalPages ?? Math.max(1, Math.ceil(result.totalCount / PAGE_SIZE)),
            );
            setReviewsLoading(false);
          })
          .catch((caught) => {
            if (!active) return;
            setReviewsDemoReason(
              caught instanceof Error ? caught.message : "The Store Service could not be reached.",
            );
            filterDemoData();
          });
      } else {
        filterDemoData();
      }
    }, 0);

    function filterDemoData() {
      if (!active) return;
      const query = debouncedSearch.toLowerCase();
      const filtered = demoReviews.filter((review) => {
        const product = productById.get(review.bagId);
        const order = orderById.get(review.orderId);
        const searchable = [
          review.id,
          review.orderId,
          review.buyerId,
          review.buyerName,
          review.bagId,
          review.bagName ?? "",
          review.comment ?? "",
          review.storeReply ?? "",
          product?.name ?? "",
          order?.storeNameSnapshot ?? "",
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch = !query || searchable.includes(query);
        const matchesRating = !rating || review.ratingScore === Number(rating);
        const matchesReply =
          replyStatus === "all" ||
          (replyStatus === "replied" && hasReply(review.storeReply)) ||
          (replyStatus === "unanswered" && !hasReply(review.storeReply));
        const matchesReport =
          reportStatus === "all" ||
          (reportStatus === "reported" && Boolean(review.isReported)) ||
          (reportStatus === "not_reported" && !review.isReported);

        return matchesSearch && matchesRating && matchesReply && matchesReport;
      });

      const calculatedPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
      const safePage = Math.min(page, calculatedPages);
      const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

      setReviews(paged);
      setTotalCount(filtered.length);
      setTotalPages(calculatedPages);
      setReviewsLoading(false);
    }

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [
    accessToken,
    debouncedSearch,
    demoReviews,
    orderById,
    page,
    productById,
    rating,
    reloadVersion,
    replyStatus,
    reportStatus,
    reviewsDemoReason,
    settingsLoading,
  ]);

  const totalReviewsCount =
    typeof settings.reviewCount === "number" && settings.reviewCount > 0
      ? settings.reviewCount
      : totalCount;

  const averageRatingScore =
    settings.ratingScore > 0
      ? Number(settings.ratingScore).toFixed(1)
      : reviews.length
        ? (reviews.reduce((sum, review) => sum + review.ratingScore, 0) / reviews.length).toFixed(1)
        : "0.0";

  const stats = [
    ["Total reviews", totalReviewsCount, "bg-accent-5/60"],
    ["Average rating", `${averageRatingScore} / 5`, "bg-accent-1/60"],
  ] as const;

  const activeReview = activeId
    ? reviews.find((review) => review.id === activeId) ??
      demoReviews.find((review) => review.id === activeId) ??
      null
    : null;
  const activeProduct = activeReview ? productById.get(activeReview.bagId) : undefined;
  const activeOrder = activeReview ? orderById.get(activeReview.orderId) : undefined;

  function clearFilters() {
    setSearchInput("");
    setDebouncedSearch("");
    setRating("");
    setReplyStatus("all");
    setReportStatus("all");
    setPage(1);
  }

  function openReview(review: StoreReviewResponse) {
    setActiveId(review.id);
    setReplyDraft(review.storeReply ?? "");
    setReplyError("");
    setInlineAction(null);
    setActionError("");
  }

  async function saveReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeReview) return;

    const nextReply = replyDraft.trim();
    if (!nextReply) {
      setReplyError("Write a store reply before saving.");
      return;
    }

    setIsSubmittingReply(true);
    setReplyError("");

    if (accessToken && !reviewsDemoReason) {
      try {
        await replyToStoreReview(accessToken, activeReview.id, nextReply);
      } catch (caught) {
        setReplyError(
          caught instanceof Error ? caught.message : "Failed to save reply. Please try again.",
        );
        setIsSubmittingReply(false);
        return;
      }
    }

    const updatedTimestamp = new Date().toISOString();
    const updateReply = (item: StoreReviewResponse): StoreReviewResponse =>
      item.id === activeReview.id
        ? {
            ...item,
            storeReply: nextReply,
            repliedAt: updatedTimestamp,
          }
        : item;

    setReviews((items) => items.map(updateReply));
    setDemoReviews((items) => items.map(updateReply));

    setIsSubmittingReply(false);
    setActiveId(null);
    setToast(`Reply saved for review #${shortId(activeReview.id)}.`);
  }

  async function handleExecuteAction(type: InlineAction) {
    if (!activeReview) return;

    setIsSubmittingAction(true);
    setActionError("");

    try {
      if (accessToken && !reviewsDemoReason) {
        if (type === "report") {
          await reportReview(accessToken, activeReview.id);
        } else if (type === "unreport") {
          await unreportReview(accessToken, activeReview.id);
        } else if (type === "delete_reply") {
          await deleteReviewReply(accessToken, activeReview.id);
        }
      }

      const updateItem = (item: StoreReviewResponse): StoreReviewResponse => {
        if (item.id !== activeReview.id) return item;
        if (type === "report") return { ...item, isReported: true };
        if (type === "unreport") return { ...item, isReported: false };
        if (type === "delete_reply") return { ...item, storeReply: null, repliedAt: null };
        return item;
      };

      setReviews((items) => items.map(updateItem));
      setDemoReviews((items) => items.map(updateItem));

      if (type === "delete_reply") {
        setReplyDraft("");
      }

      setIsSubmittingAction(false);
      setInlineAction(null);

      if (type === "report") {
        setToast(`Review #${shortId(activeReview.id)} reported to moderators.`);
      } else if (type === "unreport") {
        setToast(`Report dismissed for review #${shortId(activeReview.id)}.`);
      } else if (type === "delete_reply") {
        setToast(`Reply removed for review #${shortId(activeReview.id)}.`);
      }
    } catch (caught) {
      setIsSubmittingAction(false);
      setActionError(
        caught instanceof Error
          ? caught.message
          : "The requested action could not be completed. Please try again.",
      );
    }
  }

  function exportCsv() {
    const escape = (value: string | number | boolean | null | undefined) =>
      `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [
      [
        "id",
        "orderId",
        "buyerId",
        "buyerName",
        "storeId",
        "bagId",
        "bagName",
        "ratingScore",
        "comment",
        "storeReply",
        "repliedAt",
        "isReported",
        "createdAt",
      ],
      ...reviews.map((review) => [
        review.id,
        review.orderId,
        review.buyerId,
        review.buyerName,
        review.storeId,
        review.bagId,
        review.bagName ?? "",
        review.ratingScore,
        review.comment,
        review.storeReply,
        review.repliedAt,
        Boolean(review.isReported),
        review.createdAt,
      ]),
    ]
      .map((row) => row.map(escape).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "store-reviews.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {toast && <DashboardToast key={toast}>{toast}</DashboardToast>}

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {stats.map(([label, value, color]) => (
            <DashboardCard className={`${color} p-4`} key={label}>
              <p className="text-sm font-semibold text-light-secondary-text">{label}</p>
              <p className="mt-2 text-2xl font-bold">{value}</p>
            </DashboardCard>
          ))}
        </div>

        <DashboardCard className="w-full overflow-hidden">
          <div className="p-4 sm:p-6">
            <PageHeader
              action={<DashboardButton onClick={exportCsv}>Export CSV</DashboardButton>}
              title="Store Reviews"
            />
            <p className="mt-1 text-sm text-light-secondary-text">
              Manage buyer feedback for {settings.name} and keep public replies up to date.
            </p>

            <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="relative w-full lg:w-80">
                <span className="sr-only">Search store reviews</span>
                <input
                  className="h-9 w-full rounded-full border-none bg-gray-100 px-4 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Review, bag, order, buyer..."
                  type="search"
                  value={searchInput}
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <select
                  aria-label="Rating score"
                  className="h-9 rounded-full border-none bg-gray-100 px-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"
                  onChange={(event) => {
                    setRating(event.target.value);
                    setPage(1);
                  }}
                  value={rating}
                >
                  <option value="">All ratings</option>
                  {RATING_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item} / 5
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Reply status"
                  className="h-9 rounded-full border-none bg-gray-100 px-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"
                  onChange={(event) => {
                    setReplyStatus(event.target.value as ReplyFilter);
                    setPage(1);
                  }}
                  value={replyStatus}
                >
                  <option value="all">All replies</option>
                  <option value="unanswered">Needs reply</option>
                  <option value="replied">Replied</option>
                </select>
                <select
                  aria-label="Moderation status"
                  className="h-9 rounded-full border-none bg-gray-100 px-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"
                  onChange={(event) => {
                    setReportStatus(event.target.value as ReportFilter);
                    setPage(1);
                  }}
                  value={reportStatus}
                >
                  <option value="all">All moderation</option>
                  <option value="reported">Reported only</option>
                  <option value="not_reported">Not reported</option>
                </select>
                {(searchInput || rating || replyStatus !== "all" || reportStatus !== "all") && (
                  <button
                    className="h-9 rounded-full px-3 text-sm font-semibold text-primary hover:bg-primary-lighter"
                    onClick={clearFilters}
                    type="button"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {reviewsDemoReason && (
            <div
              className="flex flex-col gap-3 border-t border-warning/30 bg-warning/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6"
              role="status"
            >
              <p>
                <strong>Demo data active.</strong> {reviewsDemoReason}
              </p>
              <button
                className="h-8 shrink-0 rounded-full px-3 font-semibold text-warning-dark hover:bg-warning/15"
                onClick={retryReviews}
                type="button"
              >
                Retry API
              </button>
            </div>
          )}

          {reviewsLoading ? (
            <div
              className="border-t border-gray-500/20 px-4 py-14 text-center text-sm text-light-secondary-text"
              role="status"
            >
              Loading store reviews…
            </div>
          ) : (
            <div className="overflow-x-auto border-t border-gray-500/20">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-3 pl-5">Review</th>
                    <th className="p-3">Bag / order</th>
                    <th className="p-3">Buyer</th>
                    <th className="p-3">Reply</th>
                    <th className="p-3">Created</th>
                    <th className="p-3 pr-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => {
                    const product = productById.get(review.bagId);
                    const bagDisplayName = review.bagName || product?.name || "Unknown bag";
                    return (
                      <tr
                        className="border-t border-gray-500/20 hover:bg-gray-50/50"
                        key={review.id}
                      >
                        <td className="max-w-md p-3 pl-5">
                          <div className="flex items-start gap-3">
                            <span className="size-11 shrink-0 overflow-hidden rounded-xl">
                              <ProductImage alt={bagDisplayName} />
                            </span>
                            <div>
                              <RatingPips score={review.ratingScore} />
                              <p className="mt-1 text-light-secondary-text">
                                {review.comment || (
                                  <span className="italic">No comment provided</span>
                                )}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="font-mono text-xs text-light-secondary-text">
                                  #{shortId(review.id)}
                                </span>
                                {review.isReported && (
                                  <StatusBadge tone="error">Reported</StatusBadge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <strong className="block">{bagDisplayName}</strong>
                          <span className="font-mono text-xs text-light-secondary-text">
                            Order {shortId(review.orderId)}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-medium">
                            {review.buyerName || "Customer"}
                          </div>
                          <span className="font-mono text-xs text-light-secondary-text">
                            {shortId(review.buyerId)}...
                          </span>
                        </td>
                        <td className="max-w-56 p-3">
                          <StatusBadge tone={hasReply(review.storeReply) ? "success" : "warning"}>
                            {hasReply(review.storeReply) ? "Replied" : "Needs reply"}
                          </StatusBadge>
                          <span className="mt-1 block truncate text-xs text-light-secondary-text">
                            {review.storeReply ?? "No public reply yet"}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">{dateTime(review.createdAt)}</td>
                        <td className="p-3 pr-5 text-right">
                          <button
                            className="h-8 rounded-lg px-3 font-semibold text-primary hover:bg-primary-lighter"
                            onClick={() => openReview(review)}
                            type="button"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {reviews.length === 0 && (
                <div className="px-4 py-14 text-center text-sm text-light-secondary-text">
                  No store reviews match these filters.
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-gray-500/20 p-4 sm:px-6">
            <span className="text-sm text-light-secondary-text">
              {totalCount} {totalCount === 1 ? "review" : "reviews"}
            </span>
            <div className="flex items-center gap-2">
              <button
                aria-label="Previous page"
                className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40"
                disabled={page <= 1 || reviewsLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                type="button"
              >
                ‹
              </button>
              <span className="text-sm font-semibold">
                Page {page} of {totalPages}
              </span>
              <button
                aria-label="Next page"
                className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40"
                disabled={page >= totalPages || reviewsLoading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                type="button"
              >
                ›
              </button>
            </div>
          </div>
        </DashboardCard>
      </div>

      {activeReview && (
        <DashboardDialog
          onClose={() => {
            setActiveId(null);
            setReplyError("");
          }}
          title={`Review #${shortId(activeReview.id)}`}
        >
          <form onSubmit={saveReply}>
            <div className="space-y-5 p-5 text-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Customer feedback
                  </p>
                  <h2 className="mt-1 text-lg font-bold">
                    {activeReview.bagName || activeProduct?.name || "Surprise bag"}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone={ratingTone(activeReview.ratingScore)}>
                    {activeReview.ratingScore} / 5
                  </StatusBadge>
                  {activeReview.isReported && (
                    <StatusBadge tone="error">Reported</StatusBadge>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-gray-100 p-4">
                <RatingPips score={activeReview.ratingScore} />
                <p className="mt-3 leading-6 text-light-secondary-text">
                  {activeReview.comment || <span className="italic">No comment provided</span>}
                </p>
              </div>

              <dl className="grid gap-3 sm:grid-cols-[110px_1fr]">
                <dt className="text-light-secondary-text">Order ID</dt>
                <dd className="break-all font-mono text-xs">{activeReview.orderId}</dd>
                <dt className="text-light-secondary-text">Buyer</dt>
                <dd className="break-all text-xs font-medium">
                  {activeReview.buyerName}{" "}
                  <span className="font-mono text-light-secondary-text">
                    ({activeReview.buyerId})
                  </span>
                </dd>
                <dt className="text-light-secondary-text">Bag</dt>
                <dd className="break-all text-xs font-medium">
                  {activeReview.bagName || activeProduct?.name || "Unknown bag"}{" "}
                  <span className="font-mono text-light-secondary-text">
                    ({activeReview.bagId})
                  </span>
                </dd>
                <dt className="text-light-secondary-text">Moderation</dt>
                <dd>
                  {activeReview.isReported ? (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-error-dark">
                      <span className="size-2 rounded-full bg-error" />
                      Reported to platform moderators
                    </span>
                  ) : (
                    <span className="text-light-secondary-text">Normal (Not reported)</span>
                  )}
                </dd>
                <dt className="text-light-secondary-text">Delivery</dt>
                <dd>{activeOrder?.deliveryType ?? "Unknown"}</dd>
                <dt className="text-light-secondary-text">Created</dt>
                <dd>{dateTime(activeReview.createdAt)}</dd>
                {activeReview.repliedAt && (
                  <>
                    <dt className="text-light-secondary-text">Replied</dt>
                    <dd>{dateTime(activeReview.repliedAt)}</dd>
                  </>
                )}
              </dl>

              <label className="block text-sm font-semibold">
                Store reply
                <textarea
                  className="mt-2 w-full rounded-xl border-none bg-gray-100 p-3.5 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"
                  maxLength={2000}
                  onChange={(event) => {
                    setReplyDraft(event.target.value);
                    setReplyError("");
                  }}
                  placeholder="Write a public reply to this buyer..."
                  rows={5}
                  value={replyDraft}
                />
              </label>
              <div className="flex justify-between gap-3 text-xs text-light-secondary-text">
                <span>Backend field: StoreReply, up to 2000 characters.</span>
                <span>{replyDraft.length} / 2000</span>
              </div>
              {replyError && (
                <div
                  className="rounded-xl bg-error-alpha-16 px-4 py-3 text-sm text-error-dark"
                  role="alert"
                >
                  {replyError}
                </div>
              )}

              {inlineAction && (
                <div
                  className={
                    inlineAction === "unreport"
                      ? "rounded-2xl border border-primary/25 bg-primary-lighter/40 p-4 sm:p-5"
                      : "rounded-2xl border border-error/25 bg-error-alpha-16/40 p-4 sm:p-5"
                  }
                >
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className={
                        inlineAction === "unreport"
                          ? "flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
                          : "flex size-8 shrink-0 items-center justify-center rounded-full bg-error text-xs font-bold text-white"
                      }
                    >
                      {inlineAction === "unreport" ? "✓" : "!"}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-light-primary-text">
                        {inlineAction === "report"
                          ? `Report review #${shortId(activeReview.id)} to moderators?`
                          : inlineAction === "unreport"
                            ? `Dismiss moderation report for review #${shortId(activeReview.id)}?`
                            : "Remove public store reply?"}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-light-secondary-text">
                        {inlineAction === "report" &&
                          "This flags this review to platform administrators for moderation inspection (e.g. policy violations, offensive language, spam, or false claims). The review will remain marked as reported until resolved."}
                        {inlineAction === "unreport" &&
                          "This will clear the reported status from this review and dismiss it from the administrator moderation queue."}
                        {inlineAction === "delete_reply" &&
                          "Are you sure you want to remove your public store reply? The customer and other shoppers will no longer see your response."}
                      </p>

                      {inlineAction === "report" && (
                        <div className="mt-3 rounded-xl bg-white/90 p-3 text-xs text-light-secondary-text shadow-xs">
                          <strong className="block font-medium text-light-primary-text">
                            Review from {activeReview.buyerName}:
                          </strong>
                          &ldquo;{activeReview.comment || "No comment provided"}&rdquo;
                        </div>
                      )}

                      {actionError && (
                        <div
                          className="mt-3 rounded-xl bg-white p-3 text-xs font-semibold text-error-dark shadow-xs"
                          role="alert"
                        >
                          {actionError}
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap justify-end gap-2.5">
                        <button
                          className="h-8.5 rounded-full px-4 text-xs font-semibold ring ring-gray-500/20 hover:bg-white disabled:opacity-50"
                          disabled={isSubmittingAction}
                          onClick={() => {
                            setInlineAction(null);
                            setActionError("");
                          }}
                          type="button"
                        >
                          Cancel
                        </button>
                        <button
                          className={
                            inlineAction === "unreport"
                              ? "h-8.5 rounded-full bg-primary px-4 text-xs font-bold text-white hover:bg-primary-dark disabled:opacity-60"
                              : "h-8.5 rounded-full bg-error px-4 text-xs font-bold text-white hover:opacity-90 disabled:opacity-60"
                          }
                          disabled={isSubmittingAction}
                          onClick={() => handleExecuteAction(inlineAction)}
                          type="button"
                        >
                          {isSubmittingAction
                            ? "Processing…"
                            : inlineAction === "report"
                              ? "Confirm report"
                              : inlineAction === "unreport"
                                ? "Confirm dismissal"
                                : "Remove reply"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <footer className="flex flex-wrap justify-end gap-3 border-t border-gray-500/20 px-5 py-4 sm:px-6">
              <DashboardButton
                disabled={isSubmittingAction || isSubmittingReply}
                onClick={() => {
                  setActiveId(null);
                  setReplyError("");
                  setInlineAction(null);
                  setActionError("");
                }}
                variant="secondary"
              >
                Close
              </DashboardButton>
              {hasReply(activeReview.storeReply) && (
                <button
                  className="h-9 rounded-full border border-error/30 bg-error-alpha-16 px-4 text-sm font-semibold text-error-dark hover:bg-error/25 disabled:opacity-50"
                  disabled={inlineAction !== null || isSubmittingAction || isSubmittingReply}
                  onClick={() => {
                    setActionError("");
                    setInlineAction("delete_reply");
                  }}
                  type="button"
                >
                  Remove reply
                </button>
              )}
              {activeReview.isReported ? (
                <button
                  className="h-9 rounded-full border border-primary/30 bg-primary-lighter px-4 text-sm font-semibold text-primary hover:bg-primary/20 disabled:opacity-50"
                  disabled={inlineAction !== null || isSubmittingAction || isSubmittingReply}
                  onClick={() => {
                    setActionError("");
                    setInlineAction("unreport");
                  }}
                  type="button"
                >
                  Dismiss report
                </button>
              ) : (
                <button
                  className="h-9 rounded-full border border-warning/40 bg-warning/15 px-4 text-sm font-semibold text-warning-dark hover:bg-warning/25 disabled:opacity-50"
                  disabled={inlineAction !== null || isSubmittingAction || isSubmittingReply}
                  onClick={() => {
                    setActionError("");
                    setInlineAction("report");
                  }}
                  type="button"
                >
                  Report review
                </button>
              )}
              <DashboardButton
                disabled={inlineAction !== null || isSubmittingAction || isSubmittingReply}
                type="submit"
              >
                {isSubmittingReply ? "Saving…" : "Save reply"}
              </DashboardButton>
            </footer>
          </form>
        </DashboardDialog>
      )}
    </>
  );
}
