export type AdminRole = "Customer" | "Seller" | "Admin";

export type CurrentAdmin = {
  userId: string;
  email: string;
  name: string;
  roles: string[];
};

export type UserAddress = {
  id: string;
  label: string;
  address: string;
  district: string;
  city: string;
  isDefault: boolean;
};

export type UserTrustScore = {
  id: string;
  score: number;
  totalOrders: number;
  successfulPickups: number;
  noShowCount: number;
  disputeCount: number;
  lastCalculatedAt: string | null;
};

export type UserSummary = {
  id: string;
  email: string;
  phone: string | null;
  fullName: string;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  userTrustScore: UserTrustScore | null;
  roles: string[];
};

export type UserDetail = UserSummary & {
  userAddresses: UserAddress[];
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type AdminUserQuery = {
  searchTerm?: string;
  role?: AdminRole;
  accountStatus?: "active" | "inactive";
  page: number;
  pageSize: 10 | 20 | 50;
};

export type AdminCreateUserRequest = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  roles: AdminRole[];
};

export type AdminUpdateUserRequest = {
  fullName?: string;
  phone?: string;
  isActive?: boolean;
  roles?: AdminRole[];
};
