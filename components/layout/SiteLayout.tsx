"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import InteractiveHandlers from "@/components/home/InteractiveHandlers";
import MobileMenu from "@/components/home/MobileMenu";
import AuthProvider from "@/components/auth/AuthProvider";
import CartProvider from "@/components/cart/CartProvider";
import ToastProvider from "@/components/notifications/ToastProvider";
import UserLocationProvider from "@/components/location/UserLocationProvider";
import ChatWidget from "@/components/chat/ChatWidget";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <AuthProvider>
      <UserLocationProvider>
        <CartProvider>
          <ToastProvider>
            <div className={`page-wrapper ${isHome ? "page-wrapper--home" : "page-wrapper--inner"}`}>
              <Header />
              {children}
              <Footer />
            </div>
            <button id="scroll-top" title="Back to Top">
              <i className="icon-arrow-up"></i>
            </button>
            <ChatWidget />
            <MobileMenu />
            <InteractiveHandlers />
          </ToastProvider>
        </CartProvider>
      </UserLocationProvider>
    </AuthProvider>
  );
}
