import assert from "node:assert/strict";
import { oldestOrdersFirst, unitsExpiringToday } from "./seller-dashboard.ts";

const today = new Date(2026, 7, 7, 12);
assert.equal(unitsExpiringToday([
  { expiryDate: new Date(2026, 7, 7, 18).toISOString(), quantityRemaining: 3 },
  { expiryDate: new Date(2026, 7, 8, 18).toISOString(), quantityRemaining: 9 },
], today), 3);

assert.deepEqual(
  oldestOrdersFirst([
    { id: "later", createdAt: "2026-08-07T10:00:00Z" },
    { id: "first", createdAt: "2026-08-07T09:00:00Z" },
  ]).map((order) => order.id),
  ["first", "later"],
);
