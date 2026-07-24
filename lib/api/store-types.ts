export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

export type AccessTokenResponse = {
  accessToken: string;
  accessTokenExpiresAt: string;
};

export type RegistrationResponse = {
  message: string;
  requiresEmailVerification: boolean;
};

export type CurrentUser = {
  userId: string;
  email: string;
  name: string;
  roles: string[];
};

export type UserAddress = {
  id: string;
  label: string | null;
  address: string | null;
  district: string | null;
  city: string | null;
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

export type UserProfile = {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  userAddresses: UserAddress[];
  userTrustScore: UserTrustScore | null;
  roles: string[];
};

export type MessageResponse = {
  message: string;
};

export type VerifyEmailRequest = {
  email: string;
  otp: string;
};

export type ResendOtpRequest = {
  email: string;
};
