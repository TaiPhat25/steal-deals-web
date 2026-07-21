import BannerGroupOne from "@/components/home/BannerGroupOne";
import BannerGroupTwo from "@/components/home/BannerGroupTwo";
import BlogSection from "@/components/home/BlogSection";
import BrandSection from "@/components/home/BrandSection";
import CategorySection from "@/components/home/CategorySection";
import FlashSection from "@/components/home/FlashSection";
import IconBoxesGroup from "@/components/home/IconBoxesGroup";
import IntroSection from "@/components/home/IntroSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import RecommendSection from "@/components/home/RecommendSection";
import ServiceSection from "@/components/home/ServiceSection";
// import NewsletterPopup from "@/components/home/NewsletterPopup";

export default function Home() {
  return (
    <>
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
      {/* <NewsletterPopup /> */}
    </>
  );
}
