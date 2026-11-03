"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useUserLocation } from "@/components/location/UserLocationProvider";
import { useToast } from "@/components/notifications/ToastProvider";
import {
  clearChatHistory,
  getChatHistory,
  sendChatMessage,
} from "@/lib/api/chat";
import ChatMessageItem, { type ChatMessage } from "./ChatMessageItem";
import ChatStarterPills from "./ChatStarterPills";

const MAX_MESSAGE_LENGTH = 500;

export default function ChatMain() {
  const { accessToken, isInitialized, currentUser } = useAuth();
  const { coordinates: profileCoords } = useUserLocation();
  const { showToast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [gpsCoords, setGpsCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isRequestingGps, setIsRequestingGps] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Active proximity coordinates: GPS takes priority, falls back to profile address
  const activeCoords = gpsCoords ?? profileCoords ?? null;

  const scrollToBottom = useCallback(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Fetch initial chat turns on mount when authenticated
  const loadHistory = useCallback(async (token: string) => {
    void Promise.resolve().then(() => {
      setIsLoadingHistory(true);
      setLoadError(null);
    });
    try {
      const turns = await getChatHistory(token);
      const mapped: ChatMessage[] = turns.map((turn, index) => ({
        id: `history-${index}-${Date.now()}`,
        role: turn.role,
        content: turn.content,
      }));
      setMessages(mapped);
    } catch {
      setLoadError("Unable to load chat history. Please try again.");
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    if (!isInitialized) return () => { active = false; };

    if (!accessToken) {
      void Promise.resolve().then(() => {
        if (active) setIsLoadingHistory(false);
      });
      return () => { active = false; };
    }

    void Promise.resolve().then(() => {
      if (active) {
        void loadHistory(accessToken);
      }
    });

    return () => { active = false; };
  }, [accessToken, isInitialized, loadHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending, scrollToBottom]);

  // Request browser GPS position
  const handleRequestGps = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "warning");
      return;
    }

    setIsRequestingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setIsRequestingGps(false);
        showToast("GPS location activated!", "success");
      },
      () => {
        setIsRequestingGps(false);
        showToast("Location permission denied. Falling back to profile address.", "warning");
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  const handleSend = async (textToSend?: string) => {
    const rawMessage = textToSend ?? inputText;
    const message = rawMessage.trim();

    if (!message || message.length > MAX_MESSAGE_LENGTH || isSending || !accessToken) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) {
      setInputText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
    setIsSending(true);

    try {
      const response = await sendChatMessage(
        {
          message,
          latitude: activeCoords?.latitude,
          longitude: activeCoords?.longitude,
        },
        accessToken,
      );

      const modelMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: "model",
        content: response.reply,
        suggestedBags: response.suggestedBags,
        suggestedStores: response.suggestedStores,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get reply from AI assistant.";
      const errorReply: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "model",
        content: `⚠️ ${errorMessage}. Please check your connection or try again.`,
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearChat = async () => {
    if (!accessToken || messages.length === 0) return;

    try {
      await clearChatHistory(accessToken);
      setMessages([]);
      showToast("Chat history cleared", "info");
    } catch {
      showToast("Failed to clear chat history.", "error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // 1. Unauthenticated Visitor State
  if (isInitialized && !accessToken) {
    return (
      <div className="chat-page-container">
        <div className="chat-auth-card">
          <div className="chat-auth-card__icon" aria-hidden="true">
            <i className="las la-robot"></i>
          </div>
          <h2>Sign in to chat with our AI Assistant</h2>
          <p>
            Connect with StealDeals AI to discover nearby surplus food, receive personalized
            surprise bag recommendations, and check pickup windows.
          </p>
          <div className="chat-auth-card__actions">
            <Link href="/login?redirect=/chat" className="btn btn-primary">
              Sign In to Continue
            </Link>
            <Link href="/register" className="btn btn-outline-primary-2">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page-container">
      <div className="chat-window">
        {/* Chat Header Bar */}
        <header className="chat-header">
          <div className="chat-header__info">
            <div className="chat-header__avatar">
              <i className="las la-robot"></i>
              <span className="chat-header__status-dot" title="Online"></span>
            </div>
            <div>
              <h3 className="chat-header__title">StealDeals AI Assistant</h3>
              <p className="chat-header__subtitle">
                {currentUser?.name ? `Helping ${currentUser.name}` : "Surplus food & store finder"}
              </p>
            </div>
          </div>

          <div className="chat-header__actions">
            {/* Location Pill */}
            {gpsCoords ? (
              <span className="chat-location-pill chat-location-pill--active" title="Using Browser GPS">
                <i className="las la-crosshairs"></i> GPS Active
              </span>
            ) : profileCoords ? (
              <button
                type="button"
                onClick={handleRequestGps}
                disabled={isRequestingGps}
                className="chat-location-pill chat-location-pill--profile"
                title="Using Saved Address Coordinates. Click to switch to GPS."
              >
                <i className="las la-map-marker-alt"></i> Saved Address (Use GPS)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRequestGps}
                disabled={isRequestingGps}
                className="chat-location-pill chat-location-pill--off"
                title="Enable Location for Distance Sorting"
              >
                <i className="las la-map-marker"></i> {isRequestingGps ? "Acquiring..." : "Enable GPS"}
              </button>
            )}

            {/* Clear Chat Button */}
            <button
              type="button"
              onClick={handleClearChat}
              disabled={messages.length === 0 || isSending}
              className="chat-header__clear-btn"
              title="Clear Conversation History"
            >
              <i className="las la-trash"></i>
              <span>Clear Chat</span>
            </button>
          </div>
        </header>

        {/* Message Stream */}
        <div className="chat-messages" role="log" aria-live="polite">
          {isLoadingHistory ? (
            <div className="chat-loading-state">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading conversation...</span>
              </div>
              <p>Loading your chat history...</p>
            </div>
          ) : loadError ? (
            <div className="chat-error-banner">
              <p>{loadError}</p>
              <button
                type="button"
                className="btn btn-outline-primary-2 btn-sm"
                onClick={() => accessToken && void loadHistory(accessToken)}
              >
                Retry
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty-state">
              <div className="chat-empty-state__icon" aria-hidden="true">
                <i className="las la-comment-dots"></i>
              </div>
              <h4>Welcome to StealDeals Assistant!</h4>
              <p>
                Ask me about today&apos;s surprise bags, nearby bakery and market deals, pickup
                hours, or how our food rescue community works.
              </p>
              <ChatStarterPills
                disabled={isSending}
                onSelectPrompt={(prompt) => void handleSend(prompt)}
              />
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessageItem key={msg.id} message={msg} />
              ))}
              {isSending && (
                <div className="chat-message-row chat-message-row--model">
                  <div className="chat-avatar" aria-hidden="true">
                    <i className="las la-robot"></i>
                  </div>
                  <div className="chat-message-content">
                    <div className="chat-bubble chat-bubble--model chat-bubble--thinking">
                      <span className="chat-typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </span>
                      <span className="chat-typing-text">StealDeals is finding deals...</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <form
          className="chat-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend();
          }}
        >
          <div className="chat-input-wrapper">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask StealDeals AI about surprise bags, stores, or pickup..."
              maxLength={MAX_MESSAGE_LENGTH}
              disabled={isSending || isLoadingHistory}
              className="chat-textarea"
            />
            <div className="chat-input-meta">
              <span className={`chat-char-count ${inputText.length > 450 ? "text-warning" : ""}`}>
                {inputText.length}/{MAX_MESSAGE_LENGTH}
              </span>
              <button
                type="submit"
                disabled={!inputText.trim() || isSending || isLoadingHistory}
                className="chat-send-btn"
                aria-label="Send message"
              >
                <i className="las la-paper-plane" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
