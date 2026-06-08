"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import InteractiveHandlers from "@/components/home/InteractiveHandlers";
import MobileMenu from "@/components/home/MobileMenu";
import SigninModal from "@/components/home/SigninModal";

export default function LayoutChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
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
    </>
  );
}
