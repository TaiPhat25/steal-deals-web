import { notFound } from "next/navigation";
import ProductMain from "@/components/product/ProductMain";
import { surpriseBags } from "@/components/products/product-listing-data";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const bagSlug = first(query.bag)?.trim().toLowerCase();
  const bag = bagSlug ? surpriseBags.find((item) => item.slug === bagSlug) : undefined;

  if (!bag) notFound();

  return <ProductMain bag={bag} />;
}
