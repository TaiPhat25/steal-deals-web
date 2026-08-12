"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { DashboardButton, DashboardCard, ProductImage, StatusBadge } from "@/components/dashboard/ui";
import { DashboardToast } from "@/components/dashboard/Dialog";
import { useSellerDemo } from "@/components/seller/SellerDemoProvider";
import { updateStore } from "@/lib/api/store";

export default function SellerSettings() {
  const { accessToken } = useAuth();
  const {
    settings,
    setSettings,
    settingsLoading: loading,
    settingsDemoReason: loadError,
    retryApi,
  } = useSellerDemo();
  const [draft, setDraft] = useState(() => structuredClone(settings));
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const inputClass = "mt-2 h-10 w-full rounded-xl border-none bg-gray-100 px-3.5 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary";

  useEffect(() => {
    const timeout = window.setTimeout(() => setDraft(structuredClone(settings)), 0);
    return () => window.clearTimeout(timeout);
  }, [settings]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invalidDay = draft.operatingHours.find((hour) => hour.active && hour.close <= hour.open);
    if (invalidDay) {
      setError(`${invalidDay.day}'s closing time must be after its opening time.`);
      return;
    }
    if (!accessToken) {
      setError("A seller session is required to save store settings.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      const store = await updateStore(accessToken, draft.id, {
        name: draft.name,
        description: draft.description,
        address: draft.address,
        latitude: draft.latitude,
        longitude: draft.longitude,
        phone: draft.phone,
        bankAccount: draft.bankAccount || null,
        licenseUrl: draft.licenseUrl || null,
      });
      const saved = { ...draft, ...store };
      setSettings(structuredClone(saved));
      setDraft(structuredClone(saved));
      setToast("Store settings saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save store settings.");
    } finally {
      setIsSaving(false);
    }
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
        {loading && <div role="status" className="rounded-xl bg-white px-4 py-3 text-sm text-light-secondary-text">Loading store information…</div>}
        {loadError && <div role="status" className="flex flex-col gap-3 rounded-xl bg-warning/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"><p><strong>Demo data active.</strong> {loadError}</p><button type="button" onClick={retryApi} className="h-8 shrink-0 rounded-full px-3 font-semibold text-warning-dark hover:bg-warning/15">Retry API</button></div>}
        <DashboardCard className="space-y-6 p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold">Store information</h2><p className="mt-1 text-sm text-light-secondary-text">Public and seller-editable store details.</p></div><div className="flex gap-2"><StatusBadge tone={draft.isVerify ? "success" : "warning"}>{draft.isVerify ? "Verified" : "Unverified"}</StatusBadge><StatusBadge tone={draft.isActive ? "success" : "error"}>{draft.isActive ? "Active" : "Inactive"}</StatusBadge></div></div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-gray-500/30 bg-gray-50 p-4 text-center hover:bg-gray-100"><span className="size-20 overflow-hidden rounded-xl"><ProductImage alt="" /></span><strong className="mt-3 text-sm">{draft.coverImageName || "Choose cover image"}</strong><span className="mt-1 text-xs text-light-secondary-text">Future UI field; not in the current store contract.</span><input type="file" accept="image/*" className="sr-only" onChange={(event) => setDraft({ ...draft, coverImageName: event.target.files?.[0]?.name })} /></label>
            <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-gray-500/30 bg-gray-50 p-4 text-center hover:bg-gray-100"><span className="size-20 overflow-hidden rounded-full"><ProductImage alt="" /></span><strong className="mt-3 text-sm">{draft.avatarImageName || draft.avatarUrl || "Choose store avatar"}</strong><span className="mt-1 text-xs text-light-secondary-text">The response has avatarUrl, but requests cannot set it yet.</span><input type="file" accept="image/*" className="sr-only" onChange={(event) => setDraft({ ...draft, avatarImageName: event.target.files?.[0]?.name })} /></label>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-sm font-semibold">Store name *<input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className={inputClass} /></label>
            <label className="text-sm font-semibold">Phone number<input type="tel" value={draft.phone ?? ""} onChange={(event) => setDraft({ ...draft, phone: event.target.value || null })} className={inputClass} /></label>
            <label className="text-sm font-semibold md:col-span-2">Description<textarea rows={4} value={draft.description ?? ""} onChange={(event) => setDraft({ ...draft, description: event.target.value || null })} className="mt-2 w-full rounded-xl border-none bg-gray-100 p-3.5 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" /></label>
            <label className="text-sm font-semibold md:col-span-2">Address<input value={draft.address ?? ""} onChange={(event) => setDraft({ ...draft, address: event.target.value || null })} className={inputClass} /></label>
            <label className="text-sm font-semibold">Bank account<input value={draft.bankAccount} onChange={(event) => setDraft({ ...draft, bankAccount: event.target.value })} className={inputClass} /></label>
            <label className="text-sm font-semibold">License URL<input type="url" value={draft.licenseUrl} onChange={(event) => setDraft({ ...draft, licenseUrl: event.target.value })} className={inputClass} /></label>
          </div>
        </DashboardCard>
        <DashboardCard className="space-y-5 p-4 sm:p-6"><div><h2 className="text-lg font-bold">Operating hours (future field)</h2><p className="mt-1 text-sm text-light-secondary-text">Useful for pickup planning, but not part of the current store contract.</p></div><div className="grid gap-3 lg:grid-cols-2">{draft.operatingHours.map((hour, index) => <div key={hour.day} className={`rounded-xl p-4 ${hour.active ? "bg-primary-alpha-16" : "bg-gray-100"}`}><div className="flex items-center justify-between"><strong>{hour.day}</strong><label className="flex items-center gap-2 text-sm"><span>{hour.active ? "Open" : "Closed"}</span><input type="checkbox" checked={hour.active} onChange={(event) => setDraft({ ...draft, operatingHours: draft.operatingHours.map((item, itemIndex) => itemIndex === index ? { ...item, active: event.target.checked } : item) })} className="size-4 accent-primary" /></label></div>{hour.active && <div className="mt-3 grid grid-cols-2 gap-3"><label className="text-xs font-semibold">Opens<input type="time" value={hour.open} onChange={(event) => setDraft({ ...draft, operatingHours: draft.operatingHours.map((item, itemIndex) => itemIndex === index ? { ...item, open: event.target.value } : item) })} className={inputClass} /></label><label className="text-xs font-semibold">Closes<input type="time" value={hour.close} onChange={(event) => setDraft({ ...draft, operatingHours: draft.operatingHours.map((item, itemIndex) => itemIndex === index ? { ...item, close: event.target.value } : item) })} className={inputClass} /></label></div>}</div>)}</div></DashboardCard>
        {error && <div role="alert" className="rounded-xl bg-error-alpha-16 px-4 py-3 text-sm text-error-dark">{error}</div>}
        <div className="flex justify-end gap-3"><DashboardButton disabled={isSaving} variant="secondary" onClick={cancel}>Cancel</DashboardButton><DashboardButton disabled={loading || isSaving || Boolean(loadError)} type="submit">{isSaving ? "Saving…" : "Save settings"}</DashboardButton></div>
      </form>
    </>
  );
}
