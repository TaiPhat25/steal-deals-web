import Link from "next/link";
import DragScrollRow from "./DragScrollRow";
import SurpriseBagCard, { type SurpriseBag } from "./SurpriseBagCard";

const nearExpiryBags: SurpriseBag[] = [
  {
    slug: "bakery-breakfast-box",
    imageSrc: "/assets/images/demos/demo-28/flash/1.jpg",
    imageAlt: "Bakery breakfast surprise bag",
    name: "Bakery Breakfast Surprise Bag",
    storeName: "Morning Oven Bakery",
    category: "Bakery",
    originalPrice: 95000,
    salePrice: 45000,
    discountPercent: 53,
    pickupWindow: "Today, 5:00 - 7:00 PM",
    distance: "1.2 km away",
    remainingQuantity: 4,
    availabilityLabel: "Pickup today",
  },
  {
    slug: "fresh-produce-box",
    imageSrc: "/assets/images/demos/demo-28/flash/2.jpg",
    imageAlt: "Fresh produce surprise bag",
    name: "Fresh Produce Surprise Bag",
    storeName: "Green Basket Market",
    category: "Vegetables",
    originalPrice: 120000,
    salePrice: 59000,
    discountPercent: 51,
    pickupWindow: "Today, 6:00 - 8:00 PM",
    distance: "2.4 km away",
    remainingQuantity: 6,
    availabilityLabel: "Pickup today",
  },
  {
    slug: "seafood-family-box",
    imageSrc: "/assets/images/demos/demo-28/flash/3.jpg",
    imageAlt: "Seafood family surprise bag",
    name: "Seafood Family Surprise Bag",
    storeName: "Harbor Fresh Foods",
    category: "Seafood",
    originalPrice: 360000,
    salePrice: 189000,
    discountPercent: 48,
    pickupWindow: "Today, 4:30 - 6:30 PM",
    distance: "3.1 km away",
    remainingQuantity: 2,
    availabilityLabel: "Limited bags",
  },
  {
    slug: "fruit-and-juice-box",
    imageSrc: "/assets/images/demos/demo-28/flash/4.jpg",
    imageAlt: "Fruit and juice surprise bag",
    name: "Fruit and Juice Surprise Bag",
    storeName: "Daily Harvest Shop",
    category: "Fruits",
    originalPrice: 150000,
    salePrice: 69000,
    discountPercent: 54,
    pickupWindow: "Today, 5:30 - 7:30 PM",
    distance: "1.8 km away",
    remainingQuantity: 5,
    availabilityLabel: "Pickup today",
  },
  {
    slug: "dairy-snack-box",
    imageSrc: "/assets/images/demos/demo-28/flash/5.jpg",
    imageAlt: "Dairy snack surprise bag",
    name: "Dairy and Snack Surprise Bag",
    storeName: "Neighborhood Grocery",
    category: "Dairy & Cheese",
    originalPrice: 180000,
    salePrice: 79000,
    discountPercent: 56,
    pickupWindow: "Today, 7:00 - 9:00 PM",
    distance: "2.7 km away",
    remainingQuantity: 3,
    availabilityLabel: "Limited bags",
  },
];

export default function NearExpirySection() {
  return (
    <section className="near-expiry-section bg-lighter py-5" aria-labelledby="near-expiry-title">
      <div className="container">
        <div className="near-expiry-section__heading">
          <div>
            <p className="near-expiry-section__eyebrow">Rescue good food near you</p>
            <h2 id="near-expiry-title" className="title mb-1">
              Near-Expiry Surprise Bags
            </h2>
            <p className="near-expiry-section__description mb-0">
              Save money and help reduce food waste with discounted bags available for pickup today.
            </p>
          </div>
          <Link href="/category?sort=near-expiry" className="near-expiry-section__view-all">
            View all surprise bags
            <i className="icon-angle-right" aria-hidden="true"></i>
          </Link>
        </div>

        <DragScrollRow className="drag-scroll-row near-expiry-scroll-row" visibleItems={5}>
          {nearExpiryBags.map((bag) => (
            <SurpriseBagCard key={bag.slug} bag={bag} />
          ))}
        </DragScrollRow>
      </div>
    </section>
  );
}
