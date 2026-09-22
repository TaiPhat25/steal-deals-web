import RequireAuth from "@/components/auth/RequireAuth";
import NewCartMain from "@/components/cart/NewCartMain";

export default function Page() {
  return (
    <RequireAuth>
      <NewCartMain />
    </RequireAuth>
  );
}
