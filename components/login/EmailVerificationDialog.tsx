"use client";

import { useEffect, useRef, useState, type SubmitEvent } from "react";
import OtpInput from "@/components/auth/OtpInput";
import ResendOtpButton from "@/components/auth/ResendOtpButton";
import { verifyEmail } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

type EmailVerificationDialogProps = {
  email: string;
  onExit: () => void;
};

export default function EmailVerificationDialog({
  email,
  onExit,
}: EmailVerificationDialogProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const isVerifyingRef = useRef(false);

  useEffect(() => {
    isVerifyingRef.current = isVerifying;
  }, [isVerifying]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      const firstOtpInput = dialog.querySelector<HTMLInputElement>(".otp-input");
      (firstOtpInput ?? dialog).focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isVerifyingRef.current) {
        event.preventDefault();
        onExit();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      } else if (!dialog.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      previouslyFocusedElement?.focus();
    };
  }, [onExit]);

  const focusFirstOtpInput = () => {
    window.requestAnimationFrame(() => {
      dialogRef.current
        ?.querySelector<HTMLInputElement>(".otp-input")
        ?.focus();
    });
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const normalizedOtp = otp.replace(/\D/g, "");
    if (!/^\d{6}$/.test(normalizedOtp)) {
      setError("Please enter the 6-digit verification code.");
      focusFirstOtpInput();
      return;
    }

    setIsVerifying(true);

    try {
      await verifyEmail({ email, otp: normalizedOtp });
      onExit();
    } catch (verificationError) {
      setError(
        verificationError instanceof ApiClientError &&
          verificationError.status === 400
          ? "The verification code is incorrect or expired."
          : verificationError instanceof ApiClientError
            ? verificationError.message
            : "Unable to verify your email. Please try again.",
      );
      focusFirstOtpInput();
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" aria-hidden="true" />
      <div
        ref={dialogRef}
        className="modal fade show"
        role="dialog"
        aria-modal="true"
        aria-labelledby="verify-email-title"
        aria-describedby="verify-email-description"
        tabIndex={-1}
        style={{ display: "block" }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-body">
              <div className="form-box">
                <div className="form-tab">
                  <h2 id="verify-email-title" className="text-center mb-2">
                    Verify Your Email
                  </h2>
                  <p
                    id="verify-email-description"
                    className="text-center mb-3"
                  >
                    Enter the OTP sent to your email address.
                  </p>

                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="verification-email">
                        Email address *
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="verification-email"
                        value={email}
                        autoComplete="email"
                        readOnly
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label id="verification-otp-label">
                        Verification code *
                      </label>
                      <OtpInput
                        value={otp}
                        onChange={setOtp}
                        disabled={isVerifying}
                        idPrefix="verification-otp"
                        ariaLabelledBy="verification-otp-label"
                      />
                    </div>

                    {error && (
                      <div
                        className="alert alert-danger"
                        role="alert"
                        aria-live="polite"
                      >
                        {error}
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
                          <i
                            className="icon-long-arrow-right"
                            aria-hidden="true"
                          />
                        </button>
                        <ResendOtpButton
                          email={email}
                          initialCooldownSeconds={30}
                          disabled={isVerifying}
                          onResent={() => {
                            setOtp("");
                            setError(null);
                            focusFirstOtpInput();
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-link"
                        onClick={onExit}
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
  );
}
