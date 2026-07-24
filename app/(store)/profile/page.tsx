import RequireAuth from "@/components/auth/RequireAuth";
import ProfileMain from "@/components/profile/ProfileMain";

export default function Page() {
  return (
    <RequireAuth>
      <ProfileMain />
    </RequireAuth>
  );
}
