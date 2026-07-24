import type { Metadata } from "next";
import AuthProvider from "@/components/auth/AuthProvider";
import DashboardShell from "@/components/dashboard/DashboardShell";
import "../dashboard.css";

export const metadata: Metadata = {
  title: "Dashboard | Sellzy - Admin Dashboard",
  description: "Sellzy Admin Dashboard overview.",
};

export default function AdminRootLayout({
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
          <DashboardShell role="admin">{children}</DashboardShell>
        </AuthProvider>
      </body>
    </html>
  );
}
