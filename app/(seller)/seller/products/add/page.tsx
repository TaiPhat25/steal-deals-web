"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import ProductForm from "@/components/seller/ProductForm";
import { DEMO_CATEGORIES, useSellerDemo } from "@/components/seller/SellerDemoProvider";
import { createBag } from "@/lib/api/store";

export default function AddProduct() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const { setProducts, productsDemoReason } = useSellerDemo();
  return <ProductForm title="Create Surprise Bag" onSave={async (input) => {
    const { imageName, image, ...request } = input;
    if (productsDemoReason) {
      const demoBag = {
        id: crypto.randomUUID(),
        storeId: "20000000-0000-0000-0000-000000000001",
        storeName: "Steal Deals Shop",
        name: request.name,
        description: request.description || null,
        imageUrl: image ? URL.createObjectURL(image) : null,
        originalPrice: request.originalPrice,
        salePrice: request.salePrice,
        quantityTotal: request.quantityTotal,
        quantityRemaining: request.quantityTotal,
        pickupStartTime: request.pickupStartTime,
        pickupEndTime: request.pickupEndTime,
        expiryDate: request.expiryDate,
        status: request.status,
        categories: DEMO_CATEGORIES.filter((category) => request.categoryIds.includes(category.id)),
        createdAt: new Date().toISOString(),
        ...(imageName ? { imageName } : {}),
      };
      setProducts((items) => [demoBag, ...items]);
      router.push("/seller/products");
      return;
    }
    if (!accessToken) throw new Error("Sign in as a seller before creating a bag.");
    const created = await createBag(accessToken, {
      ...request,
      image: image ?? null,
    });
    setProducts((items) => [{ ...created, ...(imageName ? { imageName } : {}) }, ...items]);
    router.push("/seller/products");
  }} />;
}
