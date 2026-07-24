"use client";

import { useState, type FormEvent } from "react";
import { DashboardButton, DashboardCard, ProductImage } from "@/components/dashboard/ui";
import { DashboardToast } from "@/components/dashboard/Dialog";
import { useSellerDemo } from "@/components/seller/SellerDemoProvider";

export default function SellerSettings() {
  const { settings, setSettings } = useSellerDemo();
  const [draft, setDraft] = useState(() => structuredClone(settings));
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const inputClass = "mt-2 h-10 w-full rounded-xl border-none bg-gray-100 px-3.5 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary";

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invalidDay = draft.hours.find((hour) => hour.active && hour.close <= hour.open);
    if (invalidDay) {
      setError(`${invalidDay.day}'s closing time must be after its opening time.`);
      return;
    }
    setSettings(structuredClone(draft));
    setError("");
    setToast("Store settings saved.");
  }

  function cancel() {
    setDraft(structuredClone(settings));
    setError("");
    setToast("Unsaved changes were discarded.");
  }

  return (
    <>
      {toast && <DashboardToast key={toast}>{toast}</DashboardToast>}
      <form onSubmit={save} className="space-y-6">
        <div><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">Store profile</p><h1 className="text-xl font-bold">Settings</h1></div>
        <DashboardCard className="space-y-6 p-4 sm:p-6">
          <div><h2 className="text-lg font-bold">Shop information</h2><p className="mt-1 text-sm text-light-secondary-text">The public details customers use to identify your collection point.</p></div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-gray-500/30 bg-gray-50 p-4 text-center hover:bg-gray-100"><span className="size-20 overflow-hidden rounded-xl"><ProductImage alt="" /></span><strong className="mt-3 text-sm">{draft.coverName || "Choose cover image"}</strong><span className="mt-1 text-xs text-light-secondary-text">Local filename only</span><input type="file" accept="image/*" className="sr-only" onChange={(event) => setDraft({ ...draft, coverName: event.target.files?.[0]?.name })} /></label>
            <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-gray-500/30 bg-gray-50 p-4 text-center hover:bg-gray-100"><span className="size-20 overflow-hidden rounded-full"><ProductImage alt="" /></span><strong className="mt-3 text-sm">{draft.logoName || "Choose store logo"}</strong><span className="mt-1 text-xs text-light-secondary-text">Local filename only</span><input type="file" accept="image/*" className="sr-only" onChange={(event) => setDraft({ ...draft, logoName: event.target.files?.[0]?.name })} /></label>
          </div>
          <div className="grid gap-5 md:grid-cols-2"><label className="text-sm font-semibold">Shop name *<input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className={inputClass} /></label><label className="text-sm font-semibold">Shop slug *<input required pattern="[a-z0-9-]+" title="Use lowercase letters, numbers, and hyphens." value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} className={inputClass} /></label><label className="text-sm font-semibold">Phone number *<input required type="tel" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} className={inputClass} /></label><label className="text-sm font-semibold">Email address *<input required type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} className={inputClass} /></label><label className="text-sm font-semibold md:col-span-2">Description *<textarea required rows={4} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className="mt-2 w-full rounded-xl border-none bg-gray-100 p-3.5 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" /></label></div>
        </DashboardCard>
        <DashboardCard className="space-y-5 p-4 sm:p-6"><div><h2 className="text-lg font-bold">Pickup hours</h2><p className="mt-1 text-sm text-light-secondary-text">Set the normal collection availability for each day.</p></div><div className="grid gap-3 lg:grid-cols-2">{draft.hours.map((hour, index) => <div key={hour.day} className={`rounded-xl p-4 ${hour.active ? "bg-primary-alpha-16" : "bg-gray-100"}`}><div className="flex items-center justify-between"><strong>{hour.day}</strong><label className="flex items-center gap-2 text-sm"><span>{hour.active ? "Open" : "Closed"}</span><input type="checkbox" checked={hour.active} onChange={(event) => setDraft({ ...draft, hours: draft.hours.map((item, itemIndex) => itemIndex === index ? { ...item, active: event.target.checked } : item) })} className="size-4 accent-primary" /></label></div>{hour.active && <div className="mt-3 grid grid-cols-2 gap-3"><label className="text-xs font-semibold">Opens<input type="time" value={hour.open} onChange={(event) => setDraft({ ...draft, hours: draft.hours.map((item, itemIndex) => itemIndex === index ? { ...item, open: event.target.value } : item) })} className={inputClass} /></label><label className="text-xs font-semibold">Closes<input type="time" value={hour.close} onChange={(event) => setDraft({ ...draft, hours: draft.hours.map((item, itemIndex) => itemIndex === index ? { ...item, close: event.target.value } : item) })} className={inputClass} /></label></div>}</div>)}</div></DashboardCard>
        {error && <div role="alert" className="rounded-xl bg-error-alpha-16 px-4 py-3 text-sm text-error-dark">{error}</div>}
        <div className="flex justify-end gap-3"><DashboardButton variant="secondary" onClick={cancel}>Cancel</DashboardButton><DashboardButton type="submit">Save settings</DashboardButton></div>
      </form>
    </>
  );
}
