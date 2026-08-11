"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  type BagStatus,
  type SurplusBag,
} from "@/components/seller/SellerDemoProvider";
import { DashboardButton, DashboardCard, ProductImage } from "@/components/dashboard/ui";
import { listCategories } from "@/lib/api/store";
import type { CategoryResponse } from "@/lib/api/dashboard-types";

export type ProductInput = {
  name: string;
  description: string;
  originalPrice: number;
  salePrice: number;
  quantityTotal: number;
  pickupStartTime: string;
  pickupEndTime: string;
  expiryDate: string;
  status: BagStatus;
  categoryIds: string[];
  imageName?: string;
};

const localDateTime = (value?: string) => value?.slice(0, 16) ?? "";

export default function ProductForm({
  initial,
  onSave,
  title,
}: {
  initial?: SurplusBag;
  onSave: (input: ProductInput) => void | Promise<void>;
  title: string;
}) {
  const [imageName, setImageName] = useState(initial?.imageName ?? "");
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void listCategories()
      .then((items) => {
        if (!active) return;
        const selected = initial?.categories[0];
        const available = items.filter((item) => item.isActive || item.id === selected?.id);
        setCategories(selected && !available.some((item) => item.id === selected.id) ? [selected, ...available] : available);
        if (available.length === 0 && !selected) setError("No active categories are available.");
      })
      .catch((caught) => {
        if (active) setError(caught instanceof Error ? caught.message : "Unable to load categories.");
      })
      .finally(() => {
        if (active) setCategoriesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [initial]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const originalPrice = Number(data.get("originalPrice"));
    const salePrice = Number(data.get("salePrice"));
    const pickupStartTime = new Date(String(data.get("pickupStartTime"))).toISOString();
    const pickupEndTime = new Date(String(data.get("pickupEndTime"))).toISOString();
    const expiryDate = new Date(String(data.get("expiryDate"))).toISOString();
    if (salePrice >= originalPrice) {
      setError("Sale price must be lower than the original price.");
      return;
    }
    if (pickupEndTime <= pickupStartTime) {
      setError("Pickup end time must be after the start time.");
      return;
    }
    if (expiryDate < pickupEndTime) {
      setError("Expiry must not be before the pickup window ends.");
      return;
    }
    setSubmitting(true);
    try {
      await onSave({
        name: String(data.get("name")).trim(),
        description: String(data.get("description")).trim(),
        originalPrice,
        salePrice,
        quantityTotal: Number(data.get("quantityTotal")),
        pickupStartTime,
        pickupEndTime,
        expiryDate,
        status: String(data.get("status")) as BagStatus,
        categoryIds: [String(data.get("categoryId"))],
        ...(imageName ? { imageName } : {}),
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save this bag.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "mt-2 h-10 w-full rounded-xl border-none bg-gray-100 px-3.5 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary";

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center justify-between gap-4"><div><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">Surplus inventory</p><h1 className="text-xl font-bold">{title}</h1></div><Link href="/seller/products" className="text-sm font-semibold text-primary hover:underline">Back to bags</Link></div>
      <DashboardCard className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_240px]">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold sm:col-span-2">Bag name *<input name="name" required defaultValue={initial?.name} className={inputClass} /></label>
          <label className="block text-sm font-semibold">Category *<select name="categoryId" required disabled={categoriesLoading} defaultValue={initial?.categories[0]?.id ?? ""} className={inputClass}><option value="" disabled>{categoriesLoading ? "Loading categories…" : "Select category"}</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label className="block text-sm font-semibold">Status *<select name="status" defaultValue={initial?.status ?? "Draft"} className={inputClass}><option>Draft</option><option>Active</option><option>Sold out</option></select></label>
          <label className="block text-sm font-semibold">Total quantity *<input name="quantityTotal" type="number" required min="1" defaultValue={initial?.quantityTotal ?? 1} className={inputClass} /></label>
          <label className="block text-sm font-semibold">Original price (VND) *<input name="originalPrice" type="number" required min="1" step="any" defaultValue={initial?.originalPrice} className={inputClass} /></label>
          <label className="block text-sm font-semibold">Sale price (VND) *<input name="salePrice" type="number" required min="1" step="any" defaultValue={initial?.salePrice} className={inputClass} /></label>
          <label className="block text-sm font-semibold">Pickup starts *<input name="pickupStartTime" type="datetime-local" required defaultValue={localDateTime(initial?.pickupStartTime)} className={inputClass} /></label>
          <label className="block text-sm font-semibold">Pickup ends *<input name="pickupEndTime" type="datetime-local" required defaultValue={localDateTime(initial?.pickupEndTime)} className={inputClass} /></label>
          <label className="block text-sm font-semibold">Expiry *<input name="expiryDate" type="datetime-local" required defaultValue={localDateTime(initial?.expiryDate)} className={inputClass} /></label>
          <label className="block text-sm font-semibold sm:col-span-2">Description<textarea name="description" rows={4} defaultValue={initial?.description ?? ""} className="mt-2 w-full rounded-xl border-none bg-gray-100 p-3.5 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" /></label>
        </div>
        <div>
          <span className="block text-sm font-semibold">Bag image (future field)</span>
          <label className="mt-2 flex min-h-56 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-gray-500/30 bg-gray-50 p-4 text-center hover:bg-gray-100">
            <span className="size-28 overflow-hidden rounded-xl"><ProductImage alt="" /></span>
            <strong className="mt-3 text-sm">{imageName || "Choose an image"}</strong>
            <span className="mt-1 text-xs text-light-secondary-text">Kept in local demo state; the current bag contract has no media field.</span>
            <input type="file" accept="image/*" className="sr-only" onChange={(event) => setImageName(event.target.files?.[0]?.name ?? "")} />
          </label>
        </div>
      </DashboardCard>
      {error && <div role="alert" className="rounded-xl bg-error-alpha-16 px-4 py-3 text-sm text-error-dark">{error}</div>}
      <div className="flex justify-end gap-3"><Link href="/seller/products" className="inline-flex h-9 items-center rounded-full border border-gray-300 px-4 text-sm font-bold text-gray-700 hover:bg-gray-50">Cancel</Link><DashboardButton type="submit" disabled={submitting || categoriesLoading || categories.length === 0}>{submitting ? "Saving…" : initial ? "Save changes" : "Create bag"}</DashboardButton></div>
    </form>
  );
}
