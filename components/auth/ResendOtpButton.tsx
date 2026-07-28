"use client";

import { useEffect, useState } from "react";
import { ApiClientError } from "@/lib/api/client";
import { resendVerificationOtp } from "@/lib/api/auth";

const RESEND_COOLDOWN_SECONDS = 30;
const resendCooldowns = new Map<string, number>();

function getInitialCooldown(email: string, initialCooldownSeconds: number) {
  const cooldownUntil = email ? resendCooldowns.get(email) : undefined;

  if (cooldownUntil) {
    const remainingSeconds = Math.ceil((cooldownUntil - Date.now()) / 1000);

    if (remainingSeconds > 0) {
      return remainingSeconds;
    }

    resendCooldowns.delete(email);
  }

  return initialCooldownSeconds;
}

type ResendOtpButtonProps = {
  email: string;
  initialCooldownSeconds?: number;
  disabled?: boolean;
  onResent: () => void;
};

export default function ResendOtpButton({
  email,
  initialCooldownSeconds = 0,
  disabled = false,
  onResent,
}: ResendOtpButtonProps) {
  const [cooldown, setCooldown] = useState(() =>
    getInitialCooldown(email, initialCooldownSeconds),
  );
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown === 0) return;

    const timer = window.setInterval(() => {
      setCooldown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || isResending || disabled || !email) return;

    setError(null);
    setIsResending(true);

    try {
      await resendVerificationOtp({ email });
      onResent();
      resendCooldowns.set(email, Date.now() + RESEND_COOLDOWN_SECONDS * 1000);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (requestError) {
      setError(
        requestError instanceof ApiClientError
          ? requestError.message
          : "Unable to resend the verification code.",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="resend-otp-control text-right ml-3">
      <button
        type="button"
        className="btn btn-link p-0"
        onClick={handleResend}
        disabled={cooldown > 0 || isResending || disabled}
      >
        {isResending ? "Resending OTP..." : cooldown > 0 ? `Resend OTP (${cooldown})` : "Resend OTP"}
      </button>
      {error && <div className="small text-danger mt-1" role="alert">{error}</div>}
    </div>
  );
}
