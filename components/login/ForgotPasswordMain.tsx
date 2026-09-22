"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type SubmitEvent,
} from "react";
import OtpInput from "@/components/auth/OtpInput";
import PasswordField from "@/components/login/PasswordField";
import {
  focusFirstInvalidControl,
  isValidEmail,
  type FieldErrors,
} from "@/components/login/auth-form-utils";
import { requestPasswordReset, resetPassword } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";

const RESEND_COOLDOWN_SECONDS = 60;

type ResetStage = "request" | "reset" | "success";
type RequestField = "email";
type ResetField = "otp" | "newPassword" | "confirmPassword";

function getPasswordResetError(error: unknown) {
  if (!(error instanceof ApiClientError)) {
    return "Unable to reach the server. Check your connection and try again.";
  }

  if (error.status >= 500) {
    return "The password reset service is temporarily unavailable. Please try again later.";
  }

  return error.message;
}

export default function ForgotPasswordMain() {
  const [stage, setStage] = useState<ResetStage>("request");
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requestErrors, setRequestErrors] = useState<
    FieldErrors<RequestField>
  >({});
  const [resetErrors, setResetErrors] = useState<FieldErrors<ResetField>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const resetHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setTimeout(() => {
      setCooldown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    const focusFrame = window.requestAnimationFrame(() => {
      if (stage === "request") {
        emailInputRef.current?.focus();
      } else if (stage === "reset") {
        document
          .querySelector<HTMLInputElement>("#password-reset-otp-1")
          ?.focus();
      } else {
        resetHeadingRef.current?.focus();
      }
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [stage]);

  const focusOtp = () => {
    window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLInputElement>("#password-reset-otp-1")
        ?.focus();
    });
  };

  const handleRequestSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFormMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    const nextErrors: FieldErrors<RequestField> = {};

    if (!normalizedEmail) {
      nextErrors.email = "Email address is required.";
    } else if (!isValidEmail(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    setRequestErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      focusFirstInvalidControl(event.currentTarget);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await requestPasswordReset({ email: normalizedEmail });
      setSubmittedEmail(normalizedEmail);
      setFormMessage(response.message);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setStage("reset");
    } catch (error) {
      setFormError(getPasswordResetError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFormMessage(null);

    const normalizedOtp = otp.replace(/\D/g, "");
    const nextErrors: FieldErrors<ResetField> = {};

    if (!/^\d{6}$/.test(normalizedOtp)) {
      nextErrors.otp = "Enter the six-digit reset code.";
    }

    if (!newPassword) {
      nextErrors.newPassword = "New password is required.";
    } else if (newPassword.length < 8) {
      nextErrors.newPassword = "Use at least 8 characters.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirm your new password.";
    } else if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setResetErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.otp) {
        focusOtp();
      } else {
        focusFirstInvalidControl(event.currentTarget);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword({
        email: submittedEmail,
        otp: normalizedOtp,
        newPassword,
      });
      setStage("success");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setFormError(
        error instanceof ApiClientError && error.status === 400
          ? "The reset code is invalid or expired. Request a new code and try again."
          : getPasswordResetError(error),
      );
      focusOtp();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;

    setFormError(null);
    setFormMessage(null);
    setIsResending(true);

    try {
      const response = await requestPasswordReset({ email: submittedEmail });
      setOtp("");
      setFormMessage(response.message);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      focusOtp();
    } catch (error) {
      setFormError(getPasswordResetError(error));
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = () => {
    setStage("request");
    setSubmittedEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setResetErrors({});
    setFormError(null);
    setFormMessage(null);
    setCooldown(0);
  };

  return (
    <main className="main">
      <nav aria-label="breadcrumb" className="breadcrumb-nav border-0 mb-0">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/login">Sign In</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Forgot Password
            </li>
          </ol>
        </div>
      </nav>

      <div className="login-page auth-page forgot-password-page">
        <div className="container">
          <div className="form-box">
            {stage === "request" && (
              <>
                <div className="auth-form-heading">
                  <h1 id="forgot-password-heading">Reset your password</h1>
                  <p>
                    Enter your account email and we will send you a six-digit
                    reset code.
                  </p>
                </div>

                <form
                  className="auth-form"
                  aria-labelledby="forgot-password-heading"
                  onSubmit={handleRequestSubmit}
                  noValidate
                >
                  <div className="form-group">
                    <label htmlFor="forgot-password-email">
                      Email address *
                    </label>
                    <input
                      ref={emailInputRef}
                      type="email"
                      className={`form-control${requestErrors.email ? " auth-input-error" : ""}`}
                      id="forgot-password-email"
                      name="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setRequestErrors({});
                        setFormError(null);
                      }}
                      aria-invalid={Boolean(requestErrors.email)}
                      aria-describedby={
                        requestErrors.email
                          ? "forgot-password-email-error"
                          : undefined
                      }
                      required
                    />
                    {requestErrors.email && (
                      <small
                        id="forgot-password-email-error"
                        className="auth-field-error"
                        role="alert"
                      >
                        {requestErrors.email}
                      </small>
                    )}
                  </div>

                  {formError && (
                    <div
                      className="alert alert-danger"
                      role="alert"
                      aria-live="polite"
                    >
                      {formError}
                    </div>
                  )}

                  <div className="auth-reset-actions">
                    <button
                      type="submit"
                      className="btn btn-outline-primary-2 auth-submit-button"
                      disabled={isSubmitting}
                    >
                      <span>
                        {isSubmitting ? "SENDING..." : "SEND RESET CODE"}
                      </span>
                      <i className="icon-long-arrow-right" aria-hidden="true" />
                    </button>
                    <Link href="/login" className="auth-return-link">
                      Back to Sign In
                    </Link>
                  </div>
                </form>
              </>
            )}

            {stage === "reset" && (
              <>
                <div className="auth-form-heading">
                  <h1 ref={resetHeadingRef} id="reset-password-heading" tabIndex={-1}>
                    Enter your reset code
                  </h1>
                  <p>
                    Use the code sent to <strong>{submittedEmail}</strong>. The
                    code expires after 10 minutes.
                  </p>
                </div>

                <form
                  className="auth-form"
                  aria-labelledby="reset-password-heading"
                  onSubmit={handleResetSubmit}
                  noValidate
                >
                  <div className="form-group">
                    <label id="password-reset-otp-label">Reset code *</label>
                    <OtpInput
                      value={otp}
                      onChange={(value) => {
                        setOtp(value);
                        setResetErrors((current) => ({
                          ...current,
                          otp: undefined,
                        }));
                        setFormError(null);
                      }}
                      disabled={isSubmitting}
                      idPrefix="password-reset-otp"
                      ariaLabelledBy="password-reset-otp-label"
                      ariaDescribedBy={
                        resetErrors.otp ? "password-reset-otp-error" : undefined
                      }
                      invalid={Boolean(resetErrors.otp)}
                    />
                    {resetErrors.otp && (
                      <small
                        id="password-reset-otp-error"
                        className="auth-field-error"
                        role="alert"
                      >
                        {resetErrors.otp}
                      </small>
                    )}
                  </div>

                  <PasswordField
                    id="reset-password-new"
                    label="New password"
                    name="newPassword"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(value) => {
                      setNewPassword(value);
                      setResetErrors((current) => ({
                        ...current,
                        newPassword: undefined,
                        confirmPassword: undefined,
                      }));
                      setFormError(null);
                    }}
                    error={resetErrors.newPassword}
                    hint="Use at least 8 characters."
                    minLength={8}
                    disabled={isSubmitting}
                  />

                  <PasswordField
                    id="reset-password-confirm"
                    label="Confirm new password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(value) => {
                      setConfirmPassword(value);
                      setResetErrors((current) => ({
                        ...current,
                        confirmPassword: undefined,
                      }));
                      setFormError(null);
                    }}
                    error={resetErrors.confirmPassword}
                    minLength={8}
                    disabled={isSubmitting}
                  />

                  {formMessage && (
                    <div
                      className="alert alert-success"
                      role="status"
                      aria-live="polite"
                    >
                      {formMessage}
                    </div>
                  )}

                  {formError && (
                    <div
                      className="alert alert-danger"
                      role="alert"
                      aria-live="polite"
                    >
                      {formError}
                    </div>
                  )}

                  <div className="auth-reset-actions">
                    <button
                      type="submit"
                      className="btn btn-outline-primary-2 auth-submit-button"
                      disabled={isSubmitting}
                    >
                      <span>
                        {isSubmitting ? "RESETTING..." : "RESET PASSWORD"}
                      </span>
                      <i className="icon-long-arrow-right" aria-hidden="true" />
                    </button>

                    <div className="auth-reset-secondary-actions">
                      <button
                        type="button"
                        className="btn btn-link"
                        onClick={handleResend}
                        disabled={cooldown > 0 || isResending || isSubmitting}
                      >
                        {isResending
                          ? "Sending..."
                          : cooldown > 0
                            ? `Send again in ${cooldown}s`
                            : "Send another code"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-link"
                        onClick={handleChangeEmail}
                        disabled={isSubmitting}
                      >
                        Use a different email
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}

            {stage === "success" && (
              <div className="auth-reset-success" role="status">
                <i className="icon-check" aria-hidden="true" />
                <div className="auth-form-heading">
                  <h1 ref={resetHeadingRef} tabIndex={-1}>
                    Password updated
                  </h1>
                  <p>
                    Your password has been reset. You can now sign in with your
                    new password.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="btn btn-outline-primary-2 auth-submit-button"
                >
                  <span>CONTINUE TO SIGN IN</span>
                  <i className="icon-long-arrow-right" aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
