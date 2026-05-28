import BannerGroupOne from "./components/home/BannerGroupOne";
import BannerGroupTwo from "./components/home/BannerGroupTwo";
import BlogSection from "./components/home/BlogSection";
import BrandSection from "./components/home/BrandSection";
import CategorySection from "./components/home/CategorySection";
import FlashSection from "./components/home/FlashSection";
import Footer from "./components/home/Footer";
import Header from "./components/home/Header";
import IconBoxesGroup from "./components/home/IconBoxesGroup";
import IntroSection from "./components/home/IntroSection";
import MobileMenu from "./components/home/MobileMenu";
import NewsletterPopup from "./components/home/NewsletterPopup";
import NewsletterSection from "./components/home/NewsletterSection";
import RecommendSection from "./components/home/RecommendSection";
import ServiceSection from "./components/home/ServiceSection";
import SigninModal from "./components/home/SigninModal";
import InteractiveHandlers from "./components/InteractiveHandlers";

export default function Home() {
  return (
    <>
      <div className="page-wrapper">
        <Header />
        <main className="main">
          <div className="page-content">
            <IntroSection />
            <BannerGroupOne />
            <IconBoxesGroup />
            <CategorySection />
            <FlashSection />
            <BrandSection />
            <NewsletterSection />
            <BannerGroupTwo />
            <RecommendSection />
            <ServiceSection />
            <BlogSection />
          </div>
        </main>
        <Footer />
      </div>
      <button id="scroll-top" title="Back to Top">
        <i className="icon-arrow-up"></i>
      </button>
      <MobileMenu />
      <SigninModal />
      <NewsletterPopup />
      <InteractiveHandlers />
    </>
  );
}
