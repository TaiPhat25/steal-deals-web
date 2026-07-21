import { Suspense } from "react";
import AdminUsersPage from "@/components/admin/users/AdminUsersPage";

export default function AdminUsers() {
  return (
    <Suspense fallback={null}>
      <AdminUsersPage />
    </Suspense>
  );
}
