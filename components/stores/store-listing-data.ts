import type {
  StoreProfile,
  StoreSurpriseBag,
} from "@/components/stores/store-profile-data";

export const NEW_STORE_WINDOW_DAYS = 30;

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

export function isPublicStore(
  store: Pick<StoreProfile, "isActive" | "isVerify">,
) {
  return store.isActive && store.isVerify;
}

export function isNewStore(
  store: Pick<StoreProfile, "createdAt">,
  now = Date.now(),
) {
  const createdAt = Date.parse(store.createdAt);
  if (!Number.isFinite(createdAt) || createdAt > now) return false;

  return now - createdAt <= NEW_STORE_WINDOW_DAYS * DAY_IN_MILLISECONDS;
}

export function getAvailableBagQuantity(
  bags: Pick<StoreSurpriseBag, "quantityRemaining">[],
) {
  return bags.reduce((total, bag) => {
    if (!Number.isFinite(bag.quantityRemaining)) return total;
    return total + Math.max(0, bag.quantityRemaining);
  }, 0);
}
