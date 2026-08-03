import { notFound } from "next/navigation";
import ProductListing from "@/components/products/ProductListing";
import { storeNames } from "@/components/products/product-listing-data";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ storeSlug: string }>;
  searchParams: SearchParams;
}) {
  const { storeSlug } = await params;
  const query = await searchParams;
  const category = first(query.category);
  const search = first(query.q);
  const sort = first(query.sort);

  if (!storeNames[storeSlug]) notFound();

  return (
    <ProductListing
      key={`${storeSlug}:${category ?? ""}:${search ?? ""}:${sort ?? ""}`}
      initialCategory={category}
      initialQuery={search}
      initialSort={sort}
      storeSlug={storeSlug}
    />
  );
}
