import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HeaderSearch from "./HeaderSearch";

const mocks = vi.hoisted(() => ({
  listBags: vi.fn(),
}));

vi.mock("@/lib/api/store", () => ({
  listBags: mocks.listBags,
}));

const bags = [
  {
    id: "bag-bread",
    storeId: "store-one",
    storeName: "Morning Oven",
    name: "Bakery Bread Bag",
    description: null,
    imageUrl: null,
    originalPrice: 100000,
    salePrice: 50000,
    quantityTotal: 8,
    quantityRemaining: 4,
    pickupStartTime: "2026-09-14T17:00:00+07:00",
    pickupEndTime: "2026-09-14T19:00:00+07:00",
    expiryDate: "2026-09-14T23:59:00+07:00",
    status: "Active",
    categories: [{ id: "bakery", name: "Bakery", slug: "bakery", iconUrl: null, isActive: true }],
    createdAt: "2026-09-14T08:00:00+07:00",
  },
  {
    id: "bag-fruit",
    storeId: "store-two",
    storeName: "Daily Harvest",
    name: "Fresh Fruit Bag",
    description: null,
    imageUrl: null,
    originalPrice: 90000,
    salePrice: 45000,
    quantityTotal: 6,
    quantityRemaining: 3,
    pickupStartTime: "2026-09-14T17:00:00+07:00",
    pickupEndTime: "2026-09-14T19:00:00+07:00",
    expiryDate: "2026-09-14T23:59:00+07:00",
    status: "Active",
    categories: [{ id: "fruit", name: "Fruits", slug: "fruits", iconUrl: null, isActive: true }],
    createdAt: "2026-09-14T08:00:00+07:00",
  },
];

describe("HeaderSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listBags.mockResolvedValue(bags);
  });

  it("loads and filters product suggestions by keyword", async () => {
    const user = userEvent.setup();
    render(<HeaderSearch />);

    await user.click(screen.getByRole("button", { name: "Search surprise bags" }));
    await user.type(screen.getByRole("searchbox", { name: "Search surprise bags" }), "bread");

    const result = await screen.findByRole("link", { name: /Bakery Bread Bag/ });

    expect(mocks.listBags).toHaveBeenCalledOnce();
    expect(result).toHaveAttribute("href", "/product?bag=bag-bread");
    expect(screen.queryByRole("link", { name: /Fresh Fruit Bag/ })).not.toBeInTheDocument();
  });
});
