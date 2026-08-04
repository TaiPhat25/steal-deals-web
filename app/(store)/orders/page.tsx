import RequireAuth from "@/components/auth/RequireAuth";
import OrderHistoryMain from "@/components/orders/OrderHistoryMain";

export default function Page() {
  return (
    <RequireAuth>
      <OrderHistoryMain />
    </RequireAuth>
  );
}
