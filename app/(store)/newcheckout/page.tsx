import RequireAuth from "@/components/auth/RequireAuth";
import NewCheckoutMain from "@/components/checkout/NewCheckoutMain";

export default function Page() {
  return (
    <RequireAuth>
      <NewCheckoutMain />
    </RequireAuth>
  );
}
