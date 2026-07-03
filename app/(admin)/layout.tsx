import type { Metadata } from "next";

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
        <link rel="stylesheet" href="/admin/css/style.css" />
        <link
          rel="icon"
          href="/admin/favicon0a4b.ico"
          sizes="38x38"
          type="image/x-icon"
        />
      </head>
      <body
        className="dm_sans_efc253b3-module__w1i8Da__variable public_sans_97488c5b-module__BMdkga__variable urbanist_6ad93ace-module__UTwf1G__variable antialiased min-h-screen"
        style={{ margin: 0 }}
      >
        {children}
      </body>
    </html>
  );
}
