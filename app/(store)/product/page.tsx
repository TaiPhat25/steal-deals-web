import { notFound } from "next/navigation";
import ProductMain from "@/components/product/ProductMain";
import { ApiClientError } from "@/lib/api/client";
import { getBag, listBags } from "@/lib/api/store";
import { toListingBag, type ListingBag } from "@/components/products/product-listing-data";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const bagKey = first(query.bag)?.trim();

  if (!bagKey) notFound();

  let bag: ListingBag | undefined;

  try {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(bagKey)) {
      bag = toListingBag(await getBag(bagKey));
    } else {
      const response = await listBags();
      bag = response.map(toListingBag).find((item) => item.slug === bagKey.toLowerCase());
    }
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) notFound();
    throw error;
  }

  if (!bag) notFound();

  return <ProductMain bag={bag} />;
}
