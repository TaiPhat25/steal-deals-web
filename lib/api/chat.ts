import { apiRequest } from "@/lib/api/client";
import type {
  StoreProfileResponse,
  SurpriseBagResponse,
} from "@/lib/api/dashboard-types";

export interface ChatRequest {
  message: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ChatTurn {
  role: "user" | "model";
  content: string;
}

export interface ChatResponse {
  sessionId: string;
  reply: string;
  suggestedBags: SurpriseBagResponse[];
  suggestedStores: StoreProfileResponse[];
}

function storeApiBaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_STORE_API_URL;
}

function bearer(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export function sendChatMessage(
  request: ChatRequest,
  token: string,
): Promise<ChatResponse> {
  return apiRequest<ChatResponse>(
    "/api/store/chat",
    {
      method: "POST",
      headers: bearer(token),
      body: request,
    },
    storeApiBaseUrl(),
  );
}

export function getChatHistory(token: string): Promise<ChatTurn[]> {
  return apiRequest<ChatTurn[]>(
    "/api/store/chat",
    {
      method: "GET",
      headers: bearer(token),
    },
    storeApiBaseUrl(),
  );
}

export function clearChatHistory(token: string): Promise<void> {
  return apiRequest<void>(
    "/api/store/chat",
    {
      method: "DELETE",
      headers: bearer(token),
    },
    storeApiBaseUrl(),
  );
}
