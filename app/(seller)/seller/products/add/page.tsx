"use client";

import { useRouter } from "next/navigation";
import ProductForm from "@/components/seller/ProductForm";
import { useSellerDemo } from "@/components/seller/SellerDemoProvider";

export default function AddProduct() {
  const router = useRouter();
  const { setProducts } = useSellerDemo();
  return <ProductForm title="Create Surplus Bag" onSave={(input) => {
    setProducts((items) => [{ ...input, id: `bag-${Date.now()}` }, ...items]);
    router.push("/seller/products");
  }} />;
}
