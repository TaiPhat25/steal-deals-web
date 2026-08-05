import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import StoreInfo from "@/components/stores/StoreInfo";
import StoreProducts from "@/components/stores/StoreProducts";
import StoreReviews from "@/components/stores/StoreReviews";
import {
  getStoreProfileByRouteId,
  storeProfiles,
} from "@/components/stores/store-profile-data";

type StoreDetailPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return storeProfiles.map((store) => ({
    id: store.id,
  }));
}

export async function generateMetadata({ params }: StoreDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const store = getStoreProfileByRouteId(id);

  if (!store) {
    return {
      title: "Store not found - Steal Deals",
    };
  }

  return {
    title: `${store.name} - Steal Deals`,
    description: store.description,
  };
}

export default async function StoreDetailPage({ params }: StoreDetailPageProps) {
  const { id } = await params;
  const store = getStoreProfileByRouteId(id);

  if (!store || !store.isActive) notFound();

  return (
    <main className="main store-detail-page">
      <div
        className="page-header text-center"
        style={{ backgroundImage: "url('/assets/images/page-header-bg.jpg')" }}
      >
        <div className="container">
          <h1 className="page-title">
            {store.name}
            <span>Store profile</span>
          </h1>
        </div>
      </div>

      <nav aria-label="breadcrumb" className="breadcrumb-nav mb-2">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/stores">Stores</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {store.name}
            </li>
          </ol>
        </div>
      </nav>

      <div className="page-content">
        <StoreInfo store={store} />
        <StoreProducts store={store} />
        <StoreReviews reviews={store.storeReviews} />
      </div>
    </main>
  );
}
