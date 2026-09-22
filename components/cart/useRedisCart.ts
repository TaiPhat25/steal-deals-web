"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  listCarts,
  removeCartItem,
  updateCartItemQuantity,
  type CartResponse,
} from "@/lib/api/cart";
import { listStores } from "@/lib/api/store";

export type RedisCartStoreGroup = CartResponse & {
  storeName: string;
};

function fallbackStoreName(storeId: string) {
  return `Store ${storeId.slice(0, 8)}`;
}

function compareDates(left: string, right: string) {
  const leftTime = new Date(left).getTime();
  const rightTime = new Date(right).getTime();

  if (!Number.isFinite(leftTime) || !Number.isFinite(rightTime) || leftTime === rightTime) {
    return 0;
  }

  return leftTime - rightTime;
}

function compareCarts(left: CartResponse, right: CartResponse) {
  return compareDates(left.createdAtUtc, right.createdAtUtc) || left.storeId.localeCompare(right.storeId);
}

function normalizeCart(cart: CartResponse): CartResponse {
  return {
    ...cart,
    items: [...cart.items].sort((left, right) =>
      compareDates(left.addedAtUtc, right.addedAtUtc) || left.bagId.localeCompare(right.bagId),
    ),
  };
}

function replaceStoreCart(carts: CartResponse[], nextCart: CartResponse) {
  const existingIndex = carts.findIndex((cart) => cart.storeId === nextCart.storeId);

  if (existingIndex === -1) {
    return nextCart.items.length > 0
      ? [...carts, normalizeCart(nextCart)].sort(compareCarts)
      : carts;
  }

  if (nextCart.items.length === 0) {
    return carts.filter((cart) => cart.storeId !== nextCart.storeId);
  }

  return carts.map((cart, index) =>
    index === existingIndex ? normalizeCart(nextCart) : cart,
  );
}

export function useRedisCart() {
  const { accessToken } = useAuth();
  const [carts, setCarts] = useState<CartResponse[]>([]);
  const [storeNames, setStoreNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!accessToken) {
      setCarts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [cartList, stores] = await Promise.all([
        listCarts(accessToken),
        listStores().catch(() => []),
      ]);

      setCarts(cartList
        .filter((cart) => cart.items.length > 0)
        .map(normalizeCart)
        .sort(compareCarts));
      setStoreNames(
        Object.fromEntries(stores.map((store) => [store.id, store.name])),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load your cart. Please try again.",
      );
      setCarts([]);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    queueMicrotask(() => {
      void refresh();
    });
  }, [refresh]);

  const groups = useMemo<RedisCartStoreGroup[]>(
    () =>
      carts.map((cart) => ({
        ...cart,
        storeName: storeNames[cart.storeId] ?? fallbackStoreName(cart.storeId),
      })),
    [carts, storeNames],
  );

  const itemCount = useMemo(
    () => carts.reduce((count, cart) => count + cart.totalQuantity, 0),
    [carts],
  );

  const subtotal = useMemo(
    () => carts.reduce((total, cart) => total + cart.subtotal, 0),
    [carts],
  );

  const updateQuantity = useCallback(
    async (storeId: string, bagId: string, quantity: number) => {
      if (!accessToken) throw new Error("Your session has expired. Please sign in again.");

      const nextQuantity = Math.max(1, Math.floor(quantity));
      setIsMutating(true);
      setError("");

      try {
        const nextCart = await updateCartItemQuantity(accessToken, storeId, bagId, {
          quantity: nextQuantity,
        });
        setCarts((current) => replaceStoreCart(current, nextCart));
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Unable to update the cart item.";
        setError(message);
        throw new Error(message);
      } finally {
        setIsMutating(false);
      }
    },
    [accessToken],
  );

  const removeItem = useCallback(
    async (storeId: string, bagId: string) => {
      if (!accessToken) throw new Error("Your session has expired. Please sign in again.");

      setIsMutating(true);
      setError("");

      try {
        const nextCart = await removeCartItem(accessToken, storeId, bagId);
        setCarts((current) => replaceStoreCart(current, nextCart));
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Unable to remove the cart item.";
        setError(message);
        throw new Error(message);
      } finally {
        setIsMutating(false);
      }
    },
    [accessToken],
  );

  return {
    accessToken,
    carts,
    groups,
    itemCount,
    subtotal,
    isLoading,
    isMutating,
    error,
    setError,
    refresh,
    updateQuantity,
    removeItem,
  };
}
