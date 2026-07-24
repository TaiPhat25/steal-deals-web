"use client";

import { useEffect, useState, type SubmitEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiClientError } from "@/lib/api/client";
import { getProfile } from "@/lib/api/account";
import { verifyEmail } from "@/lib/api/auth";
import type { UserProfile } from "@/lib/api/store-types";

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

  const showVerificationModal = searchParams.get("verify") === "email" && profile !== null && !profile.isEmailVerified;

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

    const normalizedOtp = verificationOtp.trim();
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
                          profile.phone
                        ) : (
                          <>
                            <span>Not provided</span>
                            <Link
                              href="/profile?edit=phone"
                              scroll={false}
                              className="profile-action-link ml-2 text-primary"
                              style={{ fontWeight: 600, textDecoration: "underline" }}
                            >
                              Add
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
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="border p-4 mb-4">
                    <h3 className="mb-3">Addresses</h3>
                    {profile.userAddresses.length === 0 ? (
                      <p className="mb-0">No addresses saved.</p>
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
                          <input
                            type="text"
                            className="form-control"
                            id="profile-verification-otp"
                            value={verificationOtp}
                            onChange={(event) => setVerificationOtp(event.target.value)}
                            inputMode="numeric"
                            pattern="[0-9]{6}"
                            maxLength={6}
                            required
                          />
                        </div>

                        {verificationError && (
                          <div className="alert alert-danger" role="alert" aria-live="polite">
                            {verificationError}
                          </div>
                        )}

                        <div className="form-footer d-flex align-items-center justify-content-between">
                          <button
                            type="submit"
                            className="btn btn-outline-primary-2"
                            disabled={isVerifying}
                          >
                            <span>{isVerifying ? "VERIFYING..." : "ENTER"}</span>
                            <i className="icon-long-arrow-right"></i>
                          </button>
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
    </main>
  );
}
