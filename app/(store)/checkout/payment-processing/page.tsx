import RequireAuth from "@/components/auth/RequireAuth";
import PaymentProcessingMain from "@/components/payment/PaymentProcessingMain";

export default function Page() {
  return (
    <RequireAuth>
      <PaymentProcessingMain />
    </RequireAuth>
  );
}
