"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  DashboardButton,
  DashboardCard,
  PageHeader,
  ProductImage,
  StatusBadge,
} from "@/components/dashboard/ui";
import { DashboardDialog, DashboardToast } from "@/components/dashboard/Dialog";
import { useSellerDemo } from "@/components/seller/SellerDemoProvider";
import type { StoreReviewResponse } from "@/lib/api/dashboard-types";

const PAGE_SIZE = 5;
const STORE_ID = "20000000-0000-0000-0000-000000000001";
const RATING_OPTIONS = [5, 4, 3, 2, 1] as const;

const INITIAL_REVIEWS: StoreReviewResponse[] = [
  {
    id: "80000000-0000-0000-0000-000000000001",
    orderId: "40000000-0000-0000-0000-000000000001",
    buyerId: "50000000-0000-0000-0000-000000000001",
    storeId: STORE_ID,
    bagId: "30000000-0000-0000-0000-000000000101",
    ratingScore: 5,
    comment: "Great value and the pastries were still fresh at pickup.",
    storeReply: "Thank you for rescuing our bakery bag. We are happy you enjoyed it.",
    isReported: false,
    createdAt: "2026-07-31T08:25:00+07:00",
  },
  {
    id: "80000000-0000-0000-0000-000000000002",
    orderId: "40000000-0000-0000-0000-000000000002",
    buyerId: "50000000-0000-0000-0000-000000000002",
    storeId: STORE_ID,
    bagId: "30000000-0000-0000-0000-000000000102",
    ratingScore: 4,
    comment: "Good lunch set. Pickup was quick, but I wish the bag had one more side dish.",
    storeReply: null,
    isReported: false,
    createdAt: "2026-07-31T07:40:00+07:00",
  },
  {
    id: "80000000-0000-0000-0000-000000000003",
    orderId: "40000000-0000-0000-0000-000000000005",
    buyerId: "50000000-0000-0000-0000-000000000005",
    storeId: STORE_ID,
    bagId: "30000000-0000-0000-0000-000000000103",
    ratingScore: 2,
    comment: "Some fruit was bruised and the pickup counter was hard to find.",
    storeReply: null,
    isReported: true,
    createdAt: "2026-07-30T20:10:00+07:00",
  },
  {
    id: "80000000-0000-0000-0000-000000000004",
    orderId: "40000000-0000-0000-0000-000000000003",
    buyerId: "50000000-0000-0000-0000-000000000003",
    storeId: STORE_ID,
    bagId: "30000000-0000-0000-0000-000000000105",
    ratingScore: 3,
    comment: "The essentials were useful, though one chilled item was close to expiry.",
    storeReply: "Thanks for the note. We will double-check chilled bags before handoff.",
    isReported: false,
    createdAt: "2026-07-30T18:35:00+07:00",
  },
  {
    id: "80000000-0000-0000-0000-000000000005",
    orderId: "40000000-0000-0000-0000-000000000004",
    buyerId: "50000000-0000-0000-0000-000000000004",
    storeId: STORE_ID,
    bagId: "30000000-0000-0000-0000-000000000101",
    ratingScore: 1,
    comment: "Order failed before pickup and I could not reserve the bag.",
    storeReply: null,
    isReported: false,
    createdAt: "2026-07-30T16:30:00+07:00",
  },
  {
    id: "80000000-0000-0000-0000-000000000006",
    orderId: "40000000-0000-0000-0000-000000000002",
    buyerId: "50000000-0000-0000-0000-000000000002",
    storeId: STORE_ID,
    bagId: "30000000-0000-0000-0000-000000000102",
    ratingScore: 5,
    comment: "Friendly staff and the pickup code worked without any delay.",
    storeReply: "We appreciate the feedback and hope to see you again.",
    isReported: false,
    createdAt: "2026-07-29T15:15:00+07:00",
  },
  {
    id: "80000000-0000-0000-0000-000000000007",
    orderId: "40000000-0000-0000-0000-000000000001",
    buyerId: "50000000-0000-0000-0000-000000000001",
    storeId: STORE_ID,
    bagId: "30000000-0000-0000-0000-000000000104",
    ratingScore: 4,
    comment: "Dessert box looked nice and was packed carefully.",
    storeReply: null,
    isReported: false,
    createdAt: "2026-07-29T13:00:00+07:00",
  },
];

type ReplyFilter = "all" | "unanswered" | "replied";
type ReportFilter = "all" | "reported" | "clean";
type StatusTone = "neutral" | "info" | "success" | "warning" | "error";

const shortId = (value: string) => value.slice(0, 8);
const hasReply = (value: string | null) => Boolean(value?.trim());
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
  const { orders, products, settings } = useSellerDemo();
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("");
  const [replyStatus, setReplyStatus] = useState<ReplyFilter>("all");
  const [reportStatus, setReportStatus] = useState<ReportFilter>("all");
  const [page, setPage] = useState(1);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [replyError, setReplyError] = useState("");
  const [toast, setToast] = useState("");

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const orderById = useMemo(
    () => new Map(orders.map((order) => [order.id, order])),
    [orders],
  );

  const filtered = useMemo(
    () =>
      reviews.filter((review) => {
        const product = productById.get(review.bagId);
        const order = orderById.get(review.orderId);
        const query = search.trim().toLowerCase();
        const searchable = [
          review.id,
          review.orderId,
          review.buyerId,
          review.bagId,
          review.comment,
          review.storeReply ?? "",
          product?.name ?? "",
          order?.storeNameSnapshot ?? "",
        ]
          .join(" ")
          .toLowerCase();

        return (
          (!query || searchable.includes(query)) &&
          (!rating || review.ratingScore === Number(rating)) &&
          (replyStatus === "all" ||
            (replyStatus === "replied" && hasReply(review.storeReply)) ||
            (replyStatus === "unanswered" && !hasReply(review.storeReply))) &&
          (reportStatus === "all" ||
            (reportStatus === "reported" && review.isReported) ||
            (reportStatus === "clean" && !review.isReported))
        );
      }),
    [orderById, productById, rating, replyStatus, reportStatus, reviews, search],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const averageRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + review.ratingScore, 0) / reviews.length).toFixed(1)
    : "0.0";
  const stats = [
    ["Total reviews", reviews.length, "bg-accent-5/60"],
    ["Average rating", `${averageRating} / 5`, "bg-accent-1/60"],
    ["Need replies", reviews.filter((review) => !hasReply(review.storeReply)).length, "bg-accent-2/60"],
    ["Reported", reviews.filter((review) => review.isReported).length, "bg-accent-3/60"],
  ] as const;
  const activeReview = activeId
    ? reviews.find((review) => review.id === activeId) ?? null
    : null;
  const activeProduct = activeReview ? productById.get(activeReview.bagId) : undefined;
  const activeOrder = activeReview ? orderById.get(activeReview.orderId) : undefined;

  function clearFilters() {
    setSearch("");
    setRating("");
    setReplyStatus("all");
    setReportStatus("all");
    setPage(1);
  }

  function openReview(review: StoreReviewResponse) {
    setActiveId(review.id);
    setReplyDraft(review.storeReply ?? "");
    setReplyError("");
  }

  function saveReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeReview) return;

    const nextReply = replyDraft.trim();
    if (!nextReply) {
      setReplyError("Write a store reply before saving.");
      return;
    }

    setReviews((items) =>
      items.map((item) =>
        item.id === activeReview.id ? { ...item, storeReply: nextReply } : item,
      ),
    );
    setReplyError("");
    setActiveId(null);
    setPage(1);
    setToast(`Reply saved for review #${shortId(activeReview.id)}.`);
  }

  function deleteReply(review: StoreReviewResponse) {
    setReviews((items) =>
      items.map((item) => (item.id === review.id ? { ...item, storeReply: null } : item)),
    );
    setReplyDraft("");
    setReplyError("");
    setPage(1);
    setToast(`Reply removed from review #${shortId(review.id)}.`);
  }

  function toggleReported(review: StoreReviewResponse) {
    const nextValue = !review.isReported;
    setReviews((items) =>
      items.map((item) =>
        item.id === review.id ? { ...item, isReported: nextValue } : item,
      ),
    );
    setPage(1);
    setToast(
      `Review #${shortId(review.id)} marked ${nextValue ? "reported" : "not reported"}.`,
    );
  }

  function exportCsv() {
    const escape = (value: string | number | boolean | null) =>
      `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [
      [
        "id",
        "orderId",
        "buyerId",
        "storeId",
        "bagId",
        "ratingScore",
        "comment",
        "storeReply",
        "isReported",
        "createdAt",
      ],
      ...filtered.map((review) => [
        review.id,
        review.orderId,
        review.buyerId,
        review.storeId,
        review.bagId,
        review.ratingScore,
        review.comment,
        review.storeReply,
        review.isReported,
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
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Review, bag, order, buyer..."
                  type="search"
                  value={search}
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
                  aria-label="Report status"
                  className="h-9 rounded-full border-none bg-gray-100 px-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"
                  onChange={(event) => {
                    setReportStatus(event.target.value as ReportFilter);
                    setPage(1);
                  }}
                  value={reportStatus}
                >
                  <option value="all">All reports</option>
                  <option value="reported">Reported</option>
                  <option value="clean">Not reported</option>
                </select>
                {(search || rating || replyStatus !== "all" || reportStatus !== "all") && (
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

          <div className="overflow-x-auto border-t border-gray-500/20">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3 pl-5">Review</th>
                  <th className="p-3">Bag / order</th>
                  <th className="p-3">Buyer</th>
                  <th className="p-3">Reply</th>
                  <th className="p-3">Report</th>
                  <th className="p-3">Created</th>
                  <th className="p-3 pr-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((review) => {
                  const product = productById.get(review.bagId);
                  return (
                    <tr
                      className="border-t border-gray-500/20 hover:bg-gray-50/50"
                      key={review.id}
                    >
                      <td className="max-w-md p-3 pl-5">
                        <div className="flex items-start gap-3">
                          <span className="size-11 shrink-0 overflow-hidden rounded-xl">
                            <ProductImage alt={product?.name ?? "Reviewed bag"} />
                          </span>
                          <div>
                            <RatingPips score={review.ratingScore} />
                            <p className="mt-1 text-light-secondary-text">{review.comment}</p>
                            <span className="mt-1 block font-mono text-xs text-light-secondary-text">
                              #{shortId(review.id)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <strong className="block">{product?.name ?? "Unknown bag"}</strong>
                        <span className="font-mono text-xs text-light-secondary-text">
                          Order {shortId(review.orderId)}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-xs">{shortId(review.buyerId)}...</td>
                      <td className="max-w-56 p-3">
                        <StatusBadge tone={hasReply(review.storeReply) ? "success" : "warning"}>
                          {hasReply(review.storeReply) ? "Replied" : "Needs reply"}
                        </StatusBadge>
                        <span className="mt-1 block truncate text-xs text-light-secondary-text">
                          {review.storeReply ?? "No public reply yet"}
                        </span>
                      </td>
                      <td className="p-3">
                        <StatusBadge tone={review.isReported ? "error" : "neutral"}>
                          {review.isReported ? "Reported" : "Clear"}
                        </StatusBadge>
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
            {rows.length === 0 && (
              <div className="px-4 py-14 text-center text-sm text-light-secondary-text">
                No store reviews match these filters.
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-gray-500/20 p-4 sm:px-6">
            <span className="text-sm text-light-secondary-text">
              {filtered.length} reviews
            </span>
            <div className="flex items-center gap-2">
              <button
                aria-label="Previous page"
                className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                type="button"
              >
                {"<"}
              </button>
              <span className="text-sm font-semibold">
                Page {page} of {totalPages}
              </span>
              <button
                aria-label="Next page"
                className="size-8 rounded-full hover:bg-gray-100 disabled:opacity-40"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                type="button"
              >
                {">"}
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
                    {activeProduct?.name ?? "Unknown surplus bag"}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone={ratingTone(activeReview.ratingScore)}>
                    {activeReview.ratingScore} / 5
                  </StatusBadge>
                  <StatusBadge tone={activeReview.isReported ? "error" : "neutral"}>
                    {activeReview.isReported ? "Reported" : "Clear"}
                  </StatusBadge>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-100 p-4">
                <RatingPips score={activeReview.ratingScore} />
                <p className="mt-3 leading-6 text-light-secondary-text">
                  {activeReview.comment}
                </p>
              </div>

              <dl className="grid gap-3 sm:grid-cols-[110px_1fr]">
                <dt className="text-light-secondary-text">Order ID</dt>
                <dd className="break-all font-mono text-xs">{activeReview.orderId}</dd>
                <dt className="text-light-secondary-text">Buyer ID</dt>
                <dd className="break-all font-mono text-xs">{activeReview.buyerId}</dd>
                <dt className="text-light-secondary-text">Bag ID</dt>
                <dd className="break-all font-mono text-xs">{activeReview.bagId}</dd>
                <dt className="text-light-secondary-text">Delivery</dt>
                <dd>{activeOrder?.deliveryType ?? "Unknown"}</dd>
                <dt className="text-light-secondary-text">Created</dt>
                <dd>{dateTime(activeReview.createdAt)}</dd>
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
            </div>

            <footer className="flex flex-wrap justify-end gap-3 border-t border-gray-500/20 px-5 py-4 sm:px-6">
              <DashboardButton
                onClick={() => {
                  setActiveId(null);
                  setReplyError("");
                }}
                variant="secondary"
              >
                Close
              </DashboardButton>
              {hasReply(activeReview.storeReply) && (
                <DashboardButton
                  onClick={() => deleteReply(activeReview)}
                  variant="secondary"
                >
                  Remove reply
                </DashboardButton>
              )}
              <DashboardButton
                onClick={() => toggleReported(activeReview)}
                variant={activeReview.isReported ? "secondary" : "danger"}
              >
                {activeReview.isReported ? "Clear report" : "Report review"}
              </DashboardButton>
              <DashboardButton type="submit">Save reply</DashboardButton>
            </footer>
          </form>
        </DashboardDialog>
      )}
    </>
  );
}
