import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/DashboardShell";
import "../dashboard.css";

export const metadata: Metadata = {
  title: "Seller Dashboard | StealDeal",
  description: "StealDeal Seller Dashboard",
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
        <DashboardShell role="seller">{children}</DashboardShell>
      </body>
    </html>
  );
}
