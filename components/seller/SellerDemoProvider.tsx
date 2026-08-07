"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type {
  CategoryResponse,
  OrderResponse,
  StoreProfileResponse,
  SurpriseBagResponse,
} from "@/lib/api/dashboard-types";

export type BagStatus = "Active" | "Draft" | "Sold out";
export type SurplusBag = Omit<SurpriseBagResponse, "status"> & {
  status: BagStatus;
  imageName?: string;
};
export type OrderStatus =
  | "Pending"
  | "InventoryReservationFailed"
  | "PaymentFailed"
  | "Confirmed"
  | "Cancelled";
export type SellerOrder = Omit<OrderResponse, "status"> & { status: OrderStatus };

export type OperatingHour = {
  day: string;
  active: boolean;
  open: string;
  close: string;
};
export type StoreSettings = StoreProfileResponse & {
  bankAccount: string;
  licenseUrl: string;
  operatingHours: OperatingHour[];
  avatarImageName?: string;
  coverImageName?: string;
};

export const DEMO_CATEGORIES: CategoryResponse[] = [
  { id: "10000000-0000-0000-0000-000000000001", name: "Bakery", slug: "bakery", iconUrl: null, isActive: true },
  { id: "10000000-0000-0000-0000-000000000002", name: "Prepared meals", slug: "prepared-meals", iconUrl: null, isActive: true },
  { id: "10000000-0000-0000-0000-000000000003", name: "Produce", slug: "produce", iconUrl: null, isActive: true },
  { id: "10000000-0000-0000-0000-000000000004", name: "Desserts", slug: "desserts", iconUrl: null, isActive: true },
  { id: "10000000-0000-0000-0000-000000000005", name: "Groceries", slug: "groceries", iconUrl: null, isActive: true },
];

const STORE_ID = "20000000-0000-0000-0000-000000000001";

export const DEMO_CUSTOMER_NAMES: Record<string, string> = {
  "50000000-0000-0000-0000-000000000001": "Linh Nguyen",
  "50000000-0000-0000-0000-000000000002": "Daniel Lee",
  "50000000-0000-0000-0000-000000000003": "Mai Tran",
  "50000000-0000-0000-0000-000000000004": "An Pham",
  "50000000-0000-0000-0000-000000000005": "Huy Le",
};

const INITIAL_PRODUCTS: SurplusBag[] = [
  { id: "30000000-0000-0000-0000-000000000101", storeId: STORE_ID, storeName: "Steal Deals Shop", name: "Bakery Surprise Bag", description: "A mixed selection of breads and pastries left at closing.", originalPrice: 180000, salePrice: 60000, quantityTotal: 10, quantityRemaining: 6, pickupStartTime: "2026-07-30T17:30:00+07:00", pickupEndTime: "2026-07-30T18:30:00+07:00", expiryDate: "2026-07-30T23:59:00+07:00", status: "Active", categories: [DEMO_CATEGORIES[0]], createdAt: "2026-07-28T09:00:00+07:00" },
  { id: "30000000-0000-0000-0000-000000000102", storeId: STORE_ID, storeName: "Steal Deals Shop", name: "Fresh Lunch Bag", description: "Chef-selected lunch items prepared today.", originalPrice: 240000, salePrice: 80000, quantityTotal: 8, quantityRemaining: 3, pickupStartTime: "2026-07-30T14:00:00+07:00", pickupEndTime: "2026-07-30T15:00:00+07:00", expiryDate: "2026-07-30T18:00:00+07:00", status: "Active", categories: [DEMO_CATEGORIES[1]], createdAt: "2026-07-28T09:10:00+07:00" },
  { id: "30000000-0000-0000-0000-000000000103", storeId: STORE_ID, storeName: "Steal Deals Shop", name: "Fruit and Veg Rescue", description: "Seasonal produce suitable for cooking or smoothies.", originalPrice: 150000, salePrice: 50000, quantityTotal: 7, quantityRemaining: 0, pickupStartTime: "2026-07-30T19:00:00+07:00", pickupEndTime: "2026-07-30T20:00:00+07:00", expiryDate: "2026-07-31T10:00:00+07:00", status: "Sold out", categories: [DEMO_CATEGORIES[2]], createdAt: "2026-07-28T09:20:00+07:00" },
  { id: "30000000-0000-0000-0000-000000000104", storeId: STORE_ID, storeName: "Steal Deals Shop", name: "Dessert Box", description: "A surprise mix of slices, cookies, and small desserts.", originalPrice: 210000, salePrice: 70000, quantityTotal: 4, quantityRemaining: 4, pickupStartTime: "2026-07-30T20:00:00+07:00", pickupEndTime: "2026-07-30T21:00:00+07:00", expiryDate: "2026-07-31T08:00:00+07:00", status: "Draft", categories: [DEMO_CATEGORIES[3]], createdAt: "2026-07-29T11:00:00+07:00" },
  { id: "30000000-0000-0000-0000-000000000105", storeId: STORE_ID, storeName: "Steal Deals Shop", name: "Grocery Essentials", description: "Useful short-date pantry and refrigerated essentials.", originalPrice: 300000, salePrice: 100000, quantityTotal: 12, quantityRemaining: 8, pickupStartTime: "2026-07-30T18:00:00+07:00", pickupEndTime: "2026-07-30T19:30:00+07:00", expiryDate: "2026-08-01T12:00:00+07:00", status: "Active", categories: [DEMO_CATEGORIES[4]], createdAt: "2026-07-29T11:10:00+07:00" },
];

const INITIAL_ORDERS: SellerOrder[] = [
  { id: "40000000-0000-0000-0000-000000000001", userId: "50000000-0000-0000-0000-000000000001", storeId: STORE_ID, storeNameSnapshot: "Steal Deals Shop", deliveryFee: 0, voucherDiscount: 0, totalAmount: 60000, deliveryType: "Pickup", deliveryAddress: "18 Nguyen Hue, District 1, Ho Chi Minh City", pickupCode: "5821", status: "Pending", pickupDeadline: "2026-07-30T18:30:00+07:00", createdAt: "2026-07-30T09:15:00+07:00", updatedAt: "2026-07-30T09:15:00+07:00", items: [{ id: "60000000-0000-0000-0000-000000000001", bagId: "30000000-0000-0000-0000-000000000101", bagNameSnapshot: "Bakery Surprise Bag", unitPriceSnapshot: 60000, quantity: 1, subtotal: 60000 }] },
  { id: "40000000-0000-0000-0000-000000000002", userId: "50000000-0000-0000-0000-000000000002", storeId: STORE_ID, storeNameSnapshot: "Steal Deals Shop", deliveryFee: 0, voucherDiscount: 10000, totalAmount: 150000, deliveryType: "Pickup", deliveryAddress: "18 Nguyen Hue, District 1, Ho Chi Minh City", pickupCode: "1934", status: "Confirmed", pickupDeadline: "2026-07-30T15:00:00+07:00", createdAt: "2026-07-30T08:50:00+07:00", updatedAt: "2026-07-30T09:05:00+07:00", items: [{ id: "60000000-0000-0000-0000-000000000002", bagId: "30000000-0000-0000-0000-000000000102", bagNameSnapshot: "Fresh Lunch Bag", unitPriceSnapshot: 80000, quantity: 2, subtotal: 160000 }] },
  { id: "40000000-0000-0000-0000-000000000003", userId: "50000000-0000-0000-0000-000000000003", storeId: STORE_ID, storeNameSnapshot: "Steal Deals Shop", deliveryFee: 0, voucherDiscount: 0, totalAmount: 100000, deliveryType: "Pickup", deliveryAddress: "18 Nguyen Hue, District 1, Ho Chi Minh City", pickupCode: null, status: "PaymentFailed", pickupDeadline: "2026-07-30T19:30:00+07:00", createdAt: "2026-07-29T17:40:00+07:00", updatedAt: "2026-07-29T17:42:00+07:00", items: [{ id: "60000000-0000-0000-0000-000000000003", bagId: "30000000-0000-0000-0000-000000000105", bagNameSnapshot: "Grocery Essentials", unitPriceSnapshot: 100000, quantity: 1, subtotal: 100000 }] },
  { id: "40000000-0000-0000-0000-000000000004", userId: "50000000-0000-0000-0000-000000000004", storeId: STORE_ID, storeNameSnapshot: "Steal Deals Shop", deliveryFee: 0, voucherDiscount: 0, totalAmount: 120000, deliveryType: "Pickup", deliveryAddress: "18 Nguyen Hue, District 1, Ho Chi Minh City", pickupCode: null, status: "InventoryReservationFailed", pickupDeadline: null, createdAt: "2026-07-29T16:10:00+07:00", updatedAt: "2026-07-29T16:11:00+07:00", items: [{ id: "60000000-0000-0000-0000-000000000004", bagId: "30000000-0000-0000-0000-000000000101", bagNameSnapshot: "Bakery Surprise Bag", unitPriceSnapshot: 60000, quantity: 2, subtotal: 120000 }] },
  { id: "40000000-0000-0000-0000-000000000005", userId: "50000000-0000-0000-0000-000000000005", storeId: STORE_ID, storeNameSnapshot: "Steal Deals Shop", deliveryFee: 0, voucherDiscount: 0, totalAmount: 50000, deliveryType: "Pickup", deliveryAddress: "18 Nguyen Hue, District 1, Ho Chi Minh City", pickupCode: null, status: "Cancelled", pickupDeadline: "2026-07-29T20:00:00+07:00", createdAt: "2026-07-29T14:00:00+07:00", updatedAt: "2026-07-29T14:20:00+07:00", items: [{ id: "60000000-0000-0000-0000-000000000005", bagId: "30000000-0000-0000-0000-000000000103", bagNameSnapshot: "Fruit and Veg Rescue", unitPriceSnapshot: 50000, quantity: 1, subtotal: 50000 }] },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const INITIAL_SETTINGS: StoreSettings = {
  id: STORE_ID,
  ownerId: "70000000-0000-0000-0000-000000000001",
  name: "Steal Deals Shop",
  description: "Fresh surplus food rescued daily and ready for collection.",
  address: "18 Nguyen Hue, District 1, Ho Chi Minh City",
  latitude: 10.7731,
  longitude: 106.703,
  avatarUrl: null,
  phone: "+84 28 3822 1234",
  ratingScore: 4.8,
  isVerify: true,
  isActive: true,
  createdAt: "2026-01-12T08:00:00+07:00",
  bankAccount: "Vietcombank •••• 8821",
  licenseUrl: "https://example.com/licenses/steal-deals-shop.pdf",
  operatingHours: DAYS.map((day, index) => ({
    day,
    active: index < 6,
    open: index < 5 ? "09:00" : "10:00",
    close: index < 5 ? "18:00" : "16:00",
  })),
};

type SellerDemoValue = {
  products: SurplusBag[];
  setProducts: Dispatch<SetStateAction<SurplusBag[]>>;
  orders: SellerOrder[];
  setOrders: Dispatch<SetStateAction<SellerOrder[]>>;
  settings: StoreSettings;
  setSettings: Dispatch<SetStateAction<StoreSettings>>;
};

const SellerDemoContext = createContext<SellerDemoValue | null>(null);

export default function SellerDemoProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const value = useMemo(
    () => ({ products, setProducts, orders, setOrders, settings, setSettings }),
    [orders, products, settings],
  );
  return <SellerDemoContext.Provider value={value}>{children}</SellerDemoContext.Provider>;
}

export function useSellerDemo() {
  const value = useContext(SellerDemoContext);
  if (!value) throw new Error("useSellerDemo must be used inside SellerDemoProvider.");
  return value;
}
