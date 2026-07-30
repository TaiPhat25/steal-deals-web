import assert from "node:assert/strict";
import {
  createDemoAdminUser,
  deleteDemoAdminUser,
  listDemoAdminUsers,
  updateDemoAdminUser,
} from "./admin-demo.ts";

const sellers = listDemoAdminUsers(new URLSearchParams({ role: "Seller", page: "1", pageSize: "10" }));
assert(sellers.items.length > 0);
assert(sellers.items.every((user) => user.roles.includes("Seller")));

const created = createDemoAdminUser({
  email: "fallback@example.com",
  password: "password",
  fullName: "Fallback User",
  roles: ["Customer"],
});
updateDemoAdminUser(created.id, { isActive: false, roles: ["Seller"] });
const inactiveSeller = listDemoAdminUsers(new URLSearchParams({ role: "Seller", accountStatus: "inactive" }));
assert(inactiveSeller.items.some((user) => user.id === created.id));
deleteDemoAdminUser(created.id);
assert.equal(listDemoAdminUsers(new URLSearchParams({ searchTerm: "fallback@example.com" })).totalCount, 0);
