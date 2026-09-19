import type { Metadata } from "next";
import AuthProvider from "@/components/auth/AuthProvider";
import RequireAuth from "@/components/auth/RequireAuth";
import DashboardShell from "@/components/dashboard/DashboardShell";
import SellerDemoProvider from "@/components/seller/SellerDemoProvider";
import { BRAND_NAME, withBrandTitle } from "@/lib/brand";
import "../dashboard.css";

export const metadata: Metadata = {
  title: withBrandTitle("Seller Dashboard"),
  description: `${BRAND_NAME} Seller Dashboard`,
};

export default function SellerRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          rel="icon"
          href="/dashboard/favicon0a4b.ico"
          sizes="38x38"
          type="image/x-icon"
        />
      </head>
      <body className="min-h-screen antialiased">
        <AuthProvider>
          <RequireAuth loginPath="/login">
            <SellerDemoProvider>
              <DashboardShell role="seller">{children}</DashboardShell>
            </SellerDemoProvider>
          </RequireAuth>
        </AuthProvider>
      </body>
    </html>
  );
}
