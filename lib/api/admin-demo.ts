import type {
  AdminCreateUserRequest,
  AdminRole,
  AdminUpdateUserRequest,
  PagedResult,
  UserDetail,
} from "@/lib/api/admin-types";

export const DEMO_CURRENT_ADMIN_ID = "90000000-0000-0000-0000-000000000001";

const PEOPLE: Array<{
  name: string;
  email: string;
  phone: string | null;
  roles: AdminRole[];
  active: boolean;
  verified: boolean;
}> = [
  { name: "Demo Administrator", email: "admin@stealdeals.demo", phone: "+84 901 100 001", roles: ["Admin"], active: true, verified: true },
  { name: "Linh Nguyen", email: "linh.nguyen@example.com", phone: "+84 901 100 002", roles: ["Customer"], active: true, verified: true },
  { name: "Daniel Lee", email: "daniel.lee@example.com", phone: "+84 901 100 003", roles: ["Customer", "Seller"], active: true, verified: true },
  { name: "Mai Tran", email: "mai.tran@example.com", phone: null, roles: ["Customer"], active: true, verified: false },
  { name: "An Pham", email: "an.pham@example.com", phone: "+84 901 100 005", roles: ["Seller"], active: false, verified: true },
  { name: "Huy Le", email: "huy.le@example.com", phone: "+84 901 100 006", roles: ["Customer"], active: true, verified: true },
  { name: "Nora Garcia", email: "nora.garcia@example.com", phone: null, roles: ["Customer", "Seller"], active: true, verified: true },
  { name: "Emily Chen", email: "emily.chen@example.com", phone: "+84 901 100 008", roles: ["Seller"], active: true, verified: false },
  { name: "Ali Rahman", email: "ali.rahman@example.com", phone: "+84 901 100 009", roles: ["Customer"], active: false, verified: true },
  { name: "Sarah Smith", email: "sarah.smith@example.com", phone: null, roles: ["Customer"], active: true, verified: true },
  { name: "David Williams", email: "david.williams@example.com", phone: "+84 901 100 011", roles: ["Customer", "Seller"], active: true, verified: true },
  { name: "Mina Patel", email: "mina.patel@example.com", phone: "+84 901 100 012", roles: ["Admin"], active: true, verified: true },
];

let users: UserDetail[] = PEOPLE.map((person, index) => {
  const suffix = String(index + 1).padStart(12, "0");
  const isCustomer = person.roles.includes("Customer");
  return {
    id: `90000000-0000-0000-0000-${suffix}`,
    email: person.email,
    phone: person.phone,
    fullName: person.name,
    avatarUrl: null,
    isEmailVerified: person.verified,
    isActive: person.active,
    createdAt: `2026-${String(index % 6 + 1).padStart(2, "0")}-12T08:30:00Z`,
    roles: person.roles,
    userAddresses: isCustomer ? [{
      id: `91000000-0000-0000-0000-${suffix}`,
      label: "Home",
      address: `${18 + index} Nguyen Hue`,
      district: "District 1",
      city: "Ho Chi Minh City",
      isDefault: true,
    }] : [],
    userTrustScore: isCustomer ? {
      id: `92000000-0000-0000-0000-${suffix}`,
      score: 80 + index,
      totalOrders: 3 + index,
      successfulPickups: 3 + index,
      noShowCount: 0,
      disputeCount: index % 5 === 0 ? 1 : 0,
      lastCalculatedAt: "2026-07-30T08:30:00Z",
    } : null,
  };
});

export function isApiUnavailable(error: unknown) {
  return error instanceof TypeError;
}

export function listDemoAdminUsers(searchParams: URLSearchParams): PagedResult<UserDetail> {
  const search = searchParams.get("searchTerm")?.trim().toLowerCase() ?? "";
  const role = searchParams.get("role");
  const accountStatus = searchParams.get("accountStatus");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.max(1, Number(searchParams.get("pageSize")) || 10);
  const filtered = users.filter((user) =>
    (!search || `${user.fullName} ${user.email} ${user.phone ?? ""}`.toLowerCase().includes(search))
    && (!role || user.roles.includes(role))
    && (!accountStatus || user.isActive === (accountStatus === "active")),
  );
  const totalPages = Math.ceil(filtered.length / pageSize);
  return {
    items: structuredClone(filtered.slice((page - 1) * pageSize, page * pageSize)),
    page,
    pageSize,
    totalCount: filtered.length,
    totalPages,
  };
}

export function getDemoAdminUser(id: string) {
  const user = users.find((item) => item.id === id);
  if (!user) throw new Error("This demo user no longer exists.");
  return structuredClone(user);
}

export function createDemoAdminUser(request: AdminCreateUserRequest) {
  if (users.some((user) => user.email.toLowerCase() === request.email.toLowerCase())) {
    throw new Error("A user with this email already exists.");
  }
  const user: UserDetail = {
    id: crypto.randomUUID(),
    email: request.email,
    phone: request.phone ?? null,
    fullName: request.fullName,
    avatarUrl: null,
    isEmailVerified: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    roles: request.roles,
    userAddresses: [],
    userTrustScore: null,
  };
  users = [user, ...users];
  return structuredClone(user);
}

export function updateDemoAdminUser(id: string, request: AdminUpdateUserRequest) {
  const index = users.findIndex((user) => user.id === id);
  if (index < 0) throw new Error("This demo user no longer exists.");
  if (request.email && users.some((user) => user.id !== id && user.email.toLowerCase() === request.email?.toLowerCase())) {
    throw new Error("A user with this email already exists.");
  }
  users[index] = {
    ...users[index],
    ...(request.fullName !== undefined && request.fullName !== null ? { fullName: request.fullName } : {}),
    ...(request.email !== undefined && request.email !== null ? { email: request.email } : {}),
    ...(request.phone !== undefined ? { phone: request.phone } : {}),
    ...(request.isActive !== undefined && request.isActive !== null ? { isActive: request.isActive } : {}),
    ...(request.roles ? { roles: request.roles } : {}),
  };
  return structuredClone(users[index]);
}

export function deleteDemoAdminUser(id: string) {
  if (id === DEMO_CURRENT_ADMIN_ID) throw new Error("You cannot delete the current demo administrator.");
  users = users.filter((user) => user.id !== id);
}
