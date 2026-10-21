import assert from "node:assert/strict";

const originalServerApiBaseUrl = process.env.SERVER_API_BASE_URL;
const originalPublicApiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
process.env.SERVER_API_BASE_URL = "http://nginx.test";
delete process.env.NEXT_PUBLIC_API_URL;

const { apiRequest } = await import("./client.ts");

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
    "/api/store/bags",
    { method: "POST", body: { name: "Rescue bag" } },
    "http://store.test",
  );

  assert.equal(request.url, "http://store.test/api/store/bags");
  assert.equal(request.options.body, JSON.stringify({ name: "Rescue bag" }));
  assert.equal(new Headers(request.options.headers).get("Content-Type"), "application/json");

  await apiRequest(
    "/api/order/orders/order%2F1/status",
    {
      method: "PATCH",
      headers: { Authorization: "Bearer seller-token" },
      body: { status: "Confirmed" },
    },
    "http://order.test",
  );

  assert.equal(request.url, "http://order.test/api/order/orders/order%2F1/status");
  assert.equal(request.options.method, "PATCH");
  assert.equal(new Headers(request.options.headers).get("Authorization"), "Bearer seller-token");
  assert.equal(request.options.body, JSON.stringify({ status: "Confirmed" }));

  const formData = new FormData();
  formData.append("name", "Bag with Image");
  await apiRequest(
    "/api/store/bags",
    {
      method: "POST",
      headers: { Authorization: "Bearer seller-token" },
      body: formData,
    },
    "http://store.test",
  );

  assert.equal(request.url, "http://store.test/api/store/bags");
  assert.equal(request.options.method, "POST");
  assert.equal(new Headers(request.options.headers).get("Authorization"), "Bearer seller-token");
  assert.equal(new Headers(request.options.headers).get("Content-Type"), null);
  assert.equal(request.options.body, formData);

  await apiRequest("/api/store/bags", { method: "GET" });

  assert.equal(request.url, "http://nginx.test/api/store/bags");
} finally {
  globalThis.fetch = originalFetch;
  if (originalServerApiBaseUrl === undefined) {
    delete process.env.SERVER_API_BASE_URL;
  } else {
    process.env.SERVER_API_BASE_URL = originalServerApiBaseUrl;
  }
  if (originalPublicApiBaseUrl === undefined) {
    delete process.env.NEXT_PUBLIC_API_URL;
  } else {
    process.env.NEXT_PUBLIC_API_URL = originalPublicApiBaseUrl;
  }
}
