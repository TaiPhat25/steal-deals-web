import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import StoreInfo from "@/components/stores/StoreInfo";
import StoreProducts from "@/components/stores/StoreProducts";
import StoreReviews from "@/components/stores/StoreReviews";
import { mapStoreResponse } from "@/components/stores/store-api-mappers";
import { ApiClientError } from "@/lib/api/client";
import { getStore, listStoreBags, listStoreReviews } from "@/lib/api/store";

type StoreDetailPageProps = {
  params: Promise<{ id: string }>;
};

const loadStorePageData = cache(async (id: string) => {
  try {
    const [store, bags, reviews] = await Promise.all([
      getStore(id),
      listStoreBags(id),
      listStoreReviews(id),
    ]);

    return mapStoreResponse(store, bags, reviews);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      return null;
    }

    throw error;
  }
});

export async function generateMetadata({ params }: StoreDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const store = await loadStorePageData(id);

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
  const store = await loadStorePageData(id);

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
