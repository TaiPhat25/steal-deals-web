"use client";

import { useEffect, useState, type SubmitEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiClientError } from "@/lib/api/client";
import { getProfile } from "@/lib/api/account";
import { verifyEmail } from "@/lib/api/auth";
import OtpInput from "@/components/auth/OtpInput";
import ResendOtpButton from "@/components/auth/ResendOtpButton";
import type { UserProfile, UserAddress } from "@/lib/api/store-types";

type AddressForm = Pick<UserAddress, "label" | "address" | "district" | "city"> & {
  isDefault: boolean;
};

type SellerApplicationForm = {
  storeName: string;
  description: string;
  address: string;
  phone: string;
};

const emptyAddressForm: AddressForm = {
  label: "",
  address: "",
  district: "",
  city: "",
  isDefault: false,
};

const emptySellerApplication: SellerApplicationForm = {
  storeName: "",
  description: "",
  address: "",
  phone: "",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default function ProfileMain() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accessToken, isInitialized } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationOtp, setVerificationOtp] = useState("");
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddressForm);
  const [editError, setEditError] = useState<string | null>(null);
  const [sellerApplication, setSellerApplication] = useState<SellerApplicationForm>(emptySellerApplication);
  const [sellerApplicationError, setSellerApplicationError] = useState<string | null>(null);
  const [sellerApplicationSubmitted, setSellerApplicationSubmitted] = useState(false);

  const showVerificationModal = searchParams.get("verify") === "email" && profile !== null && !profile.isEmailVerified;
  const editTarget = searchParams.get("edit");
  const showPhoneModal = editTarget === "phone" && profile !== null;
  const showAddressModal = editTarget === "address" && profile !== null;
  const showSellerModal = searchParams.get("seller") === "apply" && profile !== null;
  const isSeller = profile?.roles.some((role) => role.toLowerCase() === "seller") ?? false;

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
      router.replace("/profile");
    } catch (verificationRequestError) {
      setVerificationError(
        verificationRequestError instanceof ApiClientError && verificationRequestError.status === 400
          ? "The verification code is incorrect or expired."
          : verificationRequestError instanceof ApiClientError
            ? verificationRequestError.message
            : "Unable to verify your email. Please try again.",
      );
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
    router.replace("/profile", { scroll: false });
  };

  const closeSellerModal = () => {
    setSellerApplication(emptySellerApplication);
    setSellerApplicationError(null);
    setSellerApplicationSubmitted(false);
    router.replace("/profile", { scroll: false });
  };

  const handleSellerApplicationChange = (field: keyof SellerApplicationForm, value: string) => {
    setSellerApplication((current) => ({ ...current, [field]: value }));
    setSellerApplicationError(null);
  };

  const handleSubmitSellerApplication = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedApplication = {
      storeName: sellerApplication.storeName.trim(),
      description: sellerApplication.description.trim(),
      address: sellerApplication.address.trim(),
      phone: sellerApplication.phone.trim(),
    };

    if (!normalizedApplication.storeName || !normalizedApplication.address || !normalizedApplication.phone) {
      setSellerApplicationError("Store name, address, and contact phone are required.");
      return;
    }

    setSellerApplication(normalizedApplication);
    setSellerApplicationSubmitted(true);
  };

  const handleSavePhone = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedPhone = phoneInput.trim();
    if (!normalizedPhone) {
      setEditError("Phone number is required.");
      return;
    }

    setProfile((current) => (current ? { ...current, phone: normalizedPhone } : current));
    closeEditModal();
  };

  const handleSaveAddress = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedAddress = {
      label: addressForm.label.trim(),
      address: addressForm.address.trim(),
      district: addressForm.district.trim(),
      city: addressForm.city.trim(),
    };

    if (!normalizedAddress.address || !normalizedAddress.district || !normalizedAddress.city) {
      setEditError("Street address, district, and city are required.");
      return;
    }

    setProfile((current) => {
      if (!current) return current;

      const shouldBeDefault = addressForm.isDefault || current.userAddresses.length === 0;
      const newAddress: UserAddress = {
        id: `local-${Date.now()}`,
        ...normalizedAddress,
        isDefault: shouldBeDefault,
      };

      return {
        ...current,
        userAddresses: [
          ...current.userAddresses.map((address) => ({
            ...address,
            isDefault: shouldBeDefault ? false : address.isDefault,
          })),
          newAddress,
        ],
      };
    });
    setAddressForm(emptyAddressForm);
    closeEditModal();
  };

  return (
    <main className="main">
      <div
        className="page-header text-center"
        style={{ backgroundImage: "url('/assets/images/page-header-bg.jpg')" }}
      >
        <div className="container">
          <h1 className="page-title">
            Profile<span>Account</span>
          </h1>
        </div>
      </div>

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
                <span
                  className={`badge ${profile.isActive ? "badge-success" : "badge-secondary"}`}
                  style={{ fontSize: "inherit", fontWeight: 400 }}
                >
                  {profile.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="row">
                <div className="col-lg-8">
                  <div className="border p-4 mb-4">
                    <h3 className="mb-3">Personal information</h3>
                    <dl className="row mb-0">
                      <dt className="col-sm-4">Full name</dt>
                      <dd className="col-sm-8">{profile.fullName || "Not provided"}</dd>
                      <dt className="col-sm-4">Email address</dt>
                      <dd className="col-sm-8">{profile.email || "Not provided"}</dd>
                      <dt className="col-sm-4">Phone number</dt>
                      <dd className="col-sm-8">
                        {profile.phone ? (
                          <>
                            <span>{profile.phone}</span>
                            <Link
                              href="/profile?edit=phone"
                              scroll={false}
                              className="profile-action-link ml-2 text-primary"
                              style={{ fontWeight: 600, textDecoration: "underline" }}
                            >
                              Edit
                            </Link>
                          </>
                        ) : (
                          <>
                            <span>Not provided</span>
                            <Link
                              href="/profile?edit=phone"
                              scroll={false}
                              className="profile-action-link ml-2 text-primary"
                              style={{ fontWeight: 600, textDecoration: "underline" }}
                            >
                              Edit
                            </Link>
                          </>
                        )}
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
                            style={{ fontWeight: 600, textDecoration: "underline" }}
                          >
                            Verify
                          </Link>
                        )}
                      </dd>
                      <dt className="col-sm-4">Member since</dt>
                      <dd className="col-sm-8">{formatDate(profile.createdAt)}</dd>
                    </dl>
                  </div>

                  <div className="border p-4 mb-4">
                    <h3 className="mb-3">Roles</h3>
                    <p className="mb-0">{profile.roles.length ? profile.roles.join(", ") : "No roles assigned"}</p>
                    {!isSeller && (
                      <Link
                        href="/profile?seller=apply"
                        scroll={false}
                        className="profile-action-link d-inline-block mt-3 text-primary"
                        style={{ fontWeight: 600, textDecoration: "underline" }}
                      >
                        Become a Seller
                      </Link>
                    )}
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="border p-4 mb-4">
                    <h3 className="mb-3">Addresses</h3>
                    {profile.userAddresses.length === 0 ? (
                      <p className="mb-2">No addresses saved.</p>
                    ) : (
                      <ul className="list-unstyled mb-0">
                        {profile.userAddresses.map((address) => (
                          <li key={address.id} className="mb-3">
                            <strong>{address.label || "Address"}</strong>
                            <br />
                            {address.address || ""}
                            {address.district ? `, ${address.district}` : ""}
                            {address.city ? `, ${address.city}` : ""}
                            {address.isDefault && <span className="d-block text-primary">Default</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link
                      href="/profile?edit=address"
                      scroll={false}
                      className="profile-action-link text-primary"
                      style={{ fontWeight: 600, textDecoration: "underline" }}
                    >
                      Add address
                    </Link>
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
            className="modal fade show"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-verify-email-title"
            style={{ display: "block" }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-body">
                  <div className="form-box">
                    <div className="form-tab">
                      <h2 id="profile-verify-email-title" className="text-center mb-2">
                        Verify Your Email
                      </h2>
                      <p className="text-center mb-3">
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
                          <label htmlFor="profile-verification-otp">Verification code *</label>
                          <OtpInput
                            value={verificationOtp}
                            onChange={setVerificationOtp}
                            disabled={isVerifying}
                            idPrefix="profile-verification-otp"
                          />
                        </div>

                        {verificationError && (
                          <div className="alert alert-danger" role="alert" aria-live="polite">
                            {verificationError}
                          </div>
                        )}

                        <div className="verification-form-footer form-footer d-flex flex-row align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <button
                              type="submit"
                              className="btn btn-outline-primary-2"
                              disabled={isVerifying}
                            >
                              <span>{isVerifying ? "VERIFYING..." : "ENTER"}</span>
                              <i className="icon-long-arrow-right"></i>
                            </button>
                            <ResendOtpButton
                              email={profile?.email ?? ""}
                              disabled={isVerifying}
                              onResent={() => {
                                setVerificationOtp("");
                                setVerificationError(null);
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            className="btn btn-link"
                            onClick={handleEnterLater}
                            disabled={isVerifying}
                          >
                            Enter later
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

      {(showPhoneModal || showAddressModal) && profile && (
        <>
          <div className="modal-backdrop fade show" />
          <div
            className="modal fade show profile-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={showPhoneModal ? "profile-edit-phone-title" : "profile-edit-address-title"}
            style={{ display: "block" }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-body">
                  <div className="form-box">
                    <div className="form-tab">
                      <h2
                        id={showPhoneModal ? "profile-edit-phone-title" : "profile-edit-address-title"}
                        className="text-center mb-2"
                      >
                        {showPhoneModal ? "Add Phone Number" : "Add Address"}
                      </h2>
                      <p className="text-center mb-3">
                        {showPhoneModal
                          ? "Add a phone number for order and pickup contact."
                          : "Add an address for delivery orders."}
                      </p>

                      <form onSubmit={showPhoneModal ? handleSavePhone : handleSaveAddress}>
                        {showPhoneModal ? (
                          <div className="form-group">
                            <label htmlFor="profile-edit-phone">Phone number *</label>
                            <input
                              type="tel"
                              className="form-control"
                              id="profile-edit-phone"
                              value={phoneInput}
                              onChange={(event) => setPhoneInput(event.target.value)}
                              autoComplete="tel"
                              required
                            />
                          </div>
                        ) : (
                          <>
                            <div className="form-group">
                              <label htmlFor="profile-edit-address-label">Label</label>
                              <input
                                type="text"
                                className="form-control"
                                id="profile-edit-address-label"
                                value={addressForm.label}
                                onChange={(event) => setAddressForm((current) => ({ ...current, label: event.target.value }))}
                                placeholder="Home, work, or another label"
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="profile-edit-address">Street address *</label>
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
                                  <label htmlFor="profile-edit-district">District *</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    id="profile-edit-district"
                                    value={addressForm.district}
                                    onChange={(event) => setAddressForm((current) => ({ ...current, district: event.target.value }))}
                                    required
                                  />
                                </div>
                              </div>
                              <div className="col-sm-6">
                                <div className="form-group">
                                  <label htmlFor="profile-edit-city">City *</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    id="profile-edit-city"
                                    value={addressForm.city}
                                    onChange={(event) => setAddressForm((current) => ({ ...current, city: event.target.value }))}
                                    autoComplete="address-level2"
                                    required
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

                        <div className="form-footer profile-edit-modal__footer">
                          <button type="submit" className="btn btn-outline-primary-2">
                            <span>{showPhoneModal ? "SAVE PHONE" : "SAVE ADDRESS"}</span>
                            <i className="icon-long-arrow-right"></i>
                          </button>
                          <button type="button" className="btn btn-link" onClick={closeEditModal}>
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

      {showSellerModal && profile && (
        <>
          <div className="modal-backdrop fade show" />
          <div
            className="modal fade show profile-edit-modal"
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
                      <h2 id="seller-application-title" className="text-center mb-2">
                        Become a Seller
                      </h2>

                      {sellerApplicationSubmitted ? (
                        <div className="text-center">
                          <p className="mb-3">
                            Your seller application is ready. Backend submission will be connected later.
                          </p>
                          <button type="button" className="btn btn-outline-primary-2" onClick={closeSellerModal}>
                            <span>BACK TO PROFILE</span>
                            <i className="icon-long-arrow-right"></i>
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="text-center mb-3">
                            Tell us about the store you want to register on Steal Deals.
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

                            {sellerApplicationError && (
                              <div className="alert alert-danger" role="alert" aria-live="polite">
                                {sellerApplicationError}
                              </div>
                            )}

                            <div className="form-footer profile-edit-modal__footer">
                              <button type="submit" className="btn btn-outline-primary-2">
                                <span>SUBMIT APPLICATION</span>
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
