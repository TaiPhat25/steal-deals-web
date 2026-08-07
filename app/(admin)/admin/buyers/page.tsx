import { Suspense } from "react";
import AdminUsersPage from "@/components/admin/users/AdminUsersPage";

export default function AdminBuyers() {
  return (
    <Suspense fallback={null}>
      <AdminUsersPage
        basePath="/admin/buyers"
        fixedRole="Customer"
        title="Buyer Management"
      />
    </Suspense>
  );
}
