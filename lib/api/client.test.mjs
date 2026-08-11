import assert from "node:assert/strict";
import { apiRequest } from "./client.ts";

const originalFetch = globalThis.fetch;
let request;

try {
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify({ id: "bag-1" }), {
      status: 201,
      headers: { "content-type": "application/json" },
    });
  };

  await apiRequest(
    "/api/bags",
    { method: "POST", body: { name: "Rescue bag" } },
    "http://store.test",
  );

  assert.equal(request.url, "http://store.test/api/bags");
  assert.equal(request.options.body, JSON.stringify({ name: "Rescue bag" }));
  assert.equal(new Headers(request.options.headers).get("Content-Type"), "application/json");
} finally {
  globalThis.fetch = originalFetch;
}
