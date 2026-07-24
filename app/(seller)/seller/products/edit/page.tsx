"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ProductForm from "@/components/seller/ProductForm";
import { DashboardCard } from "@/components/dashboard/ui";
import { useSellerDemo } from "@/components/seller/SellerDemoProvider";

function EditProductContent() {
  const router = useRouter();
  const id = useSearchParams().get("id");
  const { products, setProducts } = useSellerDemo();
  const product = products.find((item) => item.id === id);
  if (!product) return <DashboardCard className="p-8 text-center"><h1 className="text-xl font-bold">Surplus bag not found</h1><p className="mt-2 text-sm text-light-secondary-text">The selected dummy record does not exist or was deleted.</p><Link href="/seller/products" className="mt-5 inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-bold text-white">Back to bags</Link></DashboardCard>;
  return <ProductForm title={`Edit ${product.name}`} initial={product} onSave={(input) => {
    setProducts((items) => items.map((item) => item.id === product.id ? { ...input, id: product.id } : item));
    router.push(`/seller/products/details?id=${product.id}`);
  }} />;
}

export default function EditProduct() {
  return <Suspense fallback={null}><EditProductContent /></Suspense>;
}
