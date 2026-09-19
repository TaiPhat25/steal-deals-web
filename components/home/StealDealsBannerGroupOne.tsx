import Image from "next/image";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

const campaigns = [
  {
    image: "/assets/images/home/campaign-bakery-rescue.webp",
    imageAlt: "A surprise bag filled with rescued bakery food",
    eyebrow: "Daily rescue deals",
    title: "Save up to 60% on bags near you",
    href: "/products?sort=near-expiry",
  },
  {
    image: "/assets/images/home/campaign-local-pickup.webp",
    imageAlt: "Fresh food packed and ready for local pickup",
    eyebrow: "Local pickup",
    title: "Good food, lower prices, less waste",
    href: "/products?sort=distance",
  },
  {
    image: "/assets/images/home/campaign-variety.webp",
    imageAlt: "A variety of rescued food from local stores",
    eyebrow: "Explore more",
    title: "Find a surprise bag for every taste",
    href: "/products",
  },
];

export default function StealDealsBannerGroupOne() {
  return (
    <section className="banner-group-1 mt-1 mb-1" aria-label={`${BRAND_NAME} campaigns`}>
      <div className="container">
        <div className="home-campaign-grid">
          {campaigns.map((campaign) => (
            <div key={campaign.eyebrow} className="banner mb-0">
              <Link href={campaign.href}>
                <Image
                  src={campaign.image}
                  width={460}
                  height={210}
                  alt={campaign.imageAlt}
                />
              </Link>
              <div className="banner-content p-3">
                <h5 className="banner-subtitle font-weight-normal text-light mb-1">{campaign.eyebrow}</h5>
                <h3 className="banner-title font-weight-bold">{campaign.title}</h3>
                <Link href={campaign.href} className="banner-link text-decoration-none">
                  Explore now<i className="icon-angle-right"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
