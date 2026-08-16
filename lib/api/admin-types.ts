export type UserRole = "Customer" | "Seller";
export type AdminRole = "Admin" | "SuperAdmin";
export type AccountRole = UserRole | AdminRole;

export type CurrentAdmin = {
  adminId: string | null;
  email: string | null;
  name: string | null;
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
  userTrustScore?: UserTrustScore | null;
  roles: string[];
};

export type UserDetail = UserSummary & {
  userAddresses?: UserAddress[];
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
  role?: AccountRole;
  accountStatus?: "active" | "inactive";
  page?: number;
  pageSize?: number;
};

export type AdminCreateUserRequest = {
  email: string;
  password: string;
  fullName: string;
  phone?: string | null;
  roles: UserRole[];
};

export type AdminUpdateUserRequest = {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  isActive?: boolean | null;
  roles?: UserRole[] | null;
};

export type CreateAdminRequest = {
  email: string;
  password: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  roles: AdminRole[];
};

export type UpdateAdminRequest = {
  email?: string | null;
  password?: string | null;
  fullName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  isActive?: boolean | null;
  roles?: AdminRole[] | null;
};
