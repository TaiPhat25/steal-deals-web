import StoreListing from "@/components/stores/StoreListing";
import { parseStoreListingSearchParams } from "@/components/stores/store-listing-query";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const urlSearchParams = new URLSearchParams();

  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    const firstValue = Array.isArray(value) ? value[0] : value;

    if (firstValue !== undefined) {
      urlSearchParams.set(key, firstValue);
    }
  });

  return (
    <StoreListing
      initialState={parseStoreListingSearchParams(urlSearchParams)}
    />
  );
}
