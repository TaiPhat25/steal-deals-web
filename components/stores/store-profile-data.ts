export type Category = {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  isActive: boolean;
};

export type StoreReview = {
  id: string;
  orderId: string;
  buyerId: string;
  storeId: string;
  bagId: string;
  ratingScore: number;
  comment: string | null;
  storeReply: string | null;
  isReported: boolean;
  createdAt: string;
};

export type StoreSurpriseBag = {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  originalPrice: number;
  salePrice: number;
  quantityTotal: number;
  quantityRemaining: number;
  pickupStartTime: string;
  pickupEndTime: string;
  expiryDate: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  categories: Category[];
  storeReviews: StoreReview[];
};

export type StoreProfile = {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  avatarUrl: string | null;
  phone: string | null;
  bankAccount: string | null;
  ratingScore: number;
  licenseUrl: string | null;
  isVerify: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  surpriseBags: StoreSurpriseBag[];
  storeReviews: StoreReview[];
};

const bakery: Category = {
  id: "10000000-0000-0000-0000-000000000001",
  name: "Bakery",
  slug: "bakery",
  iconUrl: null,
  isActive: true,
};

const produce: Category = {
  id: "10000000-0000-0000-0000-000000000002",
  name: "Produce",
  slug: "produce",
  iconUrl: null,
  isActive: true,
};

const seafood: Category = {
  id: "10000000-0000-0000-0000-000000000003",
  name: "Seafood",
  slug: "seafood",
  iconUrl: null,
  isActive: true,
};

const morningOvenId = "8f3522c1-7d86-4b25-b8fe-5cbf8a101001";
const greenBasketId = "8f3522c1-7d86-4b25-b8fe-5cbf8a101002";
const harborFreshId = "8f3522c1-7d86-4b25-b8fe-5cbf8a101003";

export const storeProfiles: StoreProfile[] = [
  {
    id: morningOvenId,
    ownerId: "45a26c2e-19f0-4c73-88d4-3fb5b8d21001",
    name: "Morning Oven Bakery",
    description: "Fresh bread and pastries rescued at the end of each day.",
    address: "12 Nguyen Trai Street, District 1, Ho Chi Minh City",
    latitude: 10.7715,
    longitude: 106.701,
    avatarUrl: "/assets/images/demos/demo-28/banners/banner-1.jpg",
    phone: "+84 28 3822 1001",
    bankAccount: "VCB 0011001001",
    ratingScore: 4.8,
    licenseUrl: "/assets/images/demos/demo-28/banners/banner-1.jpg",
    isVerify: true,
    isActive: true,
    createdAt: "2026-07-02T08:30:00.000Z",
    updatedAt: "2026-07-29T11:00:00.000Z",
    surpriseBags: [
      {
        id: "137b2d0d-0c73-4fe2-9e23-100000000001",
        storeId: morningOvenId,
        name: "Bakery Breakfast Surprise Bag",
        description: "A mixed selection of breads and pastries left at closing.",
        originalPrice: 95000,
        salePrice: 45000,
        quantityTotal: 8,
        quantityRemaining: 4,
        pickupStartTime: "2026-08-03T17:00:00+07:00",
        pickupEndTime: "2026-08-03T19:00:00+07:00",
        expiryDate: "2026-08-03T23:59:00+07:00",
        status: "Active",
        createdAt: "2026-07-29T09:00:00.000Z",
        updatedAt: null,
        categories: [bakery],
        storeReviews: [],
      },
      {
        id: "137b2d0d-0c73-4fe2-9e23-100000000002",
        storeId: morningOvenId,
        name: "End-of-Day Bakery Mix",
        description: "A surprise box of rolls, croissants, and sweet pastries.",
        originalPrice: 150000,
        salePrice: 69000,
        quantityTotal: 10,
        quantityRemaining: 8,
        pickupStartTime: "2026-08-04T17:00:00+07:00",
        pickupEndTime: "2026-08-04T19:00:00+07:00",
        expiryDate: "2026-08-04T23:59:00+07:00",
        status: "Active",
        createdAt: "2026-07-30T09:00:00.000Z",
        updatedAt: null,
        categories: [bakery],
        storeReviews: [],
      },
      {
        id: "137b2d0d-0c73-4fe2-9e23-100000000003",
        storeId: morningOvenId,
        name: "End-of-Day Bakery Mix",
        description: "A surprise box of rolls, croissants, and sweet pastries.",
        originalPrice: 150000,
        salePrice: 69000,
        quantityTotal: 10,
        quantityRemaining: 8,
        pickupStartTime: "2026-08-04T17:00:00+07:00",
        pickupEndTime: "2026-08-04T19:00:00+07:00",
        expiryDate: "2026-08-04T23:59:00+07:00",
        status: "Active",
        createdAt: "2026-07-30T09:00:00.000Z",
        updatedAt: null,
        categories: [bakery],
        storeReviews: [],
      },
      {
        id: "137b2d0d-0c73-4fe2-9e23-100000000004",
        storeId: morningOvenId,
        name: "End-of-Day Bakery Mix",
        description: "A surprise box of rolls, croissants, and sweet pastries.",
        originalPrice: 150000,
        salePrice: 69000,
        quantityTotal: 10,
        quantityRemaining: 8,
        pickupStartTime: "2026-08-04T17:00:00+07:00",
        pickupEndTime: "2026-08-04T19:00:00+07:00",
        expiryDate: "2026-08-04T23:59:00+07:00",
        status: "Active",
        createdAt: "2026-07-30T09:00:00.000Z",
        updatedAt: null,
        categories: [bakery],
        storeReviews: [],
      },
      {
        id: "137b2d0d-0c73-4fe2-9e23-100000000005",
        storeId: morningOvenId,
        name: "End-of-Day Bakery Mix",
        description: "A surprise box of rolls, croissants, and sweet pastries.",
        originalPrice: 150000,
        salePrice: 69000,
        quantityTotal: 10,
        quantityRemaining: 8,
        pickupStartTime: "2026-08-04T17:00:00+07:00",
        pickupEndTime: "2026-08-04T19:00:00+07:00",
        expiryDate: "2026-08-04T23:59:00+07:00",
        status: "Active",
        createdAt: "2026-07-30T09:00:00.000Z",
        updatedAt: null,
        categories: [bakery],
        storeReviews: [],
      },
      {
        id: "137b2d0d-0c73-4fe2-9e23-100000000006",
        storeId: morningOvenId,
        name: "End-of-Day Bakery Mix",
        description: "A surprise box of rolls, croissants, and sweet pastries.",
        originalPrice: 150000,
        salePrice: 69000,
        quantityTotal: 10,
        quantityRemaining: 8,
        pickupStartTime: "2026-08-04T17:00:00+07:00",
        pickupEndTime: "2026-08-04T19:00:00+07:00",
        expiryDate: "2026-08-04T23:59:00+07:00",
        status: "Active",
        createdAt: "2026-07-30T09:00:00.000Z",
        updatedAt: null,
        categories: [bakery],
        storeReviews: [],
      },

    ],
    storeReviews: [
      {
        id: "7cc92a4d-7d12-4833-a246-4c76e8f21001",
        orderId: "40000000-0000-0000-0000-000000001001",
        buyerId: "50000000-0000-0000-0000-000000001001",
        storeId: morningOvenId,
        bagId: "137b2d0d-0c73-4fe2-9e23-100000000001",
        ratingScore: 5,
        comment: "The bakery bag had a generous mix and pickup was quick.",
        storeReply: null,
        isReported: false,
        createdAt: "2026-07-30T10:00:00.000Z",
      },
      {
        id: "7cc92a4d-7d12-4833-a246-4c76e8f21002",
        orderId: "40000000-0000-0000-0000-000000001001",
        buyerId: "50000000-0000-0000-0000-000000001001",
        storeId: morningOvenId,
        bagId: "137b2d0d-0c73-4fe2-9e23-100000000001",
        ratingScore: 5,
        comment: "The bakery bag had a generous mix and pickup was quick.",
        storeReply: null,
        isReported: false,
        createdAt: "2026-07-30T10:00:00.000Z",
      },
      {
        id: "7cc92a4d-7d12-4833-a246-4c76e8f21003",
        orderId: "40000000-0000-0000-0000-000000001001",
        buyerId: "50000000-0000-0000-0000-000000001001",
        storeId: morningOvenId,
        bagId: "137b2d0d-0c73-4fe2-9e23-100000000001",
        ratingScore: 5,
        comment: "The bakery bag had a generous mix and pickup was quick.",
        storeReply: null,
        isReported: false,
        createdAt: "2026-07-30T10:00:00.000Z",
      },
    ],
  },
  {
    id: greenBasketId,
    ownerId: "45a26c2e-19f0-4c73-88d4-3fb5b8d21002",
    name: "Green Basket Market",
    description: "Seasonal fruits and vegetables available for local pickup.",
    address: "24 Le Loi Street, District 3, Ho Chi Minh City",
    latitude: 10.7791,
    longitude: 106.6922,
    avatarUrl: "/assets/images/demos/demo-28/banners/banner-3.jpg",
    phone: "+84 28 3822 1002",
    bankAccount: null,
    ratingScore: 4.7,
    licenseUrl: null,
    isVerify: true,
    isActive: true,
    createdAt: "2026-07-04T09:15:00.000Z",
    updatedAt: null,
    surpriseBags: [
      {
        id: "137b2d0d-0c73-4fe2-9e23-100000000003",
        storeId: greenBasketId,
        name: "Market Fresh Vegetable Bag",
        description: "Seasonal vegetables packed from daily surplus.",
        originalPrice: 120000,
        salePrice: 59000,
        quantityTotal: 8,
        quantityRemaining: 6,
        pickupStartTime: "2026-08-03T18:00:00+07:00",
        pickupEndTime: "2026-08-03T20:00:00+07:00",
        expiryDate: "2026-08-04T08:00:00+07:00",
        status: "Active",
        createdAt: "2026-07-30T08:20:00.000Z",
        updatedAt: null,
        categories: [produce],
        storeReviews: [],
      },
    ],
    storeReviews: [
      {
        id: "7cc92a4d-7d12-4833-a246-4c76e8f21002",
        orderId: "40000000-0000-0000-0000-000000001002",
        buyerId: "50000000-0000-0000-0000-000000001002",
        storeId: greenBasketId,
        bagId: "137b2d0d-0c73-4fe2-9e23-100000000003",
        ratingScore: 5,
        comment: "Fresh vegetables with clear pickup instructions.",
        storeReply: null,
        isReported: false,
        createdAt: "2026-07-28T16:00:00.000Z",
      },
    ],
  },
  {
    id: harborFreshId,
    ownerId: "45a26c2e-19f0-4c73-88d4-3fb5b8d21003",
    name: "Harbor Fresh Foods",
    description: "Quality meals and seafood boxes prepared for same-day pickup.",
    address: "8 Ton Duc Thang Street, District 1, Ho Chi Minh City",
    latitude: 10.7828,
    longitude: 106.7067,
    avatarUrl: "/assets/images/demos/demo-28/banners/5.jpg",
    phone: "+84 28 3822 1003",
    bankAccount: null,
    ratingScore: 4.6,
    licenseUrl: null,
    isVerify: true,
    isActive: true,
    createdAt: "2026-07-08T07:45:00.000Z",
    updatedAt: null,
    surpriseBags: [
      {
        id: "137b2d0d-0c73-4fe2-9e23-100000000004",
        storeId: harborFreshId,
        name: "Seafood Family Surprise Bag",
        description: "A same-day seafood dinner box selected by the store.",
        originalPrice: 360000,
        salePrice: 189000,
        quantityTotal: 4,
        quantityRemaining: 2,
        pickupStartTime: "2026-08-03T16:30:00+07:00",
        pickupEndTime: "2026-08-03T18:30:00+07:00",
        expiryDate: "2026-08-03T22:00:00+07:00",
        status: "Active",
        createdAt: "2026-07-31T09:30:00.000Z",
        updatedAt: null,
        categories: [seafood],
        storeReviews: [],
      },
    ],
    storeReviews: [
      {
        id: "7cc92a4d-7d12-4833-a246-4c76e8f21003",
        orderId: "40000000-0000-0000-0000-000000001003",
        buyerId: "50000000-0000-0000-0000-000000001003",
        storeId: harborFreshId,
        bagId: "137b2d0d-0c73-4fe2-9e23-100000000004",
        ratingScore: 4,
        comment: "Great value for seafood. The pickup window was accurate.",
        storeReply: null,
        isReported: false,
        createdAt: "2026-07-29T13:30:00.000Z",
      },
    ],
  },
];

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function toSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const newStoreProfiles = storeProfiles.filter((store) => store.isActive).slice(0, 5);

export function getStoreProfileByRouteId(routeId: string) {
  const normalizedRouteId = safeDecode(routeId).trim().toLowerCase();

  return storeProfiles.find(
    (store) => store.id.toLowerCase() === normalizedRouteId || toSlug(store.name) === normalizedRouteId,
  );
}
