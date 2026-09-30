import type { ComponentProps } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SurpriseBagResponse } from "@/lib/api/dashboard-types";
import { listBags } from "@/lib/api/store";
import ProductListing from "./ProductListing";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

vi.mock("@/components/home/SurpriseBagCard", () => ({
  default: ({ bag }: { bag: { name: string } }) => <article>{bag.name}</article>,
}));

vi.mock("@/lib/api/store", () => ({
  listBags: vi.fn(),
}));

const mockListBags = vi.mocked(listBags);

function createBag(
  overrides: Partial<SurpriseBagResponse> = {},
): SurpriseBagResponse {
  return {
    id: "bag-1",
    storeId: "store-1",
    storeName: "Fresh Market",
    name: "Bakery Bag",
    description: null,
    imageUrl: null,
    originalPrice: 90000,
    salePrice: 45000,
    quantityTotal: 5,
    quantityRemaining: 3,
    pickupStartTime: "2099-10-01T16:00:00+07:00",
    pickupEndTime: "2099-10-01T18:00:00+07:00",
    expiryDate: "2099-10-01T20:00:00+07:00",
    status: "Active",
    categories: [{
      id: "category-1",
      name: "Bakery",
      slug: "bakery",
      iconUrl: null,
      isActive: true,
    }],
    createdAt: "2026-09-28T10:00:00+07:00",
    ...overrides,
  };
}

const availableBags = [
  createBag(),
  createBag({
    id: "bag-2",
    name: "Dairy Bag",
    salePrice: 65000,
    categories: [{
      id: "category-2",
      name: "Dairy",
      slug: "dairy",
      iconUrl: null,
      isActive: true,
    }],
  }),
];

function renderListing(props: ComponentProps<typeof ProductListing> = {}) {
  return render(<ProductListing {...props} />);
}

describe("ProductListing", () => {
  beforeEach(() => {
    mockListBags.mockReset();
    mockListBags.mockResolvedValue(availableBags);
  });

  it("shows removable applied filters and keeps the result count synchronized", async () => {
    const user = userEvent.setup();
    renderListing();

    expect(await screen.findByRole("status", { name: "" })).toHaveTextContent(
      "Showing 2 of 2 surprise bags",
    );
    expect(screen.queryByRole("button", { name: "Clear All" })).not.toBeInTheDocument();

    await user.type(screen.getByRole("searchbox", { name: "Search surprise bags" }), "Bakery");

    expect(screen.getByRole("status", { name: "" })).toHaveTextContent(
      "Showing 1 of 2 surprise bags",
    );
    expect(screen.getByRole("button", { name: "Remove search filter: Bakery" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Clear All" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Remove search filter: Bakery" }));
    await user.click(screen.getByRole("checkbox", { name: "Dairy" }));

    expect(screen.getByRole("button", { name: "Remove category filter: Dairy" })).toBeVisible();
    expect(screen.getByRole("status", { name: "" })).toHaveTextContent(
      "Showing 1 of 2 surprise bags",
    );

    await user.click(screen.getByRole("button", { name: "Remove category filter: Dairy" }));
    await user.type(screen.getByRole("textbox", { name: "Minimum price" }), "50000");
    await user.click(screen.getByRole("button", { name: "Apply" }));

    expect(screen.getByRole("button", { name: "Remove price filter: From 50,000 VND" })).toBeVisible();
    expect(screen.getByRole("status", { name: "" })).toHaveTextContent(
      "Showing 1 of 2 surprise bags",
    );

    await user.click(screen.getByRole("button", { name: "Remove price filter: From 50,000 VND" }));

    expect(screen.getByRole("textbox", { name: "Minimum price" })).toHaveValue("");
    expect(screen.getByRole("status", { name: "" })).toHaveTextContent(
      "Showing 2 of 2 surprise bags",
    );
  });

  it("distinguishes unavailable products from filter mismatches", async () => {
    const user = userEvent.setup();
    const { unmount } = renderListing();

    await screen.findByText("Bakery Bag");
    await user.type(screen.getByRole("searchbox", { name: "Search surprise bags" }), "missing");

    expect(screen.getByRole("heading", { name: "No surprise bags match your filters" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(await screen.findByText("Bakery Bag")).toBeVisible();

    unmount();
    mockListBags.mockResolvedValueOnce([]);
    renderListing();

    expect(await screen.findByRole("heading", { name: "No surprise bags available" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Clear filters" })).not.toBeInTheDocument();
  });

  it("preserves filters when retrying a failed request", async () => {
    const user = userEvent.setup();
    mockListBags
      .mockRejectedValueOnce(new Error("Store Service unavailable"))
      .mockResolvedValueOnce(availableBags);

    renderListing();
    expect(await screen.findByRole("heading", { name: "Unable to load surprise bags" })).toBeVisible();

    const search = screen.getByRole("searchbox", { name: "Search surprise bags" });
    await user.type(search, "Bakery");
    await user.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => {
      expect(screen.getByRole("status", { name: "" })).toHaveTextContent(
        "Showing 1 of 2 surprise bags",
      );
    });
    expect(search).toHaveValue("Bakery");
  });
});
