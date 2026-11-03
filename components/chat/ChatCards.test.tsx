import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ChatBagCard from "./ChatBagCard";
import ChatStoreCard from "./ChatStoreCard";
import type {
  StoreProfileResponse,
  SurpriseBagResponse,
} from "@/lib/api/dashboard-types";

const mockAddItem = vi.fn();
const mockPush = vi.fn();

vi.mock("@/components/cart/CartProvider", () => ({
  useCart: () => ({
    addItem: mockAddItem,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("ChatCards", () => {
  describe("ChatBagCard", () => {
    const mockBag: SurpriseBagResponse = {
      id: "bag-1",
      storeId: "store-1",
      storeName: "Daily Bakery",
      name: "Morning Pastry Box",
      description: "Assorted fresh pastries from today",
      imageUrl: "https://images.example.com/pastry.jpg",
      originalPrice: 50000,
      salePrice: 25000,
      quantityTotal: 5,
      quantityRemaining: 3,
      pickupStartTime: "2026-11-03T14:00:00Z",
      pickupEndTime: "2026-11-03T18:00:00Z",
      expiryDate: "2026-11-03T20:00:00Z",
      status: "Available",
      categories: [{ id: "c1", name: "Bakery", slug: "bakery", iconUrl: null, isActive: true }],
      distanceKm: 1.5,
      createdAt: "2026-11-03T08:00:00Z",
    };

    it("renders bag details, formatted price, discount, and distance", () => {
      render(<ChatBagCard bag={mockBag} />);

      expect(screen.getByText("Morning Pastry Box")).toBeInTheDocument();
      expect(screen.getByText("Daily Bakery")).toBeInTheDocument();
      expect(screen.getByText("Save 50%")).toBeInTheDocument();
      expect(screen.getByText("25,000 VND")).toBeInTheDocument();
      expect(screen.getByText("50,000 VND")).toBeInTheDocument();
      expect(screen.getByText(/1\.5 km/)).toBeInTheDocument();
    });

    it("calls addItem and navigates to /newcart when Add to Cart is clicked", () => {
      render(<ChatBagCard bag={mockBag} />);

      const addButton = screen.getByRole("button", { name: /add to cart/i });
      fireEvent.click(addButton);

      expect(mockAddItem).toHaveBeenCalledOnce();
      expect(mockPush).toHaveBeenCalledWith("/newcart");
    });

    it("gracefully renders fallback image when imageUrl is null", () => {
      const bagWithoutImage: SurpriseBagResponse = {
        ...mockBag,
        imageUrl: null,
        distanceKm: null,
      };

      render(<ChatBagCard bag={bagWithoutImage} />);
      expect(screen.getByText("Morning Pastry Box")).toBeInTheDocument();
      expect(screen.queryByText(/km/)).not.toBeInTheDocument();
    });
  });

  describe("ChatStoreCard", () => {
    const mockStore: StoreProfileResponse = {
      id: "store-1",
      ownerId: "owner-1",
      name: "Organic Green Market",
      description: "Local fresh organic food",
      address: "123 Nguyen Trai, D1",
      province: "Ho Chi Minh City",
      commune: "Ben Thanh",
      latitude: 10.7769,
      longitude: 106.7009,
      avatarUrl: "https://images.example.com/store.jpg",
      phone: "0901234567",
      ratingScore: 4.8,
      reviewCount: 24,
      distanceKm: 0.8,
      isVerify: true,
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
    };

    it("renders store details, rating, and distance", () => {
      render(<ChatStoreCard store={mockStore} />);

      expect(screen.getByText("Organic Green Market")).toBeInTheDocument();
      expect(screen.getByText("123 Nguyen Trai, D1")).toBeInTheDocument();
      expect(screen.getByText(/4\.8/)).toBeInTheDocument();
      expect(screen.getByText(/\(24\)/)).toBeInTheDocument();
      expect(screen.getByText(/0\.8 km/)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /view store/i })).toHaveAttribute(
        "href",
        "/stores/store-1",
      );
    });

    it("gracefully renders fallback avatar when avatarUrl is null", () => {
      const storeWithoutAvatar: StoreProfileResponse = {
        ...mockStore,
        avatarUrl: null,
        distanceKm: null,
        reviewCount: 0,
      };

      render(<ChatStoreCard store={storeWithoutAvatar} />);
      expect(screen.getByText("Organic Green Market")).toBeInTheDocument();
      expect(screen.getByText("No reviews")).toBeInTheDocument();
      expect(screen.queryByText(/km/)).not.toBeInTheDocument();
    });
  });
});
