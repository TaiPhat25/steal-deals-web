"use client";

import { useEffect, useRef, useState, type ChangeEvent, type SubmitEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/notifications/ToastProvider";
import { BRAND_NAME } from "@/lib/brand";
import { ApiClientError } from "@/lib/api/client";
import {
  createAddress,
  deleteAddress,
  getProfile,
  updateAddress,
  updateProfile,
  uploadAvatar,
  type UserAddressRequest,
} from "@/lib/api/account";
import { verifyEmail } from "@/lib/api/auth";
import { createStore } from "@/lib/api/store";
import { shouldUseUnoptimizedImage } from "@/lib/image-assets";
import OtpInput from "@/components/auth/OtpInput";
import ResendOtpButton from "@/components/auth/ResendOtpButton";
import type { UserProfile, UserAddress } from "@/lib/api/store-types";

type AddressForm = Pick<UserAddress, "label" | "address" | "commune" | "province"> & {
  latitude: string;
  longitude: string;
  isDefault: boolean;
};

type SellerApplicationForm = {
  storeName: string;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
  phone: string;
};

const emptyAddressForm: AddressForm = {
  label: "",
  address: "",
  commune: "",
  province: "",
  latitude: "",
  longitude: "",
  isDefault: false,
};

const emptySellerApplication: SellerApplicationForm = {
  storeName: "",
  description: "",
  address: "",
  latitude: "",
  longitude: "",
  phone: "",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getInitials(fullName: string | null, email: string | null) {
  const source = fullName?.trim() || email?.trim() || "U";
  const words = source.split(/\s+/).filter(Boolean);

  return words.length > 1
    ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
    : source.slice(0, 2).toUpperCase();
}

function formatAddress(address: Pick<UserAddress, "address" | "commune" | "province">) {
  return [address.address, address.commune, address.province].filter(Boolean).join(", ");
}

function addressToForm(address: UserAddress): AddressForm {
  return {
    label: address.label,
    address: address.address,
    commune: address.commune,
    province: address.province,
    latitude: address.latitude?.toString() ?? "",
    longitude: address.longitude?.toString() ?? "",
    isDefault: address.isDefault,
  };
}

export default function ProfileMain() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accessToken, isInitialized } = useAuth();
  const { showToast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationOtp, setVerificationOtp] = useState("");
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [fullNameInput, setFullNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddressForm);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const [addressPendingDelete, setAddressPendingDelete] = useState<UserAddress | null>(null);
  const [sellerApplication, setSellerApplication] = useState<SellerApplicationForm>(emptySellerApplication);
  const [sellerApplicationError, setSellerApplicationError] = useState<string | null>(null);
  const [sellerApplicationSubmitted, setSellerApplicationSubmitted] = useState(false);
  const [isSubmittingSellerApplication, setIsSubmittingSellerApplication] = useState(false);

  const showVerificationModal = searchParams.get("verify") === "email" && profile !== null && !profile.isEmailVerified;
  const editTarget = searchParams.get("edit");
  const showPhoneModal = (editTarget === "phone" || editTarget === "profile") && profile !== null;
  const showAddressModal = editTarget === "address" && profile !== null;
  const showSellerModal = searchParams.get("seller") === "apply" && profile !== null;
  const isSeller = profile?.roles.some((role) => role.toLowerCase() === "seller") ?? false;
  const selectedAddress =
    profile?.userAddresses.find((address) => address.id === selectedAddressId) ?? profile?.userAddresses[0] ?? null;

  useEffect(() => {
    if (!isInitialized) return;

    if (!accessToken) {
      router.replace("/login");
      return;
    }

    let active = true;

    void getProfile(accessToken)
      .then((result) => {
        if (active) {
          setProfile(result);
          setSelectedAddressId(
            result.userAddresses.find((address) => address.isDefault)?.id ?? result.userAddresses[0]?.id ?? "",
          );
          setFullNameInput(result.fullName ?? "");
          setPhoneInput(result.phone ?? "");
          setAddressForm(emptyAddressForm);
          setError(null);
        }
      })
      .catch(() => {
        if (active) setError("Unable to load your profile. Please try again.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [accessToken, isInitialized, router]);

  const handleSaveProfile = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEditError(null);

    const fullName = fullNameInput.trim();
    const phone = phoneInput.trim();

    if (!fullName) {
      setEditError("Full name is required.");
      return;
    }

    if (!accessToken || !profile) {
      setEditError("Your session has expired. Please sign in again.");
      return;
    }

    setIsSavingProfile(true);

    try {
      const updatedProfile = await updateProfile(accessToken, {
        fullName,
        phone: phone || null,
        avatarUrl: profile.avatarUrl,
      });

      setProfile(updatedProfile);
      setFullNameInput(updatedProfile.fullName ?? "");
      setPhoneInput(updatedProfile.phone ?? "");
      showToast("Your personal information has been saved.", "success");
      closeEditModal();
    } catch (requestError) {
      const message =
        requestError instanceof ApiClientError
          ? requestError.message
          : "Unable to save your personal information. Please try again.";
      setEditError(message);
      showToast(message, "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showToast("Please choose a JPEG, PNG, or WebP image.", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Profile images must be 5 MB or smaller.", "error");
      return;
    }

    if (!accessToken) {
      showToast("Your session has expired. Please sign in again.", "error");
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const updatedProfile = await uploadAvatar(accessToken, file);
      setProfile(updatedProfile);
      setFullNameInput(updatedProfile.fullName ?? "");
      setPhoneInput(updatedProfile.phone ?? "");
      showToast("Your profile photo has been updated.", "success");
    } catch (requestError) {
      showToast(
        requestError instanceof ApiClientError
          ? requestError.message
          : "Unable to upload your profile photo. Please try again.",
        "error",
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleVerifyEmail = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setVerificationError(null);

    const normalizedOtp = verificationOtp.replace(/\D/g, "");
    if (!/^\d{6}$/.test(normalizedOtp)) {
      setVerificationError("Please enter the 6-digit verification code.");
      return;
    }

    if (!profile?.email) {
      setVerificationError("Your account does not have an email address.");
      return;
    }

    setIsVerifying(true);

    try {
      await verifyEmail({ email: profile.email, otp: normalizedOtp });
      const refreshedProfile = accessToken ? await getProfile(accessToken) : null;

      if (refreshedProfile) {
        setProfile(refreshedProfile);
      }

      setVerificationOtp("");
      showToast("Your email has been verified.", "success");
      router.replace("/profile");
    } catch (verificationRequestError) {
      const message =
        verificationRequestError instanceof ApiClientError && verificationRequestError.status === 400
          ? "The verification code is incorrect or expired."
          : verificationRequestError instanceof ApiClientError
            ? verificationRequestError.message
            : "Unable to verify your email. Please try again.";
      setVerificationError(message);
      showToast(message, "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEnterLater = () => {
    setVerificationOtp("");
    setVerificationError(null);
    router.replace("/profile", { scroll: false });
  };

  const closeEditModal = () => {
    setEditError(null);
    setEditingAddressId(null);
    setAddressForm(emptyAddressForm);
    router.replace("/profile", { scroll: false });
  };

  const openAddressModal = (address?: UserAddress) => {
    setEditError(null);
    setEditingAddressId(address?.id ?? null);
    setAddressForm(address ? addressToForm(address) : emptyAddressForm);
    router.push(address ? `/profile?edit=address&addressId=${address.id}` : "/profile?edit=address", {
      scroll: false,
    });
  };

  const openSellerModal = () => {
    const defaultAddress = profile?.userAddresses.find((address) => address.isDefault);

    if (defaultAddress) {
      setSellerApplication((current) => ({
        ...current,
        address: current.address || formatAddress(defaultAddress),
        latitude: current.latitude || defaultAddress.latitude?.toString() || "",
        longitude: current.longitude || defaultAddress.longitude?.toString() || "",
      }));
    }

    router.push("/profile?seller=apply", { scroll: false });
  };

  const closeSellerModal = () => {
    setSellerApplication(emptySellerApplication);
    setSellerApplicationError(null);
    setSellerApplicationSubmitted(false);
    setIsSubmittingSellerApplication(false);
    router.replace("/profile", { scroll: false });
  };

  const handleSellerApplicationChange = (field: keyof SellerApplicationForm, value: string) => {
    setSellerApplication((current) => ({ ...current, [field]: value }));
    setSellerApplicationError(null);
  };

  const handleSubmitSellerApplication = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSellerApplicationError(null);

    const normalizedApplication = {
      storeName: sellerApplication.storeName.trim(),
      description: sellerApplication.description.trim(),
      address: sellerApplication.address.trim(),
      latitude: sellerApplication.latitude.trim(),
      longitude: sellerApplication.longitude.trim(),
      phone: sellerApplication.phone.trim(),
    };

    const latitude = Number(normalizedApplication.latitude);
    const longitude = Number(normalizedApplication.longitude);

    if (!normalizedApplication.storeName || !normalizedApplication.address || !normalizedApplication.phone) {
      setSellerApplicationError("Store name, address, and contact phone are required.");
      return;
    }

    if (
      !normalizedApplication.latitude ||
      !normalizedApplication.longitude ||
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      setSellerApplicationError(
        "Enter a valid latitude between -90 and 90 and longitude between -180 and 180.",
      );
      return;
    }

    if (!accessToken) {
      setSellerApplicationError("Your session has expired. Please sign in again.");
      return;
    }

    setIsSubmittingSellerApplication(true);

    try {
      await createStore(accessToken, {
        name: normalizedApplication.storeName,
        description: normalizedApplication.description || null,
        address: normalizedApplication.address,
        latitude,
        longitude,
        phone: normalizedApplication.phone,
      });

      setSellerApplication(normalizedApplication);
      setSellerApplicationSubmitted(true);
      showToast("Your seller application has been submitted for review.", "success");
    } catch (requestError) {
      const message =
        requestError instanceof ApiClientError
          ? requestError.message
          : "Unable to submit your seller application. Please try again.";
      setSellerApplicationError(message);
      showToast(message, "error");
    } finally {
      setIsSubmittingSellerApplication(false);
    }
  };

  const handleSaveAddress = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEditError(null);

    const normalizedAddress = {
      label: addressForm.label.trim(),
      address: addressForm.address.trim(),
      commune: addressForm.commune.trim(),
      province: addressForm.province.trim(),
      latitude: addressForm.latitude.trim(),
      longitude: addressForm.longitude.trim(),
    };

    if (!normalizedAddress.address || !normalizedAddress.commune || !normalizedAddress.province) {
      setEditError("Street address, commune, and province are required.");
      return;
    }

    const latitude = normalizedAddress.latitude ? Number(normalizedAddress.latitude) : null;
    const longitude = normalizedAddress.longitude ? Number(normalizedAddress.longitude) : null;

    if (
      (latitude === null) !== (longitude === null) ||
      (latitude !== null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) ||
      (longitude !== null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180))
    ) {
      setEditError("Enter both coordinates, with latitude between -90 and 90 and longitude between -180 and 180.");
      return;
    }

    if (!accessToken || !profile) {
      setEditError("Your session has expired. Please sign in again.");
      return;
    }

    const request: UserAddressRequest = {
      label: normalizedAddress.label,
      address: normalizedAddress.address,
      commune: normalizedAddress.commune,
      province: normalizedAddress.province,
      latitude,
      longitude,
      isDefault: addressForm.isDefault,
    };

    setIsSavingAddress(true);

    try {
      const savedAddress = editingAddressId
        ? await updateAddress(accessToken, editingAddressId, request)
        : await createAddress(accessToken, request);

      const updatedProfile = await getProfile(accessToken);
      setProfile(updatedProfile);
      setSelectedAddressId(savedAddress.id);
      showToast(
        editingAddressId ? "Your address has been updated." : "Your address has been saved.",
        "success",
      );
      closeEditModal();
    } catch (requestError) {
      const message =
        requestError instanceof ApiClientError
          ? requestError.message
          : "Unable to save your address. Please try again.";
      setEditError(message);
      showToast(message, "error");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = (address: UserAddress) => {
    if (!accessToken || deletingAddressId) return;
    setAddressPendingDelete(address);
  };

  const handleConfirmDeleteAddress = async () => {
    if (!accessToken || !addressPendingDelete || deletingAddressId) return;

    const address = addressPendingDelete;

    setDeletingAddressId(address.id);

    try {
      await deleteAddress(accessToken, address.id);
      const updatedProfile = await getProfile(accessToken);
      setProfile(updatedProfile);
      setSelectedAddressId((currentId) =>
        updatedProfile.userAddresses.some((item) => item.id === currentId)
          ? currentId
          : updatedProfile.userAddresses.find((item) => item.isDefault)?.id ?? updatedProfile.userAddresses[0]?.id ?? "",
      );
      showToast("Your address has been deleted.", "success");
    } catch (requestError) {
      showToast(
        requestError instanceof ApiClientError
          ? requestError.message
          : "Unable to delete your address. Please try again.",
        "error",
      );
    } finally {
      setDeletingAddressId(null);
      setAddressPendingDelete(null);
    }
  };

  return (
    <main className="main profile-page">
      <section className="info-page__hero info-page__hero--image">
        <Image
          src="/assets/images/page-headers/profile-account-v2.webp"
          alt="A customer checking account details at a local food market"
          fill
          preload
          sizes="100vw"
        />
        <div className="info-page__hero-overlay" aria-hidden="true" />
        <div className="container info-page__hero-content">
          <p className="info-page__eyebrow">Your StealDeals account</p>
          <h1>Profile</h1>
          <p>Review your account details, saved addresses, roles, and verification status.</p>
        </div>
      </section>

      <nav aria-label="breadcrumb" className="breadcrumb-nav">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">Home</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Profile
            </li>
          </ol>
        </div>
      </nav>

      <div className="page-content">
        <div className="container">
          {isLoading && <p>Loading profile...</p>}

          {!isLoading && error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {!isLoading && !error && profile && (
            <section aria-labelledby="profile-heading">
              <div className="mb-4">
                <h2 id="profile-heading" className="mb-1">
                  Account details
                </h2>
                <p className="mb-2">Manage and review your account information.</p>
              </div>

              <div className="profile-account-summary border p-4 mb-2">
                <div className="profile-account-summary__identity">
                  <div className="profile-account-summary__avatar" aria-label="Profile photo">
                    {profile.avatarUrl ? (
                      <Image
                        src={profile.avatarUrl}
                        alt={`${profile.fullName || "Account"}'s profile photo`}
                        width={96}
                        height={96}
                        unoptimized={shouldUseUnoptimizedImage(profile.avatarUrl)}
                      />
                    ) : (
                      <span aria-hidden="true">{getInitials(profile.fullName, profile.email)}</span>
                    )}
                  </div>
                  <div>
                    <span className={`badge ${profile.isActive ? "badge-success" : "badge-secondary"} mb-1`}>
                      {profile.isActive ? "Active" : "Inactive"}
                    </span>
                    <h2 className="profile-account-summary__name mb-1">
                      {profile.fullName || "Complete your profile"}
                    </h2>
                    <p className="mb-0">
                      {profile.roles.length ? profile.roles.join(", ") : "Customer"}
                    </p>
                  </div>
                </div>
                <div className="profile-account-summary__actions">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={handleAvatarChange}
                    aria-label="Choose a profile photo"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary-2"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? "UPLOADING..." : "CHANGE PHOTO"}
                  </button>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-8">
                  <div className="border p-4 mb-4">
                    <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
                      <h3 className="mb-0">Personal information</h3>
                      <Link
                        href="/profile?edit=profile"
                        scroll={false}
                        className="profile-action-link text-primary"
                      >
                        Edit
                      </Link>
                    </div>
                    <dl className="row mb-0">
                      <dt className="col-sm-4">Full name</dt>
                      <dd className="col-sm-8">{profile.fullName || "Not provided"}</dd>
                      <dt className="col-sm-4">Email address</dt>
                      <dd className="col-sm-8">{profile.email || "Not provided"}</dd>
                      <dt className="col-sm-4">Phone number</dt>
                      <dd className="col-sm-8">
                        {profile.phone || "Not provided"}
                      </dd>
                      <dt className="col-sm-4">Email verification</dt>
                      <dd className="col-sm-8">
                        <span
                          className={`badge ${profile.isEmailVerified ? "badge-success" : "badge-danger"}`}
                          style={{ fontSize: "inherit", fontWeight: 400 }}
                        >
                          {profile.isEmailVerified ? "Verified" : "Not verified"}
                        </span>
                        {!profile.isEmailVerified && (
                          <Link
                            href="/profile?verify=email"
                            scroll={false}
                            className="profile-action-link ml-2 text-primary"
                          >
                            Verify
                          </Link>
                        )}
                      </dd>
                      <dt className="col-sm-4">Member since</dt>
                      <dd className="col-sm-8">{formatDate(profile.createdAt)}</dd>
                    </dl>
                  </div>

                  <div className="profile-seller-card border p-4 mb-4">
                    {isSeller ? (
                      <>
                        <h3 className="mb-2">Seller dashboard</h3>
                        <p className="mb-3">
                          Manage your store, surprise bags, orders, and customer reviews.
                        </p>
                        <Link href="/seller" className="btn btn-primary">
                          Open Seller Dashboard
                        </Link>
                      </>
                    ) : (
                      <>
                        <h3 className="mb-2">Become a Seller</h3>
                        <p className="mb-3">
                          Reach local buyers and help reduce food waste by offering your surplus food on StealDeals.
                        </p>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={openSellerModal}
                        >
                          Become a Seller
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="profile-addresses border p-4 mb-4">
                    <h3 className="profile-addresses__title mb-3">Addresses</h3>
                    {profile.userAddresses.length === 0 ? (
                      <p className="profile-addresses__empty mb-3">No addresses saved.</p>
                    ) : (
                      <>
                        <div className="profile-addresses__selector">
                          <label htmlFor="profile-saved-address" className="sr-only">
                            Select a saved address
                          </label>
                          <select
                            id="profile-saved-address"
                            className="form-control"
                            value={selectedAddress?.id ?? ""}
                            onChange={(event) => setSelectedAddressId(event.target.value)}
                          >
                            {profile.userAddresses.map((address) => (
                              <option key={address.id} value={address.id}>
                                {address.label || "Address"}{address.isDefault ? " (Default)" : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        {selectedAddress && (
                          <div className="profile-addresses__details">
                            <p className="profile-addresses__address mb-2">
                              <span className="d-block">{selectedAddress.address}</span>
                              <span className="d-block">{selectedAddress.commune}</span>
                              <span className="d-block">{selectedAddress.province}</span>
                            </p>
                            <div className="profile-addresses__actions d-flex flex-wrap">
                              <button
                                type="button"
                                className="btn btn-link p-0 text-primary"
                                onClick={() => openAddressModal(selectedAddress)}
                                aria-label={`Edit ${selectedAddress.label || "address"}`}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-link p-0 text-danger"
                                onClick={() => handleDeleteAddress(selectedAddress)}
                                disabled={deletingAddressId === selectedAddress.id}
                                aria-label={`Delete ${selectedAddress.label || "address"}`}
                              >
                                {deletingAddressId === selectedAddress.id ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    <button
                      type="button"
                      className="profile-addresses__add profile-action-link btn btn-link"
                      onClick={() => openAddressModal()}
                    >
                      Add Address
                    </button>
                  </div>

                  {profile.userTrustScore && (
                    <div className="border p-4">
                      <h3 className="mb-3">Trust score</h3>
                      <p className="h3 mb-2">{profile.userTrustScore.score}</p>
                      <p className="mb-0">Based on {profile.userTrustScore.totalOrders} orders</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {showVerificationModal && (
        <>
          <div className="modal-backdrop fade show" />
          <div
            className="modal fade show profile-form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-verify-email-title"
            aria-describedby="profile-verify-email-description"
            style={{ display: "block" }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-body">
                  <div className="form-box">
                    <div className="form-tab">
                      <h2 id="profile-verify-email-title" className="mb-2">
                        Verify Your Email
                      </h2>
                      <p id="profile-verify-email-description" className="mb-3">
                        Enter the OTP sent to your email address.
                      </p>

                      <form onSubmit={handleVerifyEmail}>
                        <div className="form-group">
                          <label htmlFor="profile-verification-email">Email address *</label>
                          <input
                            type="email"
                            className="form-control"
                            id="profile-verification-email"
                            value={profile?.email ?? ""}
                            autoComplete="email"
                            readOnly
                            required
                          />
                        </div>

                        <div className="form-group">
                          <span id="profile-verification-code-label" className="form-label">
                            Verification code *
                          </span>
                          <p id="profile-verification-code-help" className="profile-form-modal__hint mb-2">
                            Enter the 6-digit code. You can paste the full code into any box.
                          </p>
                          <OtpInput
                            value={verificationOtp}
                            onChange={setVerificationOtp}
                            disabled={isVerifying}
                            idPrefix="profile-verification-otp"
                            ariaLabelledBy="profile-verification-code-label"
                            ariaDescribedBy="profile-verification-code-help"
                            invalid={Boolean(verificationError)}
                          />
                        </div>

                        {verificationError && (
                          <div className="alert alert-danger" role="alert" aria-live="polite">
                            {verificationError}
                          </div>
                        )}

                        <div className="profile-form-modal__footer">
                          <button
                            type="submit"
                            className="btn btn-outline-primary-2 profile-form-modal__submit"
                            disabled={isVerifying}
                          >
                            <span>{isVerifying ? "VERIFYING..." : "VERIFY EMAIL"}</span>
                            <i className="icon-long-arrow-right" aria-hidden="true"></i>
                          </button>
                          <div className="profile-form-modal__secondary-actions">
                            <ResendOtpButton
                              email={profile?.email ?? ""}
                              disabled={isVerifying}
                              onResent={() => {
                                setVerificationOtp("");
                                setVerificationError(null);
                                showToast("A new verification code was sent to your email.", "success");
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-link"
                              onClick={handleEnterLater}
                              disabled={isVerifying}
                            >
                              Enter later
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {(showPhoneModal || showAddressModal) && profile && (
        <>
          <div className="modal-backdrop fade show" />
          <div
            className="modal fade show profile-form-modal profile-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={showPhoneModal ? "profile-edit-profile-title" : "profile-edit-address-title"}
            style={{ display: "block" }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-body">
                  <div className="form-box">
                    <div className="form-tab">
                      <h2
                        id={showPhoneModal ? "profile-edit-profile-title" : "profile-edit-address-title"}
                        className="mb-2"
                      >
                        {showPhoneModal ? "Edit Personal Information" : editingAddressId ? "Edit Address" : "Add Address"}
                      </h2>
                      <p className="mb-3">
                        {showPhoneModal
                          ? "Keep your account details up to date."
                          : "Save an address for delivery orders and distance calculations."}
                      </p>

                      <form onSubmit={showPhoneModal ? handleSaveProfile : handleSaveAddress}>
                        {showPhoneModal ? (
                          <>
                            <div className="form-group">
                              <label htmlFor="profile-edit-full-name">Full name *</label>
                              <input
                                type="text"
                                className="form-control"
                                id="profile-edit-full-name"
                                value={fullNameInput}
                                onChange={(event) => setFullNameInput(event.target.value)}
                                autoComplete="name"
                                maxLength={200}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="profile-edit-phone">Phone number</label>
                              <input
                                type="tel"
                                className="form-control"
                                id="profile-edit-phone"
                                value={phoneInput}
                                onChange={(event) => setPhoneInput(event.target.value)}
                                autoComplete="tel"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="form-group">
                              <label htmlFor="profile-edit-address-label">Label *</label>
                              <input
                                type="text"
                                className="form-control"
                                id="profile-edit-address-label"
                                value={addressForm.label}
                                onChange={(event) => setAddressForm((current) => ({ ...current, label: event.target.value }))}
                                placeholder="Home, work, or another label"
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="profile-edit-address">Street address / Specific address *</label>
                              <input
                                type="text"
                                className="form-control"
                                id="profile-edit-address"
                                value={addressForm.address}
                                onChange={(event) => setAddressForm((current) => ({ ...current, address: event.target.value }))}
                                autoComplete="street-address"
                                required
                              />
                            </div>
                            <div className="row">
                              <div className="col-sm-6">
                                <div className="form-group">
                                  <label htmlFor="profile-edit-commune">Ward / Commune *</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    id="profile-edit-commune"
                                    value={addressForm.commune}
                                    onChange={(event) => setAddressForm((current) => ({ ...current, commune: event.target.value }))}
                                    required
                                  />
                                </div>
                              </div>
                              <div className="col-sm-6">
                                <div className="form-group">
                                  <label htmlFor="profile-edit-province">City / Province *</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    id="profile-edit-province"
                                    value={addressForm.province}
                                    onChange={(event) => setAddressForm((current) => ({ ...current, province: event.target.value }))}
                                    autoComplete="address-level1"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-6">
                                <div className="form-group">
                                  <label htmlFor="profile-edit-latitude">Latitude</label>
                                  <input
                                    type="number"
                                    className="form-control"
                                    id="profile-edit-latitude"
                                    value={addressForm.latitude}
                                    onChange={(event) => setAddressForm((current) => ({ ...current, latitude: event.target.value }))}
                                    inputMode="decimal"
                                    min="-90"
                                    max="90"
                                    step="any"
                                    placeholder="e.g. 10.7769"
                                  />
                                </div>
                              </div>
                              <div className="col-sm-6">
                                <div className="form-group">
                                  <label htmlFor="profile-edit-longitude">Longitude</label>
                                  <input
                                    type="number"
                                    className="form-control"
                                    id="profile-edit-longitude"
                                    value={addressForm.longitude}
                                    onChange={(event) => setAddressForm((current) => ({ ...current, longitude: event.target.value }))}
                                    inputMode="decimal"
                                    min="-180"
                                    max="180"
                                    step="any"
                                    placeholder="e.g. 106.7009"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="custom-control custom-checkbox mb-3">
                              <input
                                type="checkbox"
                                className="custom-control-input"
                                id="profile-edit-address-default"
                                checked={addressForm.isDefault}
                                onChange={(event) => setAddressForm((current) => ({ ...current, isDefault: event.target.checked }))}
                              />
                              <label className="custom-control-label" htmlFor="profile-edit-address-default">
                                Make this my default address
                              </label>
                            </div>
                          </>
                        )}

                        {editError && (
                          <div className="alert alert-danger" role="alert" aria-live="polite">
                            {editError}
                          </div>
                        )}

                        <div className="form-footer profile-form-modal__footer">
                          <button
                            type="submit"
                            className="btn btn-outline-primary-2"
                            disabled={showPhoneModal ? isSavingProfile : isSavingAddress}
                          >
                            <span>
                              {showPhoneModal
                                ? isSavingProfile
                                  ? "SAVING..."
                                  : "SAVE CHANGES"
                                  : isSavingAddress
                                    ? "SAVING..."
                                    : editingAddressId
                                      ? "UPDATE ADDRESS"
                                      : "SAVE ADDRESS"}
                            </span>
                            <i className="icon-long-arrow-right"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-link"
                            onClick={closeEditModal}
                            disabled={showPhoneModal ? isSavingProfile : isSavingAddress}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {addressPendingDelete && (
        <>
          <div className="modal-backdrop fade show" />
          <div
            className="modal fade show profile-form-modal profile-confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="profile-delete-address-title"
            aria-describedby="profile-delete-address-description"
            style={{ display: "block" }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-body profile-confirm-modal__body">
                  <h2 id="profile-delete-address-title" className="mb-2">
                    Delete address?
                  </h2>
                  <p id="profile-delete-address-description" className="mb-4">
                    Are you sure you want to delete {addressPendingDelete.label || "this address"}? This action cannot be undone.
                  </p>
                  <div className="profile-confirm-modal__actions">
                    <button
                      type="button"
                      className="btn btn-link"
                      onClick={() => setAddressPendingDelete(null)}
                      disabled={Boolean(deletingAddressId)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => void handleConfirmDeleteAddress()}
                      disabled={Boolean(deletingAddressId)}
                    >
                      {deletingAddressId ? "Deleting..." : "Delete address"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showSellerModal && profile && (
        <>
          <div className="modal-backdrop fade show" />
          <div
            className="modal fade show profile-form-modal profile-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="seller-application-title"
            style={{ display: "block" }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-body">
                  <div className="form-box">
                    <div className="form-tab">
                      <h2 id="seller-application-title" className="mb-2">
                        Become a Seller
                      </h2>

                      {sellerApplicationSubmitted ? (
                        <div className="text-center">
                          <p className="mb-3">
                            Your store application has been submitted and is waiting for admin approval.
                          </p>
                          <button type="button" className="btn btn-outline-primary-2" onClick={closeSellerModal}>
                            <span>BACK TO PROFILE</span>
                            <i className="icon-long-arrow-right"></i>
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="mb-3">
                            Tell us about the store you want to register on {BRAND_NAME}.
                          </p>

                          <form onSubmit={handleSubmitSellerApplication}>
                            <div className="form-group">
                              <label htmlFor="seller-store-name">Store name *</label>
                              <input
                                type="text"
                                className="form-control"
                                id="seller-store-name"
                                value={sellerApplication.storeName}
                                onChange={(event) => handleSellerApplicationChange("storeName", event.target.value)}
                                autoComplete="organization"
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="seller-store-description">Store description</label>
                              <textarea
                                className="form-control"
                                id="seller-store-description"
                                rows={3}
                                value={sellerApplication.description}
                                onChange={(event) => handleSellerApplicationChange("description", event.target.value)}
                                placeholder="What kind of food will your store offer?"
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="seller-store-address">Store address *</label>
                              <input
                                type="text"
                                className="form-control"
                                id="seller-store-address"
                                value={sellerApplication.address}
                                onChange={(event) => handleSellerApplicationChange("address", event.target.value)}
                                autoComplete="street-address"
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="seller-store-phone">Contact phone *</label>
                              <input
                                type="tel"
                                className="form-control"
                                id="seller-store-phone"
                                value={sellerApplication.phone}
                                onChange={(event) => handleSellerApplicationChange("phone", event.target.value)}
                                autoComplete="tel"
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="seller-store-latitude">Latitude *</label>
                              <input
                                type="number"
                                className="form-control"
                                id="seller-store-latitude"
                                value={sellerApplication.latitude}
                                onChange={(event) => handleSellerApplicationChange("latitude", event.target.value)}
                                inputMode="decimal"
                                min="-90"
                                max="90"
                                step="any"
                                placeholder="e.g. 10.7769"
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="seller-store-longitude">Longitude *</label>
                              <input
                                type="number"
                                className="form-control"
                                id="seller-store-longitude"
                                value={sellerApplication.longitude}
                                onChange={(event) => handleSellerApplicationChange("longitude", event.target.value)}
                                inputMode="decimal"
                                min="-180"
                                max="180"
                                step="any"
                                placeholder="e.g. 106.7009"
                                required
                              />
                            </div>

                            {sellerApplicationError && (
                              <div className="alert alert-danger" role="alert" aria-live="polite">
                                {sellerApplicationError}
                              </div>
                            )}

                            <div className="form-footer profile-form-modal__footer">
                              <button
                                type="submit"
                                className="btn btn-outline-primary-2"
                                disabled={isSubmittingSellerApplication}
                              >
                                <span>{isSubmittingSellerApplication ? "SUBMITTING..." : "SUBMIT APPLICATION"}</span>
                                <i className="icon-long-arrow-right"></i>
                              </button>
                              <button type="button" className="btn btn-link" onClick={closeSellerModal}>
                                Cancel
                              </button>
                            </div>
                          </form>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
