import type { Metadata } from "next";
import AuthProvider from "@/components/auth/AuthProvider";
import "../dashboard.css";

export const metadata: Metadata = {
  title: "Admin Login | Steal Deals",
  description: "Sign in to the Steal Deals administration dashboard.",
};

export default function AdminAuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="/dashboard/favicon0a4b.ico"
          sizes="38x38"
          type="image/x-icon"
        />
      </head>
      <body className="min-h-screen antialiased">
        <AuthProvider mode="admin">{children}</AuthProvider>
      </body>
    </html>
  );
}
