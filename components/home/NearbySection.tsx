import Link from "next/link";
import DragScrollRow from "./DragScrollRow";
import SurpriseBagCard, { type SurpriseBag } from "./SurpriseBagCard";

const nearbyBags: SurpriseBag[] = [
  {
    slug: "nearby-bakery-box",
    imageSrc: "/assets/images/demos/demo-28/flash/1.jpg",
    imageAlt: "Nearby bakery surprise bag",
    name: "End-of-Day Bakery Bag",
    storeName: "Morning Oven Bakery",
    storeSlug: "morning-oven-bakery",
    category: "Bakery",
    originalPrice: 100000,
    salePrice: 49000,
    discountPercent: 51,
    pickupWindow: "Today, 5:00 - 7:00 PM",
    distance: "0.6 km away",
    remainingQuantity: 4,
    availabilityLabel: "Pickup nearby",
  },
  {
    slug: "nearby-market-box",
    imageSrc: "/assets/images/demos/demo-28/flash/2.jpg",
    imageAlt: "Nearby market surprise bag",
    name: "Market Fresh Surprise Bag",
    storeName: "Green Basket Market",
    storeSlug: "green-basket-market",
    category: "Vegetables",
    originalPrice: 135000,
    salePrice: 65000,
    discountPercent: 52,
    pickupWindow: "Today, 6:00 - 8:00 PM",
    distance: "1.1 km away",
    remainingQuantity: 3,
    availabilityLabel: "Pickup nearby",
  },
  {
    slug: "nearby-seafood-box",
    imageSrc: "/assets/images/demos/demo-28/flash/3.jpg",
    imageAlt: "Nearby seafood surprise bag",
    name: "Seafood Dinner Surprise Bag",
    storeName: "Harbor Fresh Foods",
    storeSlug: "harbor-fresh-foods",
    category: "Seafood",
    originalPrice: 340000,
    salePrice: 175000,
    discountPercent: 49,
    pickupWindow: "Today, 4:30 - 6:30 PM",
    distance: "1.8 km away",
    remainingQuantity: 2,
    availabilityLabel: "Limited bags",
  },
  {
    slug: "nearby-fruit-box",
    imageSrc: "/assets/images/demos/demo-28/flash/4.jpg",
    imageAlt: "Nearby fruit surprise bag",
    name: "Fresh Fruit Surprise Bag",
    storeName: "Daily Harvest Shop",
    storeSlug: "daily-harvest-shop",
    category: "Fruits",
    originalPrice: 145000,
    salePrice: 70000,
    discountPercent: 52,
    pickupWindow: "Today, 5:30 - 7:30 PM",
    distance: "2.2 km away",
    remainingQuantity: 6,
    availabilityLabel: "Pickup nearby",
  },
  {
    slug: "nearby-dairy-box",
    imageSrc: "/assets/images/demos/demo-28/flash/5.jpg",
    imageAlt: "Nearby dairy surprise bag",
    name: "Dairy and Snack Bag",
    storeName: "Neighborhood Grocery",
    storeSlug: "neighborhood-grocery",
    category: "Dairy & Cheese",
    originalPrice: 180000,
    salePrice: 85000,
    discountPercent: 53,
    pickupWindow: "Today, 7:00 - 9:00 PM",
    distance: "2.9 km away",
    remainingQuantity: 5,
    availabilityLabel: "Pickup nearby",
  },
];

export default function NearbySection() {
  return (
    <section className="nearby-section py-5" aria-labelledby="nearby-title">
      <div className="container">
        <div className="nearby-section__heading">
          <div>
            <p className="nearby-section__eyebrow">Find food close to you</p>
            <h2 id="nearby-title" className="title mb-1">
              Near You
            </h2>
            <p className="nearby-section__description mb-0">
              Discover surprise bags from nearby stores and pick them up before they are gone.
            </p>
          </div>
          <Link href="/products?sort=distance" className="nearby-section__view-all">
            View all nearby
            <i className="icon-angle-right" aria-hidden="true"></i>
          </Link>
        </div>

        <DragScrollRow className="drag-scroll-row nearby-scroll-row" visibleItems={5}>
          {nearbyBags.map((bag) => (
            <SurpriseBagCard key={bag.slug} bag={bag} />
          ))}
        </DragScrollRow>
      </div>
    </section>
  );
}
