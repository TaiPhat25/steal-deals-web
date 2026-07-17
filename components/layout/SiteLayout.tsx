"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import InteractiveHandlers from "@/components/home/InteractiveHandlers";
import MobileMenu from "@/components/home/MobileMenu";
import SigninModal from "@/components/home/SigninModal";
import AuthProvider from "@/components/auth/AuthProvider";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <AuthProvider>
      <div className={`page-wrapper ${isHome ? "page-wrapper--home" : "page-wrapper--inner"}`}>
        <Header />
        {children}
        <Footer />
      </div>
      <button id="scroll-top" title="Back to Top">
        <i className="icon-arrow-up"></i>
      </button>
      <MobileMenu />
      <SigninModal />
      <InteractiveHandlers />
    </AuthProvider>
  );
}
