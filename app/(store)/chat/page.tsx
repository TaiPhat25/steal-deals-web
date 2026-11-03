import type { Metadata } from "next";
import Link from "next/link";
import ChatMain from "@/components/chat/ChatMain";
import { withBrandTitle } from "@/lib/brand";

export const metadata: Metadata = {
  title: withBrandTitle("AI Assistant"),
  description:
    "Chat with StealDeals AI Assistant to find surplus food surprise bags, discover nearby stores, and check pickup windows.",
};

export default function ChatPage() {
  return (
    <main className="main chat-page">
      <nav aria-label="Breadcrumb" className="breadcrumb-nav border-0 mb-0">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">Home</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              AI Assistant
            </li>
          </ol>
        </div>
      </nav>

      <ChatMain />
    </main>
  );
}
