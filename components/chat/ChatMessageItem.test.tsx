import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ChatMessageItem, { type ChatMessage } from "./ChatMessageItem";
import ChatStarterPills from "./ChatStarterPills";
import type {
  StoreProfileResponse,
  SurpriseBagResponse,
} from "@/lib/api/dashboard-types";

vi.mock("@/components/cart/CartProvider", () => ({
  useCart: () => ({ addItem: vi.fn() }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("ChatMessageItem & ChatStarterPills", () => {
  describe("ChatStarterPills", () => {
    it("renders starter prompts and handles selection", () => {
      const handleSelect = vi.fn();
      render(<ChatStarterPills onSelectPrompt={handleSelect} />);

      const bakeryPill = screen.getByText(/bakery/i);
      expect(bakeryPill).toBeInTheDocument();

      fireEvent.click(bakeryPill);
      expect(handleSelect).toHaveBeenCalledOnce();
      expect(handleSelect).toHaveBeenCalledWith(expect.stringMatching(/baker/i));
    });

    it("disables pills when disabled prop is true", () => {
      const handleSelect = vi.fn();
      render(<ChatStarterPills onSelectPrompt={handleSelect} disabled />);

      const button = screen.getByText(/bakery/i).closest("button");
      expect(button).toBeDisabled();
    });
  });

  describe("ChatMessageItem", () => {
    it("renders user message right-aligned with text", () => {
      const userMessage: ChatMessage = {
        id: "msg-1",
        role: "user",
        content: "Show me nearby stores",
      };

      const { container } = render(<ChatMessageItem message={userMessage} />);

      expect(screen.getByText("Show me nearby stores")).toBeInTheDocument();
      expect(container.querySelector(".chat-bubble--user")).toBeInTheDocument();
    });

    it("renders model message with bot indicator and text", () => {
      const modelMessage: ChatMessage = {
        id: "msg-2",
        role: "model",
        content: "Here are some great options for you!",
      };

      const { container } = render(<ChatMessageItem message={modelMessage} />);

      expect(screen.getByText("Here are some great options for you!")).toBeInTheDocument();
      expect(container.querySelector(".chat-bubble--model")).toBeInTheDocument();
    });

    it("renders attached suggested bags carousel", () => {
      const mockBag: SurpriseBagResponse = {
        id: "bag-99",
        storeId: "store-99",
        storeName: "Sweet Pastry",
        name: "Croissant Box",
        description: "Fresh croissants",
        imageUrl: null,
        originalPrice: 40000,
        salePrice: 20000,
        quantityTotal: 4,
        quantityRemaining: 2,
        pickupStartTime: "2026-11-03T16:00:00Z",
        pickupEndTime: "2026-11-03T19:00:00Z",
        expiryDate: "2026-11-03T21:00:00Z",
        status: "Available",
        categories: [],
        distanceKm: 0.5,
        createdAt: "2026-11-03T08:00:00Z",
      };

      const modelMessageWithBags: ChatMessage = {
        id: "msg-3",
        role: "model",
        content: "Found 1 bag near you:",
        suggestedBags: [mockBag],
      };

      render(<ChatMessageItem message={modelMessageWithBags} />);

      expect(screen.getByText("Croissant Box")).toBeInTheDocument();
      expect(screen.getByText("Sweet Pastry")).toBeInTheDocument();
    });

    it("renders attached suggested stores carousel", () => {
      const mockStore: StoreProfileResponse = {
        id: "store-88",
        ownerId: "owner-88",
        name: "Green Grocer",
        description: null,
        address: "456 Market Road",
        province: "Ho Chi Minh City",
        commune: "Da Kao",
        latitude: 10.78,
        longitude: 106.69,
        avatarUrl: null,
        phone: null,
        ratingScore: 5.0,
        reviewCount: 10,
        distanceKm: 1.1,
        isVerify: true,
        isActive: true,
        createdAt: "2026-01-01T00:00:00Z",
      };

      const modelMessageWithStores: ChatMessage = {
        id: "msg-4",
        role: "model",
        content: "Here are stores nearby:",
        suggestedStores: [mockStore],
      };

      render(<ChatMessageItem message={modelMessageWithStores} />);

      expect(screen.getByText("Green Grocer")).toBeInTheDocument();
      expect(screen.getByText("456 Market Road")).toBeInTheDocument();
    });
  });
});
