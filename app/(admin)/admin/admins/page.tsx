import { Suspense } from "react";
import AdminUsersPage from "@/components/admin/users/AdminUsersPage";

export default function AdminAdmins() {
  return (
    <Suspense fallback={null}>
      <AdminUsersPage
        basePath="/admin/admins"
        fixedRole="Admin"
        notice="Frontend preview: SuperAdmin can manage administrator accounts. The backend still recognizes Admin only, so no SuperAdmin value is sent to the API."
        title="Admin Management"
      />
    </Suspense>
  );
}
