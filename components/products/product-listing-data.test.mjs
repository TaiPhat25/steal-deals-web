import assert from "node:assert/strict";
import test from "node:test";
import { filterBags, surpriseBags } from "./product-listing-data.ts";

const defaults = {
  query: "",
  categories: [],
  pickupDay: "all",
  maxPrice: 300000,
  maxDistance: 10,
  sort: "popularity",
};

test("filters surprise bags by store and category", () => {
  const result = filterBags(surpriseBags, {
    ...defaults,
    categories: ["Bakery"],
    storeSlug: "morning-oven-bakery",
  });

  assert.equal(result.length, 2);
  assert.ok(result.every((bag) => bag.category === "Bakery"));
});

test("sorts filtered bags by price", () => {
  const result = filterBags(surpriseBags, { ...defaults, sort: "price" });

  assert.ok(result.every((bag, index) => index === 0 || result[index - 1].salePrice <= bag.salePrice));
});
