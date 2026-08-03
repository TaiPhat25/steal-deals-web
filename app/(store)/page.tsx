import FoodCategorySection from "@/components/home/FoodCategorySection";
import IntroSection from "@/components/home/IntroSection";
import NearExpirySection from "@/components/home/NearExpirySection";
import NewStoresSection from "@/components/home/NewStoresSection";
import NearbySection from "@/components/home/NearbySection";
import StealDealsBannerGroupOne from "@/components/home/StealDealsBannerGroupOne";
import StealDealsBenefits from "@/components/home/StealDealsBenefits";
import SustainabilityNewsSection from "@/components/home/SustainabilityNewsSection";
import TrendingSection from "@/components/home/TrendingSection";
// import NewsletterPopup from "@/components/home/NewsletterPopup";

export default function Home() {
  return (
    <>
      <main className="main">
        <div className="page-content">
          <IntroSection />
          <StealDealsBannerGroupOne />
          <StealDealsBenefits />
          <FoodCategorySection />
          <NearExpirySection />
          <NearbySection />
          <TrendingSection />
          <NewStoresSection />
          {/* <StealDealsNewsletterSection />
          <StealDealsBannerGroupTwo /> */}
          <SustainabilityNewsSection />
        </div>
      </main>
      {/* <NewsletterPopup /> */}
    </>
  );
}
