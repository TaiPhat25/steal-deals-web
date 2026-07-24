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

export type BagStatus = "Active" | "Draft" | "Sold out";
export type SurplusBag = {
  id: string;
  name: string;
  category: string;
  description: string;
  quantity: number;
  originalPrice: number;
  price: number;
  pickupStart: string;
  pickupEnd: string;
  status: BagStatus;
  imageName?: string;
};

export type OrderStatus =
  | "New"
  | "Confirmed"
  | "Ready for pickup"
  | "Completed"
  | "Cancelled";
export type SellerOrder = {
  id: string;
  customer: string;
  email: string;
  items: Array<{ productId: string; name: string; quantity: number; price: number }>;
  paymentStatus: "Paid" | "Pending";
  status: OrderStatus;
  date: string;
  pickupCode: string;
  pickupWindow: string;
};

export type OperatingHour = {
  day: string;
  active: boolean;
  open: string;
  close: string;
};
export type StoreSettings = {
  name: string;
  slug: string;
  phone: string;
  email: string;
  description: string;
  logoName?: string;
  coverName?: string;
  hours: OperatingHour[];
};

const INITIAL_PRODUCTS: SurplusBag[] = [
  { id: "bag-101", name: "Bakery Surprise Bag", category: "Bakery", description: "A mixed selection of breads and pastries left at closing.", quantity: 6, originalPrice: 18, price: 6, pickupStart: "17:30", pickupEnd: "18:30", status: "Active" },
  { id: "bag-102", name: "Fresh Lunch Bag", category: "Prepared meals", description: "Chef-selected lunch items prepared today.", quantity: 3, originalPrice: 24, price: 8, pickupStart: "14:00", pickupEnd: "15:00", status: "Active" },
  { id: "bag-103", name: "Fruit and Veg Rescue", category: "Produce", description: "Seasonal produce suitable for cooking or smoothies.", quantity: 0, originalPrice: 15, price: 5, pickupStart: "19:00", pickupEnd: "20:00", status: "Sold out" },
  { id: "bag-104", name: "Dessert Box", category: "Desserts", description: "A surprise mix of slices, cookies, and small desserts.", quantity: 4, originalPrice: 21, price: 7, pickupStart: "20:00", pickupEnd: "21:00", status: "Draft" },
  { id: "bag-105", name: "Grocery Essentials", category: "Groceries", description: "Useful short-date pantry and refrigerated essentials.", quantity: 8, originalPrice: 30, price: 10, pickupStart: "18:00", pickupEnd: "19:30", status: "Active" },
  { id: "bag-106", name: "Cafe Treat Bag", category: "Bakery", description: "Cakes, pastries, and sandwiches from today's counter.", quantity: 2, originalPrice: 18, price: 6, pickupStart: "16:30", pickupEnd: "17:30", status: "Active" },
];

const INITIAL_ORDERS: SellerOrder[] = [
  { id: "ORD-73423", customer: "James Smith", email: "james@example.com", items: [{ productId: "bag-101", name: "Bakery Surprise Bag", quantity: 1, price: 6 }], paymentStatus: "Paid", status: "New", date: "2027-09-16", pickupCode: "5821", pickupWindow: "17:30–18:30" },
  { id: "ORD-73424", customer: "Mary Johnson", email: "mary@example.com", items: [{ productId: "bag-102", name: "Fresh Lunch Bag", quantity: 2, price: 8 }], paymentStatus: "Paid", status: "Confirmed", date: "2027-09-16", pickupCode: "1934", pickupWindow: "14:00–15:00" },
  { id: "ORD-73425", customer: "John Williams", email: "john@example.com", items: [{ productId: "bag-105", name: "Grocery Essentials", quantity: 1, price: 10 }], paymentStatus: "Pending", status: "New", date: "2027-09-15", pickupCode: "7460", pickupWindow: "18:00–19:30" },
  { id: "ORD-73426", customer: "Patricia Brown", email: "patricia@example.com", items: [{ productId: "bag-101", name: "Bakery Surprise Bag", quantity: 1, price: 6 }, { productId: "bag-106", name: "Cafe Treat Bag", quantity: 1, price: 6 }], paymentStatus: "Paid", status: "Ready for pickup", date: "2027-09-15", pickupCode: "4208", pickupWindow: "17:30–18:30" },
  { id: "ORD-73427", customer: "Nora Garcia", email: "nora@example.com", items: [{ productId: "bag-103", name: "Fruit and Veg Rescue", quantity: 1, price: 5 }], paymentStatus: "Paid", status: "Completed", date: "2027-09-14", pickupCode: "3359", pickupWindow: "19:00–20:00" },
  { id: "ORD-73428", customer: "Ali Rahman", email: "ali@example.com", items: [{ productId: "bag-102", name: "Fresh Lunch Bag", quantity: 1, price: 8 }], paymentStatus: "Paid", status: "Cancelled", date: "2027-09-14", pickupCode: "9012", pickupWindow: "14:00–15:00" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const INITIAL_SETTINGS: StoreSettings = {
  name: "Steal Deals Shop",
  slug: "steal-deals-shop",
  phone: "+1 555-0128",
  email: "shop@stealdeals.com",
  description: "Fresh surplus food rescued daily and ready for collection.",
  hours: DAYS.map((day, index) => ({
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
