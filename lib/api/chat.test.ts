import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearChatHistory,
  getChatHistory,
  sendChatMessage,
  type ChatRequest,
  type ChatResponse,
  type ChatTurn,
} from "./chat";
import { ApiClientError } from "@/lib/api/client";

const mocks = vi.hoisted(() => ({
  apiRequest: vi.fn(),
}));

vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();

  return {
    ...actual,
    apiRequest: mocks.apiRequest,
  };
});

describe("Store Chat API", () => {
  const token = "test-user-jwt-token";
  const originalEnv = process.env.NEXT_PUBLIC_STORE_API_URL;
  const testBaseUrl = "http://localhost:5169";

  beforeEach(() => {
    process.env.NEXT_PUBLIC_STORE_API_URL = testBaseUrl;
    mocks.apiRequest.mockReset();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_STORE_API_URL = originalEnv;
  });

  describe("sendChatMessage", () => {
    it("should send message and coordinates with Bearer token to POST /api/store/chat", async () => {
      const request: ChatRequest = {
        message: "Find bakery surprise bags near me",
        latitude: 10.7769,
        longitude: 106.7009,
      };

      const mockResponse: ChatResponse = {
        sessionId: "user-123",
        reply: "Here are some bakery bags near you!",
        suggestedBags: [],
        suggestedStores: [],
      };

      mocks.apiRequest.mockResolvedValueOnce(mockResponse);

      const response = await sendChatMessage(request, token);

      expect(mocks.apiRequest).toHaveBeenCalledOnce();
      expect(mocks.apiRequest).toHaveBeenCalledWith(
        "/api/store/chat",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: request,
        },
        testBaseUrl,
      );
      expect(response).toEqual(mockResponse);
    });

    it("should propagate ApiClientError on failure", async () => {
      const error = new ApiClientError(401, "Unauthorized");
      mocks.apiRequest.mockRejectedValueOnce(error);

      await expect(
        sendChatMessage({ message: "Hello" }, token),
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("getChatHistory", () => {
    it("should fetch conversation turns with Bearer token from GET /api/store/chat", async () => {
      const mockTurns: ChatTurn[] = [
        { role: "user", content: "Hi" },
        { role: "model", content: "Hello! How can I help you today?" },
      ];

      mocks.apiRequest.mockResolvedValueOnce(mockTurns);

      const response = await getChatHistory(token);

      expect(mocks.apiRequest).toHaveBeenCalledOnce();
      expect(mocks.apiRequest).toHaveBeenCalledWith(
        "/api/store/chat",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        testBaseUrl,
      );
      expect(response).toEqual(mockTurns);
    });
  });

  describe("clearChatHistory", () => {
    it("should call DELETE /api/store/chat with Bearer token to reset session", async () => {
      mocks.apiRequest.mockResolvedValueOnce(null);

      await clearChatHistory(token);

      expect(mocks.apiRequest).toHaveBeenCalledOnce();
      expect(mocks.apiRequest).toHaveBeenCalledWith(
        "/api/store/chat",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        testBaseUrl,
      );
    });
  });
});
