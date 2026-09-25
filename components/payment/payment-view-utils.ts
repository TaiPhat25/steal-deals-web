import type { TransactionResponse, TransactionStatus } from "@/lib/api/payment";

export function formatPaymentPrice(value: number) {
  return `${value.toLocaleString("en-US")} VND`;
}

export function formatPaymentDate(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(parsePaymentDateMs(value)));
}

export function getTransactionStatusLabel(status: string) {
  if (status === "RefundPending") return "Refund pending";
  if (status === "RefundFailed") return "Refund failed";
  return status;
}

export function getPaymentStatusTone(status: string) {
  if (status === "Success" || status === "Refunded") return "success";
  if (status === "Failed" || status === "Expired" || status === "RefundFailed") return "danger";
  if (status === "RefundPending") return "warning";
  return "pending";
}

export function getRemainingSeconds(expiresAt: string | null, now = Date.now()) {
  if (!expiresAt) return null;

  const remainingMs = parsePaymentDateMs(expiresAt) - now;
  if (!Number.isFinite(remainingMs)) return null;

  return Math.max(0, Math.floor(remainingMs / 1000));
}

function parsePaymentDateMs(value: string) {
  const trimmedValue = value
    .trim()
    .replace(/(\.\d{3})\d+/, "$1");
  const hasTimeZone = /(?:z|[+-]\d{2}:?\d{2})$/i.test(trimmedValue);
  const normalizedValue = hasTimeZone ? trimmedValue : `${trimmedValue}Z`;

  return new Date(normalizedValue).getTime();
}

export function formatRemainingSeconds(seconds: number | null) {
  if (seconds === null) return "-";
  if (seconds <= 0) return "Expired";

  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  return `${minutes}m ${String(rest).padStart(2, "0")}s`;
}

export function canPayTransaction(transaction: TransactionResponse | null, now = Date.now()) {
  if (!transaction || transaction.status !== "Pending" || !transaction.checkoutUrl) {
    return false;
  }

  const remainingSeconds = getRemainingSeconds(transaction.expiresAt, now);
  return remainingSeconds === null || remainingSeconds > 0;
}

export function hasPendingCheckoutUrl(transaction: TransactionResponse | null) {
  return Boolean(transaction?.status === "Pending" && transaction.checkoutUrl);
}

export function isTerminalTransactionStatus(status: TransactionStatus | string) {
  return [
    "Success",
    "Failed",
    "Expired",
    "RefundPending",
    "Refunded",
    "RefundFailed",
  ].includes(status);
}
