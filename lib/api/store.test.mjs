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
const { listPendingStores, verifyStore } = await import("./store.ts");

const originalFetch = globalThis.fetch;
const requests = [];

try {
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return new Response(options.method === "GET" ? "[]" : null, {
      status: options.method === "GET" ? 200 : 204,
      headers: options.method === "GET" ? { "content-type": "application/json" } : undefined,
    });
  };

  await listPendingStores("admin-token");
  await verifyStore("admin-token", "store/id");

  assert.equal(requests[0].url, "http://store.test/api/stores/pending");
  assert.equal(requests[0].options.method, "GET");
  assert.equal(new Headers(requests[0].options.headers).get("Authorization"), "Bearer admin-token");
  assert.equal(requests[1].url, "http://store.test/api/stores/store%2Fid/verify");
  assert.equal(requests[1].options.method, "PATCH");
} finally {
  globalThis.fetch = originalFetch;
}
