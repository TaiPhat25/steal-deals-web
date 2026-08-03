import Link from "next/link";
import SurpriseBagCard, { type SurpriseBag } from "@/components/home/SurpriseBagCard";
import type { StoreProfile, StoreSurpriseBag } from "@/components/stores/store-profile-data";

function formatPickupWindow(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const day = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(startDate);
  const startTime = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(startDate);
  const endTime = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(endDate);

  return `${day}, ${startTime} - ${endTime}`;
}

function toCardBag(store: StoreProfile, bag: StoreSurpriseBag, index: number): SurpriseBag {
  const category = bag.categories[0]?.name ?? "Surprise Bag";
  const discountPercent = Math.round(((bag.originalPrice - bag.salePrice) / bag.originalPrice) * 100);

  return {
    slug: bag.id,
    imageSrc: `/assets/images/demos/demo-28/flash/${(index % 12) + 1}.jpg`,
    imageAlt: bag.name,
    name: bag.name,
    storeName: store.name,
    category,
    originalPrice: bag.originalPrice,
    salePrice: bag.salePrice,
    discountPercent,
    pickupWindow: formatPickupWindow(bag.pickupStartTime, bag.pickupEndTime),
    distance: "Store pickup",
    remainingQuantity: bag.quantityRemaining,
    availabilityLabel: bag.status,
    storeSlug: store.id,
  };
}

export default function StoreProducts({ store }: { store: StoreProfile }) {
  const activeProducts = store.surpriseBags.filter(
    (bag) => bag.status === "Active" && bag.quantityRemaining > 0,
  );

  return (
    <section
      className="store-detail-page__section store-products-section"
      id="store-products"
      aria-labelledby="store-products-title"
    >
      <div className="container">
        <div className="store-detail-page__heading">
          <div>
            <p className="store-detail-page__eyebrow">Available surprise bags</p>
            <h2 id="store-products-title" className="title mb-1">
              Bags From {store.name}
            </h2>
            <p className="store-detail-page__description mb-0">
              Current products this store is selling for pickup.
            </p>
          </div>
          <Link href={`/products?q=${encodeURIComponent(store.name)}`} className="store-detail-page__view-all">
            View in marketplace
            <i className="icon-angle-right" aria-hidden="true"></i>
          </Link>
        </div>

        {activeProducts.length ? (
          <div className="store-products-scroll-row" aria-label={`${store.name} surprise bags`}>
            {activeProducts.map((bag, index) => (
              <div className="store-products-scroll-row__item" key={bag.id}>
                <SurpriseBagCard bag={toCardBag(store, bag, index)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="store-products__empty">
            <h3>No bags available</h3>
            <p>This store does not have active surprise bags right now.</p>
          </div>
        )}
      </div>
    </section>
  );
}
