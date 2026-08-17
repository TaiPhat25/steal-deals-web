import type { SurpriseBag } from "@/components/home/SurpriseBagCard";
import type { SurpriseBagResponse } from "@/lib/api/dashboard-types";

export type ListingBag = SurpriseBag & {
  backendId?: string;
  pickupDay: "today" | "tomorrow";
  pickupStartTime: string;
  pickupEndTime: string;
  expiryDate: string;
  quantityTotal: number;
  status: string;
  distanceKm: number;
  popularity: number;
  createdOrder: number;
};

export type ListingFilters = {
  query: string;
  categories: string[];
  pickupDay: "all" | ListingBag["pickupDay"];
  minPrice: number;
  maxPrice: number;
  minDistance: number;
  maxDistance: number;
  sort: string;
  storeSlug?: string;
};

export const surpriseBags: ListingBag[] = [
  {
    slug: "bakery-breakfast-box",
    imageSrc: "/assets/images/demos/demo-28/flash/1.jpg",
    imageAlt: "Bakery breakfast surprise bag",
    name: "Bakery Breakfast Surprise Bag",
    storeName: "Morning Oven Bakery",
    storeSlug: "morning-oven-bakery",
    category: "Bakery",
    originalPrice: 95000,
    salePrice: 45000,
    discountPercent: 53,
    pickupWindow: "Today, 5:00 - 7:00 PM",
    pickupStartTime: "2026-08-04T17:00:00+07:00",
    pickupEndTime: "2026-08-04T19:00:00+07:00",
    expiryDate: "2026-08-04T23:59:00+07:00",
    status: "Active",
    pickupDay: "today",
    distance: "1.2 km away",
    distanceKm: 1.2,
    remainingQuantity: 4,
    quantityTotal: 8,
    availabilityLabel: "Pickup today",
    popularity: 91,
    createdOrder: 9,
  },
  {
    slug: "fresh-produce-box",
    imageSrc: "/assets/images/demos/demo-28/flash/2.jpg",
    imageAlt: "Fresh vegetable surprise bag",
    name: "Market Fresh Vegetable Bag",
    storeName: "Green Basket Market",
    storeSlug: "green-basket-market",
    category: "Vegetables",
    originalPrice: 120000,
    salePrice: 59000,
    discountPercent: 51,
    pickupWindow: "Today, 6:00 - 8:00 PM",
    pickupStartTime: "2026-08-04T18:00:00+07:00",
    pickupEndTime: "2026-08-04T20:00:00+07:00",
    expiryDate: "2026-08-04T23:59:00+07:00",
    status: "Active",
    pickupDay: "today",
    distance: "2.4 km away",
    distanceKm: 2.4,
    remainingQuantity: 6,
    quantityTotal: 10,
    availabilityLabel: "Pickup today",
    popularity: 84,
    createdOrder: 8,
  },
  {
    slug: "seafood-family-box",
    imageSrc: "/assets/images/demos/demo-28/flash/3.jpg",
    imageAlt: "Seafood family surprise bag",
    name: "Seafood Family Surprise Bag",
    storeName: "Harbor Fresh Foods",
    storeSlug: "harbor-fresh-foods",
    category: "Seafood",
    originalPrice: 360000,
    salePrice: 189000,
    discountPercent: 48,
    pickupWindow: "Today, 4:30 - 6:30 PM",
    pickupStartTime: "2026-08-04T16:30:00+07:00",
    pickupEndTime: "2026-08-04T18:30:00+07:00",
    expiryDate: "2026-08-04T23:59:00+07:00",
    status: "Active",
    pickupDay: "today",
    distance: "3.1 km away",
    distanceKm: 3.1,
    remainingQuantity: 2,
    quantityTotal: 6,
    availabilityLabel: "Limited bags",
    popularity: 88,
    createdOrder: 6,
  },
  {
    slug: "fruit-and-juice-box",
    imageSrc: "/assets/images/demos/demo-28/flash/4.jpg",
    imageAlt: "Fruit and juice surprise bag",
    name: "Fruit and Juice Surprise Bag",
    storeName: "Daily Harvest Shop",
    storeSlug: "daily-harvest-shop",
    category: "Fruits",
    originalPrice: 150000,
    salePrice: 69000,
    discountPercent: 54,
    pickupWindow: "Today, 5:30 - 7:30 PM",
    pickupStartTime: "2026-08-04T17:30:00+07:00",
    pickupEndTime: "2026-08-04T19:30:00+07:00",
    expiryDate: "2026-08-04T23:59:00+07:00",
    status: "Active",
    pickupDay: "today",
    distance: "1.8 km away",
    distanceKm: 1.8,
    remainingQuantity: 5,
    quantityTotal: 10,
    availabilityLabel: "Pickup today",
    popularity: 79,
    createdOrder: 7,
  },
  {
    slug: "dairy-snack-box",
    imageSrc: "/assets/images/demos/demo-28/flash/5.jpg",
    imageAlt: "Dairy snack surprise bag",
    name: "Dairy and Snack Surprise Bag",
    storeName: "Neighborhood Grocery",
    storeSlug: "neighborhood-grocery",
    category: "Dairy & Cheese",
    originalPrice: 180000,
    salePrice: 79000,
    discountPercent: 56,
    pickupWindow: "Today, 7:00 - 9:00 PM",
    pickupStartTime: "2026-08-04T19:00:00+07:00",
    pickupEndTime: "2026-08-04T21:00:00+07:00",
    expiryDate: "2026-08-04T23:59:00+07:00",
    status: "Active",
    pickupDay: "today",
    distance: "2.7 km away",
    distanceKm: 2.7,
    remainingQuantity: 3,
    quantityTotal: 8,
    availabilityLabel: "Limited bags",
    popularity: 75,
    createdOrder: 5,
  },
  {
    slug: "prepared-dinner-box",
    imageSrc: "/assets/images/demos/demo-28/flash/6.jpg",
    imageAlt: "Prepared dinner surprise bag",
    name: "Chef's Choice Dinner Bag",
    storeName: "Local Table Kitchen",
    storeSlug: "local-table-kitchen",
    category: "Prepared Meals",
    originalPrice: 220000,
    salePrice: 105000,
    discountPercent: 52,
    pickupWindow: "Today, 7:30 - 9:00 PM",
    pickupStartTime: "2026-08-04T19:30:00+07:00",
    pickupEndTime: "2026-08-04T21:00:00+07:00",
    expiryDate: "2026-08-04T23:59:00+07:00",
    status: "Active",
    pickupDay: "today",
    distance: "3.5 km away",
    distanceKm: 3.5,
    remainingQuantity: 4,
    quantityTotal: 8,
    availabilityLabel: "Pickup today",
    popularity: 82,
    createdOrder: 10,
  },
  {
    slug: "bakery-mix-bag",
    imageSrc: "/assets/images/demos/demo-28/flash/7.jpg",
    imageAlt: "Mixed bakery surprise bag",
    name: "End-of-Day Bakery Mix",
    storeName: "Morning Oven Bakery",
    storeSlug: "morning-oven-bakery",
    category: "Bakery",
    originalPrice: 150000,
    salePrice: 69000,
    discountPercent: 54,
    pickupWindow: "Tomorrow, 5:00 - 7:00 PM",
    pickupStartTime: "2026-08-05T17:00:00+07:00",
    pickupEndTime: "2026-08-05T19:00:00+07:00",
    expiryDate: "2026-08-05T23:59:00+07:00",
    status: "Active",
    pickupDay: "tomorrow",
    distance: "1.2 km away",
    distanceKm: 1.2,
    remainingQuantity: 8,
    quantityTotal: 12,
    availabilityLabel: "Pickup tomorrow",
    popularity: 96,
    createdOrder: 12,
  },
  {
    slug: "seafood-weekend-box",
    imageSrc: "/assets/images/demos/demo-28/flash/8.jpg",
    imageAlt: "Seafood weekend surprise bag",
    name: "Seafood Weekend Surprise Bag",
    storeName: "Harbor Fresh Foods",
    storeSlug: "harbor-fresh-foods",
    category: "Seafood",
    originalPrice: 420000,
    salePrice: 219000,
    discountPercent: 48,
    pickupWindow: "Tomorrow, 4:30 - 6:30 PM",
    pickupStartTime: "2026-08-05T16:30:00+07:00",
    pickupEndTime: "2026-08-05T18:30:00+07:00",
    expiryDate: "2026-08-05T23:59:00+07:00",
    status: "Active",
    pickupDay: "tomorrow",
    distance: "3.1 km away",
    distanceKm: 3.1,
    remainingQuantity: 5,
    quantityTotal: 8,
    availabilityLabel: "Pickup tomorrow",
    popularity: 93,
    createdOrder: 11,
  },
  {
    slug: "fresh-fruit-box",
    imageSrc: "/assets/images/demos/demo-28/flash/9.jpg",
    imageAlt: "Fresh fruit surprise bag",
    name: "Fresh Fruit Surprise Bag",
    storeName: "Daily Harvest Shop",
    storeSlug: "daily-harvest-shop",
    category: "Fruits",
    originalPrice: 180000,
    salePrice: 85000,
    discountPercent: 53,
    pickupWindow: "Tomorrow, 5:30 - 7:30 PM",
    pickupStartTime: "2026-08-05T17:30:00+07:00",
    pickupEndTime: "2026-08-05T19:30:00+07:00",
    expiryDate: "2026-08-05T23:59:00+07:00",
    status: "Active",
    pickupDay: "tomorrow",
    distance: "1.8 km away",
    distanceKm: 1.8,
    remainingQuantity: 6,
    quantityTotal: 10,
    availabilityLabel: "Pickup tomorrow",
    popularity: 86,
    createdOrder: 4,
  },
  {
    slug: "vegetable-harvest-box",
    imageSrc: "/assets/images/demos/demo-28/flash/10.jpg",
    imageAlt: "Vegetable harvest surprise bag",
    name: "Vegetable Harvest Surprise Bag",
    storeName: "Green Basket Market",
    storeSlug: "green-basket-market",
    category: "Vegetables",
    originalPrice: 140000,
    salePrice: 65000,
    discountPercent: 54,
    pickupWindow: "Tomorrow, 6:00 - 8:00 PM",
    pickupStartTime: "2026-08-05T18:00:00+07:00",
    pickupEndTime: "2026-08-05T20:00:00+07:00",
    expiryDate: "2026-08-05T23:59:00+07:00",
    status: "Active",
    pickupDay: "tomorrow",
    distance: "2.4 km away",
    distanceKm: 2.4,
    remainingQuantity: 7,
    quantityTotal: 12,
    availabilityLabel: "Pickup tomorrow",
    popularity: 77,
    createdOrder: 3,
  },
  {
    slug: "cafe-treats-box",
    imageSrc: "/assets/images/demos/demo-28/flash/11.jpg",
    imageAlt: "Cafe treats surprise bag",
    name: "Cafe Drinks and Treats Bag",
    storeName: "Local Table Kitchen",
    storeSlug: "local-table-kitchen",
    category: "Drinks",
    originalPrice: 200000,
    salePrice: 95000,
    discountPercent: 53,
    pickupWindow: "Tomorrow, 7:00 - 9:00 PM",
    pickupStartTime: "2026-08-05T19:00:00+07:00",
    pickupEndTime: "2026-08-05T21:00:00+07:00",
    expiryDate: "2026-08-05T23:59:00+07:00",
    status: "Active",
    pickupDay: "tomorrow",
    distance: "3.5 km away",
    distanceKm: 3.5,
    remainingQuantity: 4,
    quantityTotal: 8,
    availabilityLabel: "Pickup tomorrow",
    popularity: 90,
    createdOrder: 2,
  },
  {
    slug: "grocery-essentials-box",
    imageSrc: "/assets/images/demos/demo-28/flash/12.jpg",
    imageAlt: "Grocery essentials surprise bag",
    name: "Grocery Essentials Surprise Bag",
    storeName: "Neighborhood Grocery",
    storeSlug: "neighborhood-grocery",
    category: "Grocery",
    originalPrice: 170000,
    salePrice: 82000,
    discountPercent: 52,
    pickupWindow: "Tomorrow, 7:00 - 9:00 PM",
    pickupStartTime: "2026-08-05T19:00:00+07:00",
    pickupEndTime: "2026-08-05T21:00:00+07:00",
    expiryDate: "2026-08-05T23:59:00+07:00",
    status: "Active",
    pickupDay: "tomorrow",
    distance: "2.7 km away",
    distanceKm: 2.7,
    remainingQuantity: 5,
    quantityTotal: 10,
    availabilityLabel: "Pickup tomorrow",
    popularity: 73,
    createdOrder: 1,
  },
];

export const storeNames = Object.fromEntries(
  surpriseBags.map((bag) => [bag.storeSlug, bag.storeName]),
) as Record<string, string>;

const presentationByName = new Map(
  surpriseBags.map((bag) => [bag.name.trim().toLowerCase(), bag]),
);

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getPickupDay(startTime: string): ListingBag["pickupDay"] {
  const start = new Date(startTime);
  const now = new Date();
  const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return startDate.getTime() === today.getTime() ? "today" : "tomorrow";
}

function formatPickupWindow(startTime: string, endTime: string) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(start);
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${dateLabel}, ${timeFormatter.format(start)} - ${timeFormatter.format(end)}`;
}

export function toListingBag(bag: SurpriseBagResponse): ListingBag {
  const presentation = presentationByName.get(bag.name.trim().toLowerCase());
  const category = bag.categories[0]?.name ?? presentation?.category ?? "Surprise Bags";
  const pickupDay = getPickupDay(bag.pickupStartTime);
  const discountPercent = bag.originalPrice > 0
    ? Math.round((1 - bag.salePrice / bag.originalPrice) * 100)
    : 0;

  return {
    backendId: bag.id,
    storeId: bag.storeId,
    slug: presentation?.slug ?? `${toSlug(bag.name)}-${bag.id.slice(0, 8)}`,
    imageSrc: presentation?.imageSrc ?? "/assets/images/demos/demo-28/flash/1.jpg",
    imageAlt: presentation?.imageAlt ?? bag.name,
    name: bag.name,
    storeName: bag.storeName,
    storeSlug: presentation?.storeSlug ?? toSlug(bag.storeName),
    category,
    originalPrice: bag.originalPrice,
    salePrice: bag.salePrice,
    discountPercent,
    pickupWindow: formatPickupWindow(bag.pickupStartTime, bag.pickupEndTime),
    pickupStartTime: bag.pickupStartTime,
    pickupEndTime: bag.pickupEndTime,
    expiryDate: bag.expiryDate,
    status: bag.status,
    pickupDay,
    distance: presentation?.distance ?? "Store pickup",
    distanceKm: presentation?.distanceKm ?? 0,
    remainingQuantity: bag.quantityRemaining,
    quantityTotal: bag.quantityTotal,
    availabilityLabel: pickupDay === "today" ? "Pickup today" : "Pickup tomorrow",
    popularity: presentation?.popularity ?? 0,
    createdOrder: Date.parse(bag.createdAt) || 0,
  };
}

export function normalizeSort(sort?: string) {
  if (sort === "distance") return "distance";
  if (sort === "near-expiry" || sort === "pickup") return "pickup";
  if (sort === "price" || sort === "discount" || sort === "newest") return sort;
  return "popularity";
}

export function filterBags(bags: ListingBag[], filters: ListingFilters) {
  const query = filters.query.trim().toLowerCase();

  return bags
    .filter((bag) => {
      const searchableText = `${bag.name} ${bag.storeName} ${bag.category}`.toLowerCase();

      return (
        (!filters.storeSlug || bag.storeSlug === filters.storeSlug) &&
        (!query || searchableText.includes(query)) &&
        (!filters.categories.length || filters.categories.includes(bag.category)) &&
        (filters.pickupDay === "all" || bag.pickupDay === filters.pickupDay) &&
        bag.salePrice >= filters.minPrice &&
        bag.salePrice <= filters.maxPrice &&
        bag.distanceKm >= filters.minDistance &&
        bag.distanceKm <= filters.maxDistance
      );
    })
    .sort((a, b) => {
      switch (filters.sort) {
        case "distance":
          return a.distanceKm - b.distanceKm;
        case "pickup":
          return a.pickupDay.localeCompare(b.pickupDay) || a.distanceKm - b.distanceKm;
        case "price":
          return a.salePrice - b.salePrice;
        case "discount":
          return b.discountPercent - a.discountPercent;
        case "newest":
          return b.createdOrder - a.createdOrder;
        default:
          return b.popularity - a.popularity;
      }
    });
}
