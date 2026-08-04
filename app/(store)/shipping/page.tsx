import RequireAuth from "@/components/auth/RequireAuth";
import ShippingMain from "@/components/shipping/ShippingMain";

export default function Page() {
  return (
    <RequireAuth>
      <ShippingMain />
    </RequireAuth>
  );
}
