"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  type BagStatus,
  type SurplusBag,
} from "@/components/seller/SellerDemoProvider";
import { DashboardButton, DashboardCard, ProductImage } from "@/components/dashboard/ui";
import { listCategories } from "@/lib/api/store";
import type { CategoryResponse } from "@/lib/api/dashboard-types";
import { addMinutes, localDateTime, nextHalfHour } from "@/lib/seller-dashboard";

const inputClass = "mt-2 h-10 w-full rounded-xl border-none bg-gray-100 px-3.5 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary";
const shortcutClass = "rounded-full border border-primary/25 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40";

function ScheduleField({
  label,
  name,
  value,
  onChange,
  children,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return <div><label className="block text-sm font-semibold">{label} *<input name={name} type="datetime-local" required value={value} onChange={(event) => onChange(event.target.value)} suppressHydrationWarning className={inputClass} /></label><div className="mt-2 flex flex-wrap gap-2">{children}</div></div>;
}

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
  const [categoryId, setCategoryId] = useState(initial?.categories[0]?.id ?? "");
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [originalPrice, setOriginalPrice] = useState(initial ? String(initial.originalPrice) : "");
  const [salePrice, setSalePrice] = useState(initial ? String(initial.salePrice) : "");
  const [pickupStartTime, setPickupStartTime] = useState(() => initial ? localDateTime(initial.pickupStartTime) : nextHalfHour());
  const [pickupEndTime, setPickupEndTime] = useState(() => initial ? localDateTime(initial.pickupEndTime) : addMinutes(pickupStartTime, 60));
  const [expiryDate, setExpiryDate] = useState(initial ? localDateTime(initial.expiryDate) : "");
  const originalPriceValue = Number(originalPrice);
  const salePriceValue = Number(salePrice);
  const discountPercent = originalPriceValue > 0 && salePriceValue > 0 && salePriceValue < originalPriceValue
    ? Math.round((1 - salePriceValue / originalPriceValue) * 1_000) / 10
    : null;

  function applyDiscount(percent: number) {
    if (originalPriceValue > 0) setSalePrice(String(Math.round(originalPriceValue * (1 - percent / 100))));
  }

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

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center justify-between gap-4"><div><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">Surplus inventory</p><h1 className="text-xl font-bold">{title}</h1></div><Link href="/seller/products" className="text-sm font-semibold text-primary hover:underline">Back to bags</Link></div>
      <DashboardCard className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_240px]">
        <div className="space-y-6">
          <fieldset className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <legend className="mb-4 text-base font-bold">Bag details</legend>
            <label className="block text-sm font-semibold sm:col-span-2 xl:col-span-3">Bag name *<input name="name" required defaultValue={initial?.name} className={inputClass} /></label>
            <label className="block text-sm font-semibold">Category *<select name="categoryId" required disabled={categoriesLoading} value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className={inputClass}><option value="" disabled>{categoriesLoading ? "Loading categories…" : "Select category"}</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label className="block text-sm font-semibold">Status *<select name="status" defaultValue={initial?.status ?? "Draft"} className={inputClass}><option>Draft</option><option>Active</option><option>Sold out</option></select></label>
            <label className="block text-sm font-semibold">Total quantity *<input name="quantityTotal" type="number" required min="1" defaultValue={initial?.quantityTotal ?? 1} className={inputClass} /></label>
          </fieldset>

          <fieldset>
            <legend className="text-base font-bold">Pricing</legend>
            <p className="mt-1 text-xs text-light-secondary-text">The sale price must be lower than the original value. Current discount: <strong className="text-primary">{discountPercent === null ? "—" : `${discountPercent}%`}</strong></p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <label className="block text-sm font-semibold">Original price (VND) *<input name="originalPrice" type="number" required min="1" step="any" value={originalPrice} onChange={(event) => setOriginalPrice(event.target.value)} className={inputClass} /></label>
              <label className="block text-sm font-semibold">Sale price (VND) *<input name="salePrice" type="number" required min="1" step="any" value={salePrice} onChange={(event) => setSalePrice(event.target.value)} className={inputClass} /></label>
              <label className="block text-sm font-semibold">Discount (%) <span className="font-normal text-light-secondary-text">optional</span><input type="number" min="1" max="99" step="0.1" disabled={originalPriceValue <= 0} value={discountPercent ?? ""} onChange={(event) => applyDiscount(Number(event.target.value))} placeholder="e.g. 30" className={inputClass} /></label>
              <div className="flex flex-wrap items-center gap-2 sm:col-span-2 xl:col-span-3"><span className="mr-1 text-xs font-semibold text-light-secondary-text">Quick discount</span>{[20, 30, 50].map((percent) => <button key={percent} type="button" disabled={originalPriceValue <= 0} onClick={() => applyDiscount(percent)} className={shortcutClass}>{percent}% off</button>)}</div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-base font-bold">Pickup schedule</legend>
            <p className="mt-1 text-xs text-light-secondary-text">Use the shortcuts or adjust the exact date and time.</p>
            <div className="mt-4 grid gap-5 xl:grid-cols-3">
              <ScheduleField label="Pickup starts" name="pickupStartTime" value={pickupStartTime} onChange={setPickupStartTime}><button type="button" onClick={() => setPickupStartTime(nextHalfHour())} className={shortcutClass}>Next half hour</button><button type="button" disabled={!pickupStartTime} onClick={() => setPickupStartTime(addMinutes(pickupStartTime, 30))} className={shortcutClass}>+30 min</button><button type="button" disabled={!pickupStartTime} onClick={() => setPickupStartTime(addMinutes(pickupStartTime, 60))} className={shortcutClass}>+1 hour</button></ScheduleField>
              <ScheduleField label="Pickup ends" name="pickupEndTime" value={pickupEndTime} onChange={setPickupEndTime}><button type="button" disabled={!pickupStartTime} onClick={() => setPickupEndTime(addMinutes(pickupStartTime, 60))} className={shortcutClass}>Start +1 hour</button><button type="button" disabled={!pickupStartTime} onClick={() => setPickupEndTime(addMinutes(pickupStartTime, 120))} className={shortcutClass}>Start +2 hours</button></ScheduleField>
              <ScheduleField label="Expiry" name="expiryDate" value={expiryDate} onChange={setExpiryDate}><button type="button" disabled={!pickupEndTime} onClick={() => setExpiryDate(addMinutes(pickupEndTime, 120))} className={shortcutClass}>End +2 hours</button><button type="button" disabled={!pickupEndTime} onClick={() => setExpiryDate(addMinutes(pickupEndTime, 1_440))} className={shortcutClass}>End +1 day</button></ScheduleField>
            </div>
          </fieldset>

          <label className="block text-sm font-semibold">Description<textarea name="description" rows={4} defaultValue={initial?.description ?? ""} className="mt-2 w-full rounded-xl border-none bg-gray-100 p-3.5 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" /></label>
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
