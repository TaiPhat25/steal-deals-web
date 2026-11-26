"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SellerOrderDetails from "@/components/seller/SellerOrderDetails";

function OrderDetailsContent() {
  const id = useSearchParams().get("id");
  return <SellerOrderDetails orderId={id} />;
}

export default function OrderDetails() {
  return <Suspense fallback={null}><OrderDetailsContent /></Suspense>;
}
