import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ChatWidget from "./ChatWidget";
import * as chatApi from "@/lib/api/chat";

const mockUsePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => ({
    accessToken: "valid-token",
    isInitialized: true,
    currentUser: { userId: "user-1", name: "Huy", email: "huy@example.com", roles: ["Customer"] },
  }),
}));

vi.mock("@/components/location/UserLocationProvider", () => ({
  useUserLocation: () => ({
    coordinates: null,
    isLoading: false,
  }),
}));

vi.mock("@/components/notifications/ToastProvider", () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

vi.mock("@/components/cart/CartProvider", () => ({
  useCart: () => ({ addItem: vi.fn() }),
}));

vi.mock("@/lib/api/chat", () => ({
  getChatHistory: vi.fn(),
  sendChatMessage: vi.fn(),
  clearChatHistory: vi.fn(),
}));

describe("ChatWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue("/");
    vi.mocked(chatApi.getChatHistory).mockResolvedValue([]);
  });

  it("hides the floating launcher on the /chat page", () => {
    mockUsePathname.mockReturnValue("/chat");

    const { container } = render(<ChatWidget />);
    expect(container).toBeEmptyDOMElement();
  });

  it("toggles popup chat window and closes when expanding to full /chat page or pressing Escape", async () => {
    render(<ChatWidget />);

    const launcher = screen.getByRole("button", { name: /open ai assistant/i });
    expect(screen.queryByRole("dialog", { name: /stealdeals ai assistant/i })).not.toBeInTheDocument();

    fireEvent.click(launcher);

    const dialog = screen.getByRole("dialog", { name: /stealdeals ai assistant/i });
    expect(dialog).toBeInTheDocument();
    await waitFor(() => expect(chatApi.getChatHistory).toHaveBeenCalledTimes(1));

    const expandLink = screen.getByRole("link", { name: /open full chat page/i });
    expect(expandLink).toHaveAttribute("href", "/chat");

    fireEvent.click(expandLink);
    expect(screen.queryByRole("dialog", { name: /stealdeals ai assistant/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open ai assistant/i }));
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
