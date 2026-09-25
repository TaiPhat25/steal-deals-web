import RequireAuth from "@/components/auth/RequireAuth";
import OrderDetailMain from "@/components/orders/OrderDetailMain";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <RequireAuth>
      <OrderDetailMain orderId={id} />
    </RequireAuth>
  );
}
