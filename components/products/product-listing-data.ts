import type { SurpriseBag } from "@/components/home/SurpriseBagCard";

export type ListingBag = SurpriseBag & {
  pickupDay: "today" | "tomorrow";
  distanceKm: number;
  popularity: number;
  createdOrder: number;
};

export type ListingFilters = {
  query: string;
  categories: string[];
  pickupDay: "all" | ListingBag["pickupDay"];
  maxPrice: number;
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
    pickupDay: "today",
    distance: "1.2 km away",
    distanceKm: 1.2,
    remainingQuantity: 4,
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
    pickupDay: "today",
    distance: "2.4 km away",
    distanceKm: 2.4,
    remainingQuantity: 6,
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
    pickupDay: "today",
    distance: "3.1 km away",
    distanceKm: 3.1,
    remainingQuantity: 2,
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
    pickupDay: "today",
    distance: "1.8 km away",
    distanceKm: 1.8,
    remainingQuantity: 5,
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
    pickupDay: "today",
    distance: "2.7 km away",
    distanceKm: 2.7,
    remainingQuantity: 3,
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
    pickupDay: "today",
    distance: "3.5 km away",
    distanceKm: 3.5,
    remainingQuantity: 4,
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
    pickupDay: "tomorrow",
    distance: "1.2 km away",
    distanceKm: 1.2,
    remainingQuantity: 8,
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
    pickupDay: "tomorrow",
    distance: "3.1 km away",
    distanceKm: 3.1,
    remainingQuantity: 5,
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
    pickupDay: "tomorrow",
    distance: "1.8 km away",
    distanceKm: 1.8,
    remainingQuantity: 6,
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
    pickupDay: "tomorrow",
    distance: "2.4 km away",
    distanceKm: 2.4,
    remainingQuantity: 7,
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
    pickupDay: "tomorrow",
    distance: "3.5 km away",
    distanceKm: 3.5,
    remainingQuantity: 4,
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
    pickupDay: "tomorrow",
    distance: "2.7 km away",
    distanceKm: 2.7,
    remainingQuantity: 5,
    availabilityLabel: "Pickup tomorrow",
    popularity: 73,
    createdOrder: 1,
  },
];

export const storeNames = Object.fromEntries(
  surpriseBags.map((bag) => [bag.storeSlug, bag.storeName]),
) as Record<string, string>;

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
        bag.salePrice <= filters.maxPrice &&
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
