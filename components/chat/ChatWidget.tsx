"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ChatMain from "./ChatMain";

const BOT_AVATAR_SRC = "/assets/images/brand/ai-bot-avatar.png";

export default function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Dedicated /chat page already renders full-screen ChatMain
  if (pathname === "/chat") {
    return null;
  }

  return (
    <>
      {isOpen && (
        <div
          id="stealdeals-chat-widget-panel"
          className="chat-widget-panel"
          role="dialog"
          aria-label="StealDeals AI Assistant"
        >
          <ChatMain variant="widget" onClose={() => setIsOpen(false)} />
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`chat-widget-fab ${isOpen ? "chat-widget-fab--open" : ""}`}
        aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
        aria-expanded={isOpen}
        aria-controls="stealdeals-chat-widget-panel"
        title={isOpen ? "Close AI Assistant" : "Chat with StealDeals AI"}
      >
        {isOpen ? (
          <i className="icon-close" aria-hidden="true"></i>
        ) : (
          <Image
            src={BOT_AVATAR_SRC}
            alt="StealDeals AI Assistant"
            width={34}
            height={34}
            className="chat-widget-fab__img"
          />
        )}
      </button>
    </>
  );
}
