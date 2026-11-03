"use client";

import ChatBagCard from "./ChatBagCard";
import ChatStoreCard from "./ChatStoreCard";
import type {
  StoreProfileResponse,
  SurpriseBagResponse,
} from "@/lib/api/dashboard-types";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  suggestedBags?: SurpriseBagResponse[];
  suggestedStores?: StoreProfileResponse[];
  timestamp?: Date;
}

export default function ChatMessageItem({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`chat-message-row ${
        isUser ? "chat-message-row--user" : "chat-message-row--model"
      }`}
    >
      {!isUser && (
        <div className="chat-avatar" aria-hidden="true">
          <i className="las la-robot"></i>
        </div>
      )}

      <div className="chat-message-content">
        <div
          className={`chat-bubble ${
            isUser ? "chat-bubble--user" : "chat-bubble--model"
          }`}
        >
          <div className="chat-bubble__text">{message.content}</div>
        </div>

        {!isUser && message.suggestedBags && message.suggestedBags.length > 0 && (
          <div className="chat-suggestions">
            <h5 className="chat-suggestions__heading">
              <i className="las la-shopping-bag" aria-hidden="true"></i> Recommended Surprise Bags (
              {message.suggestedBags.length})
            </h5>
            <div className="chat-suggestions__carousel">
              {message.suggestedBags.map((bag) => (
                <ChatBagCard key={bag.id} bag={bag} />
              ))}
            </div>
          </div>
        )}

        {!isUser && message.suggestedStores && message.suggestedStores.length > 0 && (
          <div className="chat-suggestions">
            <h5 className="chat-suggestions__heading">
              <i className="las la-store" aria-hidden="true"></i> Recommended Stores (
              {message.suggestedStores.length})
            </h5>
            <div className="chat-suggestions__carousel">
              {message.suggestedStores.map((store) => (
                <ChatStoreCard key={store.id} store={store} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
