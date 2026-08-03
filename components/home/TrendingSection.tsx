import Link from "next/link";
import DragScrollRow from "./DragScrollRow";
import SurpriseBagCard, { type SurpriseBag } from "./SurpriseBagCard";

const trendingBags: SurpriseBag[] = [
  {
    slug: "trending-bakery-mix",
    imageSrc: "/assets/images/demos/demo-28/flash/7.jpg",
    imageAlt: "Trending bakery surprise bag",
    name: "Bakery Mix Surprise Bag",
    storeName: "Morning Oven Bakery",
    storeSlug: "morning-oven-bakery",
    category: "Bakery",
    originalPrice: 150000,
    salePrice: 69000,
    discountPercent: 54,
    pickupWindow: "Today, 5:00 - 7:00 PM",
    distance: "1.2 km away",
    remainingQuantity: 8,
    availabilityLabel: "Popular this week",
  },
  {
    slug: "trending-seafood-box",
    imageSrc: "/assets/images/demos/demo-28/flash/8.jpg",
    imageAlt: "Trending seafood surprise bag",
    name: "Seafood Weekend Surprise Bag",
    storeName: "Harbor Fresh Foods",
    storeSlug: "harbor-fresh-foods",
    category: "Seafood",
    originalPrice: 420000,
    salePrice: 219000,
    discountPercent: 48,
    pickupWindow: "Today, 4:30 - 6:30 PM",
    distance: "2.4 km away",
    remainingQuantity: 5,
    availabilityLabel: "Popular this week",
  },
  {
    slug: "trending-fruit-box",
    imageSrc: "/assets/images/demos/demo-28/flash/9.jpg",
    imageAlt: "Trending fruit surprise bag",
    name: "Fresh Fruit Surprise Bag",
    storeName: "Daily Harvest Shop",
    storeSlug: "daily-harvest-shop",
    category: "Fruits",
    originalPrice: 180000,
    salePrice: 85000,
    discountPercent: 53,
    pickupWindow: "Today, 5:30 - 7:30 PM",
    distance: "1.8 km away",
    remainingQuantity: 6,
    availabilityLabel: "Popular this week",
  },
  {
    slug: "trending-vegetable-box",
    imageSrc: "/assets/images/demos/demo-28/flash/10.jpg",
    imageAlt: "Trending vegetable surprise bag",
    name: "Vegetable Harvest Surprise Bag",
    storeName: "Green Basket Market",
    storeSlug: "green-basket-market",
    category: "Vegetables",
    originalPrice: 140000,
    salePrice: 65000,
    discountPercent: 54,
    pickupWindow: "Today, 6:00 - 8:00 PM",
    distance: "2.1 km away",
    remainingQuantity: 7,
    availabilityLabel: "Popular this week",
  },
  {
    slug: "trending-cafe-treats",
    imageSrc: "/assets/images/demos/demo-28/flash/11.jpg",
    imageAlt: "Trending cafe treats surprise bag",
    name: "Cafe Treats Surprise Bag",
    storeName: "Local Table Kitchen",
    storeSlug: "local-table-kitchen",
    category: "Prepared Meals",
    originalPrice: 200000,
    salePrice: 95000,
    discountPercent: 53,
    pickupWindow: "Today, 7:00 - 9:00 PM",
    distance: "3.5 km away",
    remainingQuantity: 4,
    availabilityLabel: "Popular this week",
  },
];

export default function TrendingSection() {
  return (
    <section className="trending-section bg-lighter py-5" aria-labelledby="trending-title">
      <div className="container">
        <div className="trending-section__heading">
          <div>
            <p className="trending-section__eyebrow">Popular with StealDeals buyers</p>
            <h2 id="trending-title" className="title mb-1">
              Trending Now
            </h2>
            <p className="trending-section__description mb-0">
              See the surprise bags buyers are discovering and sharing this week.
            </p>
          </div>
          <Link href="/products?sort=trending" className="trending-section__view-all">
            View all trending
            <i className="icon-angle-right" aria-hidden="true"></i>
          </Link>
        </div>

        <DragScrollRow className="drag-scroll-row trending-scroll-row" visibleItems={5}>
          {trendingBags.map((bag) => (
            <SurpriseBagCard key={bag.slug} bag={bag} />
          ))}
        </DragScrollRow>
      </div>
    </section>
  );
}
