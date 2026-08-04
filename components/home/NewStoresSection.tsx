import Link from "next/link";
import DragScrollRow from "./DragScrollRow";
import NewStoreCard from "./NewStoreCard";
import { newStoreProfiles } from "@/components/stores/store-profile-data";

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
          <Link href="/products?sort=newest" className="new-stores-section__view-all">
            Browse new bags
            <i className="icon-angle-right" aria-hidden="true"></i>
          </Link>
        </div>

        <DragScrollRow className="drag-scroll-row new-stores-scroll-row" visibleItems={5}>
          {newStoreProfiles.map((store) => (
            <NewStoreCard key={store.id} store={store} />
          ))}
        </DragScrollRow>
      </div>
    </section>
  );
}
