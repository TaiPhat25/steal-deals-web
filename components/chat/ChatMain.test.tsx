import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ChatMain from "./ChatMain";
import * as chatApi from "@/lib/api/chat";

const mockUseAuth = vi.fn();
const mockUseUserLocation = vi.fn();
const mockShowToast = vi.fn();

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/components/location/UserLocationProvider", () => ({
  useUserLocation: () => mockUseUserLocation(),
}));

vi.mock("@/components/notifications/ToastProvider", () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

vi.mock("@/components/cart/CartProvider", () => ({
  useCart: () => ({ addItem: vi.fn() }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/api/chat", () => ({
  getChatHistory: vi.fn(),
  sendChatMessage: vi.fn(),
  clearChatHistory: vi.fn(),
}));

describe("ChatMain", () => {
  const token = "valid-user-token";

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      accessToken: token,
      isInitialized: true,
      currentUser: { userId: "user-1", name: "Huy Nguyen", email: "huy@example.com", roles: ["Customer"] },
    });
    mockUseUserLocation.mockReturnValue({
      coordinates: { latitude: 10.7769, longitude: 106.7009 },
      isLoading: false,
    });
    vi.mocked(chatApi.getChatHistory).mockResolvedValue([]);
  });

  it("renders sign-in prompt when visitor is unauthenticated", async () => {
    mockUseAuth.mockReturnValue({
      accessToken: null,
      isInitialized: true,
      currentUser: null,
    });

    render(<ChatMain />);

    await waitFor(() => {
      expect(screen.getByText(/sign in to chat with our ai assistant/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/login?redirect=/chat",
    );
  });

  it("loads chat history on mount for authenticated user", async () => {
    vi.mocked(chatApi.getChatHistory).mockResolvedValueOnce([
      { role: "user", content: "Previous question" },
      { role: "model", content: "Previous reply" },
    ]);

    render(<ChatMain />);

    await waitFor(() => {
      expect(screen.getByText("Previous question")).toBeInTheDocument();
      expect(screen.getByText("Previous reply")).toBeInTheDocument();
    });
    expect(chatApi.getChatHistory).toHaveBeenCalledWith(token);
  });

  it("blocks submission of empty or whitespace-only messages", async () => {
    render(<ChatMain />);
    await waitFor(() => expect(chatApi.getChatHistory).toHaveBeenCalled());

    const sendButton = screen.getByRole("button", { name: /send/i });
    expect(sendButton).toBeDisabled();

    const input = screen.getByPlaceholderText(/ask stealdeals ai/i);
    fireEvent.change(input, { target: { value: "   " } });
    expect(sendButton).toBeDisabled();
    expect(chatApi.sendChatMessage).not.toHaveBeenCalled();
  });

  it("sends message with coordinates and displays model response", async () => {
    vi.mocked(chatApi.sendChatMessage).mockResolvedValueOnce({
      sessionId: "user-1",
      reply: "Here is your bakery deal!",
      suggestedBags: [],
      suggestedStores: [],
    });

    render(<ChatMain />);
    await waitFor(() => expect(chatApi.getChatHistory).toHaveBeenCalled());

    const input = screen.getByPlaceholderText(/ask stealdeals ai/i);
    fireEvent.change(input, { target: { value: "Find deals" } });

    const sendButton = screen.getByRole("button", { name: /send/i });
    expect(sendButton).not.toBeDisabled();
    fireEvent.click(sendButton);

    expect(screen.getByText("Find deals")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Here is your bakery deal!")).toBeInTheDocument();
    });

    expect(chatApi.sendChatMessage).toHaveBeenCalledWith(
      {
        message: "Find deals",
        latitude: 10.7769,
        longitude: 106.7009,
      },
      token,
    );
  });

  it("clears chat history and shows toast notification", async () => {
    vi.mocked(chatApi.getChatHistory).mockResolvedValueOnce([
      { role: "user", content: "Hello to be cleared" },
    ]);
    vi.mocked(chatApi.clearChatHistory).mockResolvedValueOnce();

    render(<ChatMain />);
    await waitFor(() => {
      expect(screen.getByText("Hello to be cleared")).toBeInTheDocument();
    });

    const clearButton = screen.getByRole("button", { name: /clear chat/i });
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(chatApi.clearChatHistory).toHaveBeenCalledWith(token);
      expect(screen.queryByText("Hello to be cleared")).not.toBeInTheDocument();
    });

    expect(mockShowToast).toHaveBeenCalledWith(
      expect.stringMatching(/cleared/i),
      "info",
    );
  });

  it("renders open-full-page link and close button in widget variant", async () => {
    const onClose = vi.fn();

    render(<ChatMain variant="widget" onClose={onClose} />);
    await waitFor(() => expect(chatApi.getChatHistory).toHaveBeenCalled());

    const expandLink = screen.getByRole("link", { name: /open full chat page/i });
    expect(expandLink).toHaveAttribute("href", "/chat");

    fireEvent.click(expandLink);
    expect(onClose).toHaveBeenCalledTimes(1);

    const closeButton = screen.getByRole("button", { name: /close chat/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("renders compact auth prompt with expand and close actions in unauthenticated widget variant", async () => {
    mockUseAuth.mockReturnValue({
      accessToken: null,
      isInitialized: true,
      currentUser: null,
    });
    const onClose = vi.fn();

    render(<ChatMain variant="widget" onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText(/sign in to chat with our ai assistant/i)).toBeInTheDocument();
    });

    const expandLink = screen.getByRole("link", { name: /open full chat page/i });
    expect(expandLink).toHaveAttribute("href", "/chat");

    const signInLink = screen.getByRole("link", { name: /sign in/i });
    expect(signInLink).toHaveAttribute("href", "/login?redirect=/chat");
    fireEvent.click(signInLink);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
