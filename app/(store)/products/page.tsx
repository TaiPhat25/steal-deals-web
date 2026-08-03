import ProductListing from "@/components/products/ProductListing";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const category = first(query.category);
  const search = first(query.q);
  const sort = first(query.sort);

  return (
    <ProductListing
      key={`${category ?? ""}:${search ?? ""}:${sort ?? ""}`}
      initialCategory={category}
      initialQuery={search}
      initialSort={sort}
    />
  );
}
