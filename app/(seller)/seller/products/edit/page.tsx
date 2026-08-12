"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import ProductForm from "@/components/seller/ProductForm";
import { DashboardCard } from "@/components/dashboard/ui";
import {
  DEMO_CATEGORIES,
  useSellerDemo,
} from "@/components/seller/SellerDemoProvider";
import { updateBag, updateBagStatus } from "@/lib/api/store";

function EditProductContent() {
  const router = useRouter();
  const id = useSearchParams().get("id");
  const { accessToken } = useAuth();
  const { products, setProducts, productsLoading, productsDemoReason, retryApi } = useSellerDemo();
  const product = products.find((item) => item.id === id);
  if (productsLoading) return <DashboardCard className="p-8 text-center text-sm text-light-secondary-text" role="status">Loading surplus bag…</DashboardCard>;
  if (!product) return <DashboardCard className="p-8 text-center"><h1 className="text-xl font-bold">Surplus bag not found</h1><p className="mt-2 text-sm text-light-secondary-text">The selected bag does not exist or was deleted.</p><Link href="/seller/products" className="mt-5 inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-bold text-white">Back to bags</Link></DashboardCard>;
  return <div className="space-y-4">{productsDemoReason && <div role="status" className="flex flex-col gap-3 rounded-xl bg-warning/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"><p><strong>Demo data active.</strong> {productsDemoReason}</p><button type="button" onClick={retryApi} className="h-8 shrink-0 rounded-full px-3 font-semibold text-warning-dark hover:bg-warning/15">Retry API</button></div>}<ProductForm title={`Edit ${product.name}`} initial={product} onSave={async (input) => {
    const { categoryIds, ...fields } = input;
    if (productsDemoReason) {
      setProducts((items) => items.map((item) => item.id === product.id ? {
        ...item,
        ...fields,
        quantityRemaining: input.status === "Sold out" ? 0 : Math.min(item.quantityRemaining, input.quantityTotal),
        categories: DEMO_CATEGORIES.filter((category) => categoryIds.includes(category.id)),
      } : item));
    } else {
      if (!accessToken) throw new Error("A seller session is required to update this bag.");
      const { imageName, status, ...request } = fields;
      const updated = await updateBag(accessToken, product.id, { ...request, categoryIds });
      if (updated.status !== status) await updateBagStatus(accessToken, product.id, status);
      setProducts((items) => items.map((item) => item.id === product.id ? { ...updated, status, ...(imageName ? { imageName } : {}) } : item));
    }
    router.push(`/seller/products/details?id=${product.id}`);
  }} /></div>;
}

export default function EditProduct() {
  return <Suspense fallback={null}><EditProductContent /></Suspense>;
}
