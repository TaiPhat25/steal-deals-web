import assert from "node:assert/strict";
import { registerHooks } from "node:module";

process.env.NEXT_PUBLIC_STORE_API_URL = "http://store.test";
registerHooks({
  resolve(specifier, context, nextResolve) {
    return specifier === "@/lib/api/client"
      ? { shortCircuit: true, url: new URL("./client.ts", import.meta.url).href }
      : nextResolve(specifier, context);
  },
});
const {
  deleteReview,
  deleteReviewReply,
  listMyStoreReviews,
  listPendingStores,
  listReportedReviews,
  listStoreBags,
  rejectPendingStore,
  replyToStoreReview,
  reportReview,
  unreportReview,
  verifyStore,
} = await import("./store.ts");

const originalFetch = globalThis.fetch;
const requests = [];

try {
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    if (url.endsWith("/api/bags/store/store%2Fid")) {
      return Response.json([{ id: "bag/id", categories: [] }]);
    }
    if (url.endsWith("/api/bags/bag%2Fid")) {
      return Response.json({ id: "bag/id", categories: [{ id: "category/id", name: "Bakery" }] });
    }
    if (url.includes("/api/reviews/store/me")) {
      return Response.json({ items: [], page: 1, pageSize: 10, totalCount: 0, totalPages: 0 });
    }
    return new Response(options.method === "GET" ? "[]" : null, {
      status: options.method === "GET" ? 200 : 204,
      headers: options.method === "GET" ? { "content-type": "application/json" } : undefined,
    });
  };

  await listPendingStores("admin-token");
  await verifyStore("admin-token", "store/id");
  await rejectPendingStore("admin-token", "store/id");
  const bags = await listStoreBags("store/id");

  assert.equal(requests[0].url, "http://store.test/api/stores/pending");
  assert.equal(requests[0].options.method, "GET");
  assert.equal(new Headers(requests[0].options.headers).get("Authorization"), "Bearer admin-token");
  assert.equal(requests[1].url, "http://store.test/api/stores/store%2Fid/verify");
  assert.equal(requests[1].options.method, "PATCH");
  assert.equal(requests[2].url, "http://store.test/api/stores/store%2Fid/reject");
  assert.equal(requests[2].options.method, "DELETE");
  assert.equal(new Headers(requests[2].options.headers).get("Authorization"), "Bearer admin-token");
  assert.equal(requests[3].url, "http://store.test/api/bags/store/store%2Fid");
  assert.equal(requests[4].url, "http://store.test/api/bags/bag%2Fid");
  assert.equal(bags[0].categories[0].name, "Bakery");

  await listMyStoreReviews("seller-token", {
    page: 2,
    pageSize: 10,
    ratingScore: 5,
    hasReply: false,
    search: "bread",
    isReported: true,
  });
  const reviewListReq = requests[5];
  assert.equal(
    reviewListReq.url,
    "http://store.test/api/reviews/store/me?page=2&pageSize=10&ratingScore=5&hasReply=false&search=bread&isReported=true",
  );
  assert.equal(reviewListReq.options.method, "GET");
  assert.equal(new Headers(reviewListReq.options.headers).get("Authorization"), "Bearer seller-token");

  await replyToStoreReview("seller-token", "review/1", "Thanks!");
  const replyReq = requests[6];
  assert.equal(replyReq.url, "http://store.test/api/reviews/review%2F1/reply");
  assert.equal(replyReq.options.method, "PATCH");
  assert.equal(new Headers(replyReq.options.headers).get("Authorization"), "Bearer seller-token");
  assert.deepEqual(JSON.parse(replyReq.options.body), { storeReply: "Thanks!" });

  await deleteReviewReply("seller-token", "review/1");
  const delReplyReq = requests[7];
  assert.equal(delReplyReq.url, "http://store.test/api/reviews/review%2F1/reply");
  assert.equal(delReplyReq.options.method, "DELETE");
  assert.equal(new Headers(delReplyReq.options.headers).get("Authorization"), "Bearer seller-token");

  await reportReview("user-token", "review/1");
  const reportReq = requests[8];
  assert.equal(reportReq.url, "http://store.test/api/reviews/review%2F1/report");
  assert.equal(reportReq.options.method, "PATCH");
  assert.equal(new Headers(reportReq.options.headers).get("Authorization"), "Bearer user-token");

  await unreportReview("seller-token", "review/1");
  const unreportReq = requests[9];
  assert.equal(unreportReq.url, "http://store.test/api/reviews/review%2F1/report");
  assert.equal(unreportReq.options.method, "DELETE");
  assert.equal(new Headers(unreportReq.options.headers).get("Authorization"), "Bearer seller-token");

  await listReportedReviews("admin-token", 1, 20);
  const reportedReq = requests[10];
  assert.equal(reportedReq.url, "http://store.test/api/reviews/reported?page=1&pageSize=20");
  assert.equal(reportedReq.options.method, "GET");
  assert.equal(new Headers(reportedReq.options.headers).get("Authorization"), "Bearer admin-token");

  await deleteReview("admin-token", "review/1");
  const deleteReq = requests[11];
  assert.equal(deleteReq.url, "http://store.test/api/reviews/review%2F1");
  assert.equal(deleteReq.options.method, "DELETE");
  assert.equal(new Headers(deleteReq.options.headers).get("Authorization"), "Bearer admin-token");
} finally {
  globalThis.fetch = originalFetch;
}
