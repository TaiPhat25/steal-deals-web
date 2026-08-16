import { Suspense } from "react";
import AdminUsersPage from "@/components/admin/users/AdminUsersPage";

export default function AdminAdmins() {
  return (
    <Suspense fallback={null}>
      <AdminUsersPage
        adminAccounts
        basePath="/admin/admins"
        title="Admin Management"
      />
    </Suspense>
  );
}
