export type StoreOrderItem = {
  id: string;
  bagId: string;
  bagNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  subtotal: number;
};

export type StoreOrder = {
  id: string;
  userId: string;
  storeId: string;
  storeNameSnapshot: string;
  deliveryFee: number;
  voucherDiscount: number;
  totalAmount: number;
  deliveryType: "Pickup" | "Delivery";
  deliveryAddress: string;
  pickupCode: string | null;
  status: "Pending" | "Confirmed" | "Preparing" | "ReadyForPickup" | "Completed" | "Cancelled";
  pickupDeadline: string | null;
  createdAt: string;
  updatedAt: string;
  items: StoreOrderItem[];
};

export const demoOrders: StoreOrder[] = [
  {
    id: "SD-20260804-001",
    userId: "buyer-demo-001",
    storeId: "8f3522c1-7d86-4b25-b8fe-5cbf8a101001",
    storeNameSnapshot: "Morning Oven Bakery",
    deliveryFee: 0,
    voucherDiscount: 0,
    totalAmount: 114000,
    deliveryType: "Pickup",
    deliveryAddress: "12 Nguyen Trai Street, District 1, Ho Chi Minh City",
    pickupCode: "A7K3P9Q2",
    status: "ReadyForPickup",
    pickupDeadline: "2026-08-04T19:00:00+07:00",
    createdAt: "2026-08-04T09:15:00+07:00",
    updatedAt: "2026-08-04T16:30:00+07:00",
    items: [
      {
        id: "order-item-001",
        bagId: "137b2d0d-0c73-4fe2-9e23-100000000001",
        bagNameSnapshot: "Bakery Breakfast Surprise Bag",
        unitPriceSnapshot: 45000,
        quantity: 1,
        subtotal: 45000,
      },
      {
        id: "order-item-002",
        bagId: "137b2d0d-0c73-4fe2-9e23-100000000002",
        bagNameSnapshot: "End-of-Day Bakery Mix",
        unitPriceSnapshot: 69000,
        quantity: 1,
        subtotal: 69000,
      },
    ],
  },
  {
    id: "SD-20260802-014",
    userId: "buyer-demo-001",
    storeId: "8f3522c1-7d86-4b25-b8fe-5cbf8a101002",
    storeNameSnapshot: "Green Basket Market",
    deliveryFee: 0,
    voucherDiscount: 10000,
    totalAmount: 49000,
    deliveryType: "Pickup",
    deliveryAddress: "48 Le Loi Street, District 1, Ho Chi Minh City",
    pickupCode: null,
    status: "Completed",
    pickupDeadline: "2026-08-02T20:00:00+07:00",
    createdAt: "2026-08-02T10:20:00+07:00",
    updatedAt: "2026-08-02T18:10:00+07:00",
    items: [
      {
        id: "order-item-003",
        bagId: "137b2d0d-0c73-4fe2-9e23-100000000010",
        bagNameSnapshot: "Market Fresh Vegetable Bag",
        unitPriceSnapshot: 59000,
        quantity: 1,
        subtotal: 59000,
      },
    ],
  },
  {
    id: "SD-20260728-008",
    userId: "buyer-demo-001",
    storeId: "8f3522c1-7d86-4b25-b8fe-5cbf8a101003",
    storeNameSnapshot: "Harbor Fresh Foods",
    deliveryFee: 25000,
    voucherDiscount: 0,
    totalAmount: 214000,
    deliveryType: "Delivery",
    deliveryAddress: "25 Vo Van Tan Street, District 3, Ho Chi Minh City",
    pickupCode: null,
    status: "Completed",
    pickupDeadline: null,
    createdAt: "2026-07-28T14:05:00+07:00",
    updatedAt: "2026-07-28T18:45:00+07:00",
    items: [
      {
        id: "order-item-004",
        bagId: "137b2d0d-0c73-4fe2-9e23-100000000020",
        bagNameSnapshot: "Seafood Family Surprise Bag",
        unitPriceSnapshot: 189000,
        quantity: 1,
        subtotal: 189000,
      },
    ],
  },
];

export function formatOrderPrice(value: number) {
  return `${value.toLocaleString("en-US")} VND`;
}

export function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function getOrderStatusLabel(status: StoreOrder["status"]) {
  if (status === "ReadyForPickup") return "Ready for pickup";
  return status;
}
