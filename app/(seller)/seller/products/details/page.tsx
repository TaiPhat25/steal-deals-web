"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardButton, DashboardCard, ProductImage, StatusBadge } from "@/components/dashboard/ui";
import { DashboardToast } from "@/components/dashboard/Dialog";
import { useSellerDemo } from "@/components/seller/SellerDemoProvider";

const money = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
const dateTime = (value: string) => new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

function ProductDetailsContent() {
  const router = useRouter();
  const id = useSearchParams().get("id");
  const { products, setProducts } = useSellerDemo();
  const [toast, setToast] = useState("");
  const product = products.find((item) => item.id === id);
  if (!product) return <DashboardCard className="p-8 text-center"><h1 className="text-xl font-bold">Surplus bag not found</h1><p className="mt-2 text-sm text-light-secondary-text">The selected dummy record does not exist or was deleted.</p><Link href="/seller/products" className="mt-5 inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-bold text-white">Back to bags</Link></DashboardCard>;
  const currentProduct = product;
  const tone = currentProduct.status === "Active" ? "success" : currentProduct.status === "Sold out" ? "error" : "warning";

  function toggleStatus() {
    const status = currentProduct.status === "Active" ? "Draft" : currentProduct.quantityRemaining > 0 ? "Active" : "Sold out";
    setProducts((items) => items.map((item) => item.id === currentProduct.id ? { ...item, status } : item));
    setToast(`${currentProduct.name} marked ${status.toLowerCase()}.`);
  }

  function duplicate() {
    const copy = { ...currentProduct, id: crypto.randomUUID(), name: `${currentProduct.name} copy`, status: "Draft" as const, createdAt: new Date().toISOString() };
    setProducts((items) => [copy, ...items]);
    router.push(`/seller/products/edit?id=${copy.id}`);
  }

  return (
    <>
      {toast && <DashboardToast key={toast}>{toast}</DashboardToast>}
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><Link href="/seller/products" className="text-sm font-semibold text-primary hover:underline">← Back to bags</Link><h1 className="mt-2 text-xl font-bold">Surplus Bag Details</h1></div><div className="flex flex-wrap gap-3"><DashboardButton variant="secondary" onClick={duplicate}>Duplicate as draft</DashboardButton><DashboardButton variant="secondary" onClick={toggleStatus}>{product.status === "Active" ? "Move to draft" : "Activate"}</DashboardButton><Link href={`/seller/products/edit?id=${product.id}`} className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-bold text-white hover:bg-primary-dark">Edit bag</Link></div></div>
        <DashboardCard className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[280px_1fr]">
          <div className="overflow-hidden rounded-2xl bg-gray-100"><ProductImage alt={product.name} /></div>
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm text-light-secondary-text">#{product.id}</p><h2 className="mt-1 text-2xl font-bold">{product.name}</h2><p className="mt-1 text-sm text-light-secondary-text">{product.categories.map((category) => category.name).join(", ")}</p></div><StatusBadge tone={tone}>{product.status}</StatusBadge></div>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-light-secondary-text">{product.description || "No description provided."}</p>
            <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-gray-100 p-4 sm:grid-cols-4"><div><dt className="text-xs text-light-secondary-text">Sale price</dt><dd className="mt-1 text-lg font-bold">{money(product.salePrice)}</dd></div><div><dt className="text-xs text-light-secondary-text">Original price</dt><dd className="mt-1 text-lg font-bold">{money(product.originalPrice)}</dd></div><div><dt className="text-xs text-light-secondary-text">Remaining / total</dt><dd className="mt-1 text-lg font-bold">{product.quantityRemaining} / {product.quantityTotal}</dd></div><div><dt className="text-xs text-light-secondary-text">Store</dt><dd className="mt-1 text-lg font-bold">{product.storeName}</dd></div></dl>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-[140px_1fr]"><dt className="text-light-secondary-text">Pickup window</dt><dd>{dateTime(product.pickupStartTime)} – {dateTime(product.pickupEndTime)}</dd><dt className="text-light-secondary-text">Expiry</dt><dd>{dateTime(product.expiryDate)}</dd><dt className="text-light-secondary-text">Created</dt><dd>{dateTime(product.createdAt)}</dd></dl>
            <p className="mt-4 text-xs text-light-secondary-text">{product.imageName ? `Future image selection: ${product.imageName}` : "Using the shared placeholder; the current bag response has no media field."}</p>
          </div>
        </DashboardCard>
      </div>
    </>
  );
}

export default function ProductDetails() {
  return <Suspense fallback={null}><ProductDetailsContent /></Suspense>;
}
