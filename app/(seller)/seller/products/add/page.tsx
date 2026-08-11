"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import ProductForm from "@/components/seller/ProductForm";
import { useSellerDemo } from "@/components/seller/SellerDemoProvider";
import { createBag } from "@/lib/api/store";

export default function AddProduct() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const { setProducts } = useSellerDemo();
  return <ProductForm title="Create Surplus Bag" onSave={async (input) => {
    if (!accessToken) throw new Error("Sign in as a seller before creating a bag.");
    const { imageName, ...request } = input;
    const created = await createBag(accessToken, request);
    setProducts((items) => [{ ...created, ...(imageName ? { imageName } : {}) }, ...items]);
    router.push("/seller/products");
  }} />;
}
