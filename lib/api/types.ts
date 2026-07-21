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
  role: "Customer" | "Seller";
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
