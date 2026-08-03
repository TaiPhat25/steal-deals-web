import Link from "next/link";
import DragScrollRow from "./DragScrollRow";
import NewStoreCard, { type NewStore } from "./NewStoreCard";

const newStores: NewStore[] = [
  {
    slug: "morning-oven-bakery",
    imageSrc: "/assets/images/demos/demo-28/banners/banner-1.jpg",
    imageAlt: "Fresh bakery products at Morning Oven Bakery",
    name: "Morning Oven Bakery",
    category: "Bakery and pastries",
    description: "Fresh bread and pastries rescued at the end of each day.",
    distance: "1.2 km away",
    pickupWindow: "5:00 - 7:00 PM",
    statusLabel: "New store",
  },
  {
    slug: "green-basket-market",
    imageSrc: "/assets/images/demos/demo-28/banners/banner-3.jpg",
    imageAlt: "Fresh produce at Green Basket Market",
    name: "Green Basket Market",
    category: "Fresh produce",
    description: "Seasonal fruits and vegetables available for local pickup.",
    distance: "2.4 km away",
    pickupWindow: "6:00 - 8:00 PM",
    statusLabel: "New store",
  },
  {
    slug: "harbor-fresh-foods",
    imageSrc: "/assets/images/demos/demo-28/banners/5.jpg",
    imageAlt: "Prepared food at Harbor Fresh Foods",
    name: "Harbor Fresh Foods",
    category: "Seafood and prepared meals",
    description: "Quality meals and seafood boxes prepared for same-day pickup.",
    distance: "3.1 km away",
    pickupWindow: "4:30 - 6:30 PM",
    statusLabel: "New store",
  },
  {
    slug: "daily-harvest-shop",
    imageSrc: "/assets/images/demos/demo-28/banners/4.jpg",
    imageAlt: "Fresh fruit at Daily Harvest Shop",
    name: "Daily Harvest Shop",
    category: "Fruits and drinks",
    description: "Fruit boxes and fresh drinks made available before closing.",
    distance: "1.8 km away",
    pickupWindow: "5:30 - 7:30 PM",
    statusLabel: "New store",
  },
  {
    slug: "neighborhood-grocery",
    imageSrc: "/assets/images/demos/demo-28/banners/6.jpg",
    imageAlt: "Grocery products at Neighborhood Grocery",
    name: "Neighborhood Grocery",
    category: "Dairy and snacks",
    description: "Everyday groceries packed into affordable surprise bags.",
    distance: "2.7 km away",
    pickupWindow: "7:00 - 9:00 PM",
    statusLabel: "New store",
  },
];

export default function NewStoresSection() {
  return (
    <section className="new-stores-section py-5" aria-labelledby="new-stores-title">
      <div className="container">
        <div className="new-stores-section__heading">
          <div>
            <p className="new-stores-section__eyebrow">Discover local businesses</p>
            <h2 id="new-stores-title" className="title mb-1">
              New on StealDeals
            </h2>
            <p className="new-stores-section__description mb-0">
              Meet new stores joining the food rescue community in your area.
            </p>
          </div>
          <Link href="/category?sort=new-stores" className="new-stores-section__view-all">
            View all stores
            <i className="icon-angle-right" aria-hidden="true"></i>
          </Link>
        </div>

        <DragScrollRow className="drag-scroll-row new-stores-scroll-row" visibleItems={5}>
          {newStores.map((store) => (
            <NewStoreCard key={store.slug} store={store} />
          ))}
        </DragScrollRow>
      </div>
    </section>
  );
}
