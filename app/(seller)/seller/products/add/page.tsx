"use client";

import { useRouter } from "next/navigation";
import ProductForm from "@/components/seller/ProductForm";
import {
  DEMO_CATEGORIES,
  useSellerDemo,
} from "@/components/seller/SellerDemoProvider";

export default function AddProduct() {
  const router = useRouter();
  const { setProducts, settings } = useSellerDemo();
  return <ProductForm title="Create Surplus Bag" onSave={(input) => {
    const { categoryIds, ...fields } = input;
    setProducts((items) => [{
      ...fields,
      id: crypto.randomUUID(),
      storeId: settings.id,
      storeName: settings.name,
      quantityRemaining: input.status === "Sold out" ? 0 : input.quantityTotal,
      categories: DEMO_CATEGORIES.filter((category) => categoryIds.includes(category.id)),
      createdAt: new Date().toISOString(),
    }, ...items]);
    router.push("/seller/products");
  }} />;
}
