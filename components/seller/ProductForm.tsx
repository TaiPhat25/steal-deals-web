"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import type { BagStatus, SurplusBag } from "@/components/seller/SellerDemoProvider";
import { DashboardButton, DashboardCard, ProductImage } from "@/components/dashboard/ui";

export type ProductInput = Omit<SurplusBag, "id">;

export default function ProductForm({
  initial,
  onSave,
  title,
}: {
  initial?: SurplusBag;
  onSave: (input: ProductInput) => void;
  title: string;
}) {
  const [imageName, setImageName] = useState(initial?.imageName ?? "");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const originalPrice = Number(data.get("originalPrice"));
    const price = Number(data.get("price"));
    const pickupStart = String(data.get("pickupStart"));
    const pickupEnd = String(data.get("pickupEnd"));
    if (price >= originalPrice) {
      setError("Selling price must be lower than the original value.");
      return;
    }
    if (pickupEnd <= pickupStart) {
      setError("Pickup end time must be after the start time.");
      return;
    }
    onSave({
      name: String(data.get("name")).trim(),
      category: String(data.get("category")),
      description: String(data.get("description")).trim(),
      quantity: Math.max(0, Number(data.get("quantity"))),
      originalPrice,
      price,
      pickupStart,
      pickupEnd,
      status: String(data.get("status")) as BagStatus,
      ...(imageName ? { imageName } : {}),
    });
  }

  const inputClass = "mt-2 h-10 w-full rounded-xl border-none bg-gray-100 px-3.5 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary";

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center justify-between gap-4"><div><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">Surplus inventory</p><h1 className="text-xl font-bold">{title}</h1></div><Link href="/seller/products" className="text-sm font-semibold text-primary hover:underline">Back to bags</Link></div>
      <DashboardCard className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_240px]">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold sm:col-span-2">Bag name *<input name="name" required defaultValue={initial?.name} className={inputClass} /></label>
          <label className="block text-sm font-semibold">Category *<select name="category" required defaultValue={initial?.category ?? ""} className={inputClass}><option value="" disabled>Select category</option><option>Bakery</option><option>Prepared meals</option><option>Produce</option><option>Desserts</option><option>Groceries</option><option>Drinks</option></select></label>
          <label className="block text-sm font-semibold">Status *<select name="status" defaultValue={initial?.status ?? "Draft"} className={inputClass}><option>Draft</option><option>Active</option><option>Sold out</option></select></label>
          <label className="block text-sm font-semibold">Available quantity *<input name="quantity" type="number" required min="0" defaultValue={initial?.quantity ?? 1} className={inputClass} /></label>
          <label className="block text-sm font-semibold">Original value *<input name="originalPrice" type="number" required min="0.01" step="0.01" defaultValue={initial?.originalPrice} className={inputClass} /></label>
          <label className="block text-sm font-semibold">Selling price *<input name="price" type="number" required min="0.01" step="0.01" defaultValue={initial?.price} className={inputClass} /></label>
          <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-semibold">Pickup starts *<input name="pickupStart" type="time" required defaultValue={initial?.pickupStart} className={inputClass} /></label><label className="block text-sm font-semibold">Pickup ends *<input name="pickupEnd" type="time" required defaultValue={initial?.pickupEnd} className={inputClass} /></label></div>
          <label className="block text-sm font-semibold sm:col-span-2">Description *<textarea name="description" required rows={4} defaultValue={initial?.description} className="mt-2 w-full rounded-xl border-none bg-gray-100 p-3.5 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" /></label>
        </div>
        <div>
          <span className="block text-sm font-semibold">Bag image</span>
          <label className="mt-2 flex min-h-56 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-gray-500/30 bg-gray-50 p-4 text-center hover:bg-gray-100">
            <span className="size-28 overflow-hidden rounded-xl"><ProductImage alt="" /></span>
            <strong className="mt-3 text-sm">{imageName || "Choose an image"}</strong>
            <span className="mt-1 text-xs text-light-secondary-text">Local preview placeholder only</span>
            <input type="file" accept="image/*" className="sr-only" onChange={(event) => setImageName(event.target.files?.[0]?.name ?? "")} />
          </label>
        </div>
      </DashboardCard>
      {error && <div role="alert" className="rounded-xl bg-error-alpha-16 px-4 py-3 text-sm text-error-dark">{error}</div>}
      <div className="flex justify-end gap-3"><Link href="/seller/products" className="inline-flex h-9 items-center rounded-full border border-gray-300 px-4 text-sm font-bold text-gray-700 hover:bg-gray-50">Cancel</Link><DashboardButton type="submit">{initial ? "Save changes" : "Create bag"}</DashboardButton></div>
    </form>
  );
}
