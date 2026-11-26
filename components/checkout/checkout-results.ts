import { ApiClientError } from "@/lib/api/client";
import type { OrderResponse } from "@/lib/api/dashboard-types";

export type CheckoutFailure = {
  storeId: string;
  storeName: string;
  message: string;
  reasonCode?: string;
  score?: number;
  restrictedUntilUtc?: string;
  maxPendingOrders?: number;
  requiresOrderCheck: boolean;
};

type StoreCheckout = { storeId: string; storeName: string };

export function checkoutFailure(store: StoreCheckout, error: unknown): CheckoutFailure {
  const details = error instanceof ApiClientError
    && typeof error.details === "object" && error.details !== null
    ? error.details as Record<string, unknown>
    : {};
  const reasonCode = typeof details.reasonCode === "string" ? details.reasonCode : undefined;
  const isPolicy = error instanceof ApiClientError && (
    (error.status === 403 && reasonCode === "TrustScorePurchaseSuspended")
    || (error.status === 409 && reasonCode === "PendingOrderLimitReached")
  );
  // A lost response or an unclassified server failure may follow a committed order.
  const requiresOrderCheck = !(error instanceof ApiClientError)
    || (error.status >= 500 && !(error.status === 503 && reasonCode === "DependencyUnavailable"));
  const message = requiresOrderCheck
    ? "We could not confirm whether this order was created."
    : error instanceof Error ? error.message : "Unable to place this order.";

  return {
    ...store,
    message,
    reasonCode,
    requiresOrderCheck,
    ...(isPolicy ? {
      score: typeof details.score === "number" ? details.score : undefined,
      restrictedUntilUtc: typeof details.restrictedUntilUtc === "string"
        ? details.restrictedUntilUtc : undefined,
      maxPendingOrders: typeof details.maxPendingOrders === "number"
        ? details.maxPendingOrders : undefined,
    } : {}),
  };
}

export async function submitStoreOrders<T extends StoreCheckout>(
  stores: T[],
  create: (store: T) => Promise<OrderResponse>,
) {
  const results = await Promise.allSettled(stores.map((store) => create(store)));
  const orders: OrderResponse[] = [];
  const failures: CheckoutFailure[] = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      orders.push(result.value);
    } else {
      failures.push(checkoutFailure(stores[index], result.reason));
    }
  });

  return { orders, failures };
}
