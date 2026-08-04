import CartMain from "@/components/cart/CartMain";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const quantityValue = Number(first(query.quantity));
  const initialQuantity = Number.isFinite(quantityValue) ? quantityValue : undefined;

  return <CartMain initialBagSlug={first(query.bag)} initialQuantity={initialQuantity} />;
}
