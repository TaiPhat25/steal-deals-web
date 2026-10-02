import { describe, expect, it } from "vitest";
import {
  filterBags,
  formatPickupWindow,
  isBagAvailable,
  normalizeSort,
  PRODUCT_LISTING_IMAGE,
  surpriseBags,
  toListingBag,
  validatePriceRange,
  type ListingFilters,
} from "./product-listing-data";

const defaults = {
  query: "",
  categories: [],
  pickupDay: "all",
  minPrice: 0,
  maxPrice: 300000,
  minDistance: 0,
  maxDistance: 10,
  sort: "popularity",
} satisfies ListingFilters;

describe("product listing data", () => {
it("filters surprise bags by store and category", () => {
  const bags = surpriseBags.map((bag) => ({
    ...bag,
    storeId: bag.storeSlug === "morning-oven-bakery" ? "store-1" : "store-2",
  }));
  const result = filterBags(bags, {
    ...defaults,
    categories: ["Bakery"],
    storeId: "store-1",
  });

  expect(result).toHaveLength(2);
  expect(result.every((bag) => bag.category === "Bakery")).toBe(true);
});

it("sorts filtered bags by price", () => {
  const result = filterBags(surpriseBags, { ...defaults, sort: "price" });

  expect(result.every((bag, index) => index === 0 || result[index - 1].salePrice <= bag.salePrice)).toBe(true);
});

it("maps API bags without inheriting demo presentation metadata", () => {
  const bag = toListingBag({
    id: "bag-api-1",
    storeId: "store-api-1",
    storeName: "Different Store",
    name: "Market Fresh Vegetable Bag",
    description: null,
    imageUrl: null,
    originalPrice: 120000,
    salePrice: 60000,
    quantityTotal: 5,
    quantityRemaining: 3,
    pickupStartTime: "2026-10-01T16:00:00+07:00",
    pickupEndTime: "2026-10-01T18:00:00+07:00",
    expiryDate: "2026-10-01T20:00:00+07:00",
    status: "Active",
    categories: [{ id: "category-1", name: "Produce", slug: "produce", iconUrl: null, isActive: true }],
    createdAt: "2026-09-28T10:00:00+07:00",
  });

  expect(bag.slug).toBe("bag-api-1");
  expect(bag.storeId).toBe("store-api-1");
  expect(bag.storeSlug).toBeUndefined();
  expect(bag.storeName).toBe("Different Store");
  expect(bag.category).toBe("Produce");
  expect(bag.imageSrc).toBe(PRODUCT_LISTING_IMAGE);
  expect(bag.distance).toBe("Store pickup");
  expect(bag.distanceKm).toBe(Number.POSITIVE_INFINITY);
  expect(bag.popularity).toBe(0);
});

it("shows both dates for a pickup window spanning multiple days", () => {
  expect(
    formatPickupWindow(
      "2026-10-01T04:00:00Z",
      "2026-10-15T06:30:00Z",
    ),
  ).toBe("Oct 1, 11:00 AM - Oct 15, 1:30 PM");
});

it("rejects sold-out, expired, and ended-pickup bags", () => {
  const now = Date.parse("2026-09-28T12:00:00Z");
  const available = {
    status: "Active",
    quantityRemaining: 2,
    expiryDate: "2026-09-28T15:00:00Z",
    pickupEndTime: "2026-09-28T14:00:00Z",
  };

  expect(isBagAvailable(available, now)).toBe(true);
  expect(isBagAvailable({ ...available, quantityRemaining: 0 }, now)).toBe(false);
  expect(isBagAvailable({ ...available, expiryDate: "2026-09-28T11:00:00Z" }, now)).toBe(false);
  expect(isBagAvailable({ ...available, pickupEndTime: "2026-09-28T11:00:00Z" }, now)).toBe(false);
});

it("sorts pickup soonest using the pickup start timestamp", () => {
  const later = { ...surpriseBags[0], slug: "later", pickupStartTime: "2026-10-01T20:00:00Z" };
  const sooner = { ...surpriseBags[0], slug: "sooner", pickupStartTime: "2026-10-01T16:00:00Z" };
  const result = filterBags([later, sooner], { ...defaults, sort: "pickup" });

  expect(result.map((bag) => bag.slug)).toEqual(["sooner", "later"]);
});

it("treats blank price bounds as zero to unlimited", () => {
  expect(validatePriceRange("", "")).toEqual({
    isValid: true,
    min: 0,
    max: Number.POSITIVE_INFINITY,
    error: null,
  });
});

it("accepts non-negative whole-number price bounds", () => {
  expect(validatePriceRange("10,000", "75,000")).toEqual({
    isValid: true,
    min: 10000,
    max: 75000,
    error: null,
  });
});

it("rejects invalid, negative, and reversed price bounds", () => {
  expect(validatePriceRange("abc", "75000").isValid).toBe(false);
  expect(validatePriceRange("-1", "75000").isValid).toBe(false);
  expect(validatePriceRange("80000", "75000")).toEqual({
    isValid: false,
    min: null,
    max: null,
    error: "Minimum price cannot be greater than maximum price.",
  });
});

it("falls back from unsupported distance sorting", () => {
  expect(normalizeSort("distance")).toBe("popularity");
});
});
