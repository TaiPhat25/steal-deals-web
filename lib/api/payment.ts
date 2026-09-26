import { apiRequest } from "@/lib/api/client";

const PAYMENT_API_BASE_URL = process.env.NEXT_PUBLIC_PAYMENT_API_URL;

function paymentApiBaseUrl() {
  if (!PAYMENT_API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_PAYMENT_API_URL is not configured.");
  }

  return PAYMENT_API_BASE_URL;
}

function bearer(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

export type TransactionStatus =
  | "Pending"
  | "Success"
  | "Failed"
  | "Expired"
  | "RefundPending"
  | "Refunded"
  | "RefundFailed";

export type RefundResponse = {
  id: string;
  transactionId: string;
  orderId: string;
  amount: number;
  reason: string;
  status: string;
  gatewayRefundRef: string | null;
  gatewayResponseCode: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
};

export type TransactionResponse = {
  id: string;
  orderId: string;
  userId: string;
  storeId: string | null;
  amount: number;
  paymentMethod: string;
  gatewayRef: string | null;
  checkoutUrl: string | null;
  gatewayTransactionNo: string | null;
  gatewayResponseCode: string | null;
  gatewayTransactionStatus: string | null;
  status: TransactionStatus;
  failureReason: string | null;
  paidAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  refunds: RefundResponse[];
};

export type VnPayReturnVerification = {
  isValidSignature: boolean;
  isSuccess: boolean;
  gatewayRef: string | null;
  amount: number | null;
  gatewayTransactionNo: string | null;
  gatewayResponseCode: string | null;
  gatewayTransactionStatus: string | null;
  paidAtUtc: string | null;
  reason: string | null;
};

export function getTransactionByOrderId(accessToken: string, orderId: string) {
  return apiRequest<TransactionResponse>(
    `/api/transactions/order/${encodeURIComponent(orderId)}`,
    { method: "GET", headers: bearer(accessToken) },
    paymentApiBaseUrl(),
  );
}

export function getMyTransactions(accessToken: string) {
  return apiRequest<TransactionResponse[]>(
    "/api/transactions/my-transactions",
    { method: "GET", headers: bearer(accessToken) },
    paymentApiBaseUrl(),
  );
}

export function verifyVnPayReturn(queryString: string) {
  const normalizedQuery = queryString.startsWith("?") ? queryString.slice(1) : queryString;

  return apiRequest<VnPayReturnVerification>(
    `/api/vnpay/return${normalizedQuery ? `?${normalizedQuery}` : ""}`,
    { method: "GET" },
    paymentApiBaseUrl(),
  );
}
