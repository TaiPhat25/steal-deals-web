import type { UserAddress } from "@/lib/api/store-types";

export type AddressForm = Pick<UserAddress, "label" | "address" | "commune" | "province"> & {
  latitude: string;
  longitude: string;
  isDefault: boolean;
};

export type SellerApplicationForm = {
  storeName: string;
  description: string;
  address: string;
  province: string;
  commune: string;
  latitude: string;
  longitude: string;
  phone: string;
  bankAccount: string;
  licenseUrl: string;
};

export type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export const emptyAddressForm: AddressForm = {
  label: "",
  address: "",
  commune: "",
  province: "",
  latitude: "",
  longitude: "",
  isDefault: false,
};

export const emptySellerApplication: SellerApplicationForm = {
  storeName: "",
  description: "",
  address: "",
  province: "",
  commune: "",
  latitude: "",
  longitude: "",
  phone: "",
  bankAccount: "",
  licenseUrl: "",
};

export const emptyPasswordForm: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};
