"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import type { SurpriseBag } from "@/components/home/SurpriseBagCard";
import {
  addCartItem,
  clearAllCarts,
  removeCartItem,
  updateCartItemQuantity,
} from "@/lib/api/cart";

export type CartItem = {
  bag: SurpriseBag;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (bag: SurpriseBag, quantity?: number) => void;
  updateQuantity: (bagKey: string, quantity: number) => void;
  removeItem: (bagKey: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function cartBagKey(bag: SurpriseBag) {
  return bag.backendId ?? bag.slug;
}

function clampQuantity(quantity: number, maximum: number) {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(maximum, Math.max(1, Math.floor(quantity)));
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  function mirrorCartRequest(request: () => Promise<unknown>) {
    if (!accessToken) return;

    void request().catch(() => {
      // Keep the legacy cart usable if the Redis cart service is unavailable.
    });
  }

  function addItem(bag: SurpriseBag, requestedQuantity = 1) {
    const key = cartBagKey(bag);
    const quantity = clampQuantity(requestedQuantity, bag.remainingQuantity);

    setItems((current) => {
      const existing = current.find((item) => cartBagKey(item.bag) === key);

      if (!existing) return [...current, { bag, quantity }];

      return current.map((item) => item === existing
        ? { ...item, bag, quantity: clampQuantity(item.quantity + quantity, bag.remainingQuantity) }
        : item);
    });

    if (bag.backendId) {
      mirrorCartRequest(() => addCartItem(accessToken as string, {
        bagId: bag.backendId as string,
        quantity,
      }));
    }
  }

  function updateQuantity(bagKey: string, quantity: number) {
    setItems((current) => current.map((item) => item.bag.backendId === bagKey || item.bag.slug === bagKey
      ? { ...item, quantity: clampQuantity(quantity, item.bag.remainingQuantity) }
      : item));

    const item = items.find((current) => current.bag.backendId === bagKey || current.bag.slug === bagKey);
    if (item?.bag.backendId && item.bag.storeId) {
      mirrorCartRequest(() => updateCartItemQuantity(
        accessToken as string,
        item.bag.storeId as string,
        item.bag.backendId as string,
        { quantity: clampQuantity(quantity, item.bag.remainingQuantity) },
      ));
    }
  }

  function removeItem(bagKey: string) {
    setItems((current) => current.filter((item) => item.bag.backendId !== bagKey && item.bag.slug !== bagKey));

    const item = items.find((current) => current.bag.backendId === bagKey || current.bag.slug === bagKey);
    if (item?.bag.backendId && item.bag.storeId) {
      mirrorCartRequest(() => removeCartItem(
        accessToken as string,
        item.bag.storeId as string,
        item.bag.backendId as string,
      ));
    }
  }

  const value = useMemo<CartContextValue>(() => ({
    items,
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.bag.salePrice * item.quantity, 0),
    addItem,
    updateQuantity,
    removeItem,
    clearCart: () => {
      setItems([]);
      mirrorCartRequest(() => clearAllCarts(accessToken as string));
    },
  }), [items, accessToken]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) throw new Error("useCart must be used inside CartProvider.");

  return context;
}
