import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import StoreInfo from "@/components/stores/StoreInfo";
import StoreProducts from "@/components/stores/StoreProducts";
import StoreReviews from "@/components/stores/StoreReviews";
import { mapStoreResponse } from "@/components/stores/store-api-mappers";
import { ApiClientError } from "@/lib/api/client";
import {
  getStore,
  listAvailableStoreBags,
  listStoreReviews,
} from "@/lib/api/store";
import { withBrandTitle } from "@/lib/brand";

type StoreDetailPageProps = {
  params: Promise<{ id: string }>;
};

const loadStorePageData = cache(async (id: string) => {
  try {
    const [store, bags, reviews] = await Promise.all([
      getStore(id),
      listAvailableStoreBags(id),
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
      title: withBrandTitle("Store not found"),
    };
  }

  return {
    title: withBrandTitle(store.name),
    description: store.description,
  };
}

export default async function StoreDetailPage({ params }: StoreDetailPageProps) {
  const { id } = await params;
  const store = await loadStorePageData(id);

  if (!store || !store.isActive) notFound();

  return (
    <main className="main store-detail-page">
      <section className="info-page__hero info-page__hero--image">
        <Image
          src="/assets/images/page-headers/store-detail-v2.webp"
          alt="A local food shop preparing surprise bags for pickup"
          fill
          preload
          sizes="100vw"
        />
        <div className="info-page__hero-overlay" aria-hidden="true" />
        <div className="container info-page__hero-content">
          <p className="info-page__eyebrow">Local food rescue partner</p>
          <h1>{store.name}</h1>
          <p>
            Browse available surprise bags, pickup details, and customer reviews from {store.name}.
          </p>
        </div>
      </section>

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
