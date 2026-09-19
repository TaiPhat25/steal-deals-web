import type { Metadata } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";
import SiteLayout from "@/components/layout/SiteLayout";
import { BRAND_NAME, BRAND_TITLE } from "@/lib/brand";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: BRAND_TITLE,
  description:
    "Discover discounted surplus food from local stores and collect it during convenient pickup windows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta
          name="keywords"
          content="food rescue, surprise bags, surplus food, local stores, discounted food"
        />
        <meta name="author" content={BRAND_NAME} />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/assets/images/brand/steal-deals-apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/assets/images/brand/steal-deals-icon-32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/assets/images/brand/steal-deals-icon-16.png"
        />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-title" content={BRAND_NAME} />
        <meta name="application-name" content={BRAND_NAME} />
        <meta name="msapplication-TileColor" content="#22a642" />
        <meta name="theme-color" content="#22a642" />
        <link
          rel="stylesheet"
          href="/assets/vendor/line-awesome/line-awesome/line-awesome/css/line-awesome.min.css"
        />
        <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/plugins/magnific-popup/magnific-popup.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
        <link rel="stylesheet" href="/assets/css/skins/skin-demo-28.css" />
        <link rel="stylesheet" href="/assets/css/demos/demo-28.css" />
        <link rel="stylesheet" href="/assets/css/custom.css" />
        <Script src="/assets/js/jquery.min.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-full flex flex-col">
        <SiteLayout>{children}</SiteLayout>
        <Script src="/assets/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/jquery.hoverIntent.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/jquery.waypoints.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/superfish.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/jquery.magnific-popup.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/bootstrap-input-spinner.js" strategy="afterInteractive" />
        <Script src="/assets/js/jquery.elevateZoom.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/main.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
