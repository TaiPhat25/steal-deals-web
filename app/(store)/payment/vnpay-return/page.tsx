import RequireAuth from "@/components/auth/RequireAuth";
import VnPayReturnMain from "@/components/payment/VnPayReturnMain";

export default function Page() {
  return (
    <RequireAuth>
      <VnPayReturnMain />
    </RequireAuth>
  );
}
