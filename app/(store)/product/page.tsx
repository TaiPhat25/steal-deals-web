import { notFound } from "next/navigation";
import ProductMain from "@/components/product/ProductMain";
import { ApiClientError } from "@/lib/api/client";
import { isBagAvailable } from "@/lib/bag-availability";
import { getBag, listAvailableBags } from "@/lib/api/store";
import { toListingBag, type ListingBag } from "@/components/products/product-listing-data";
import type { SurpriseBagResponse } from "@/lib/api/dashboard-types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function selectRelatedBags(current: ListingBag, candidates: ListingBag[]) {
  const sameCategory = candidates.filter(
    (bag) => bag.slug !== current.slug && bag.category === current.category,
  );
  const fallback = candidates.filter(
    (bag) => bag.slug !== current.slug && bag.category !== current.category,
  );

  return [...sameCategory, ...fallback].slice(0, 5);
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const bagKey = first(query.bag)?.trim();

  if (!bagKey) notFound();

  let bagResponse: SurpriseBagResponse | undefined;
  let availableResponses: SurpriseBagResponse[] = [];

  try {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(bagKey)) {
      const [selectedBag, availableBags] = await Promise.all([
        getBag(bagKey),
        listAvailableBags(),
      ]);
      availableResponses = availableBags;
      bagResponse = isBagAvailable(selectedBag) ? selectedBag : undefined;
    } else {
      availableResponses = await listAvailableBags();
      bagResponse = availableResponses.find(
        (item) => item.id.toLowerCase() === bagKey.toLowerCase(),
      );
    }
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) notFound();
    throw error;
  }

  if (!bagResponse) notFound();

  const bag = toListingBag(bagResponse);
  const relatedBags = selectRelatedBags(
    bag,
    availableResponses.map(toListingBag),
  );

  return <ProductMain bag={bag} relatedBags={relatedBags} />;
}
