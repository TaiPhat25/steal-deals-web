"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { DashboardToast } from "@/components/dashboard/Dialog";
import { DashboardButton, DashboardCard, StatusBadge } from "@/components/dashboard/ui";
import type { PendingStoreResponse } from "@/lib/api/dashboard-types";
import { listPendingStores, verifyStore } from "@/lib/api/store";

const date = (value: string) => new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));

export default function PendingStores() {
  const { accessToken, isInitialized } = useAuth();
  const [stores, setStores] = useState<PendingStoreResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [toast, setToast] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    if (!isInitialized) return;
    let active = true;
    const timeout = window.setTimeout(() => {
      setLoading(true);
      setError("");

      if (!accessToken) {
        setError("An admin session is required to load pending stores.");
        setLoading(false);
        return;
      }

      void listPendingStores(accessToken)
        .then((items) => {
          if (active) setStores(items);
        })
        .catch((caught) => {
          if (active) setError(caught instanceof Error ? caught.message : "Unable to load pending stores.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [accessToken, isInitialized, reloadVersion]);

  async function approve(store: PendingStoreResponse) {
    if (!accessToken) return;
    setBusyId(store.id);
    setError("");
    try {
      await verifyStore(accessToken, store.id);
      setStores((items) => items.filter((item) => item.id !== store.id));
      setToast(`${store.name} was verified.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to verify this store.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <>
      {toast && <DashboardToast key={toast}>{toast}</DashboardToast>}
      <DashboardCard className="overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-gray-500/20 px-4 py-4 sm:px-6">
          <div><h2 className="text-lg font-bold">Sellers waiting for approval</h2><p className="mt-1 text-sm text-light-secondary-text">Stores awaiting verification.</p></div>
          <Link href="/admin/sellers?tab=applications" className="shrink-0 text-sm font-bold text-primary hover:text-primary-dark focus-visible:rounded focus-visible:ring-2 focus-visible:ring-primary">Review all →</Link>
        </div>
        {error && <div role="alert" className="flex items-center justify-between gap-3 bg-error-alpha-16 px-4 py-3 text-sm text-error-dark sm:px-6"><span>{error}</span><button type="button" onClick={() => setReloadVersion((version) => version + 1)} className="shrink-0 font-semibold">Retry</button></div>}
        {loading ? <div className="px-4 py-10 text-center text-sm text-light-secondary-text" role="status">Loading pending stores…</div> : stores.length ? (
          <ul className="divide-y divide-gray-500/20">
            {stores.map((store) => (
              <li key={store.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
                <div className="min-w-0 flex-1"><p className="truncate font-semibold">{store.name}</p><p className="truncate text-sm text-light-secondary-text">{store.address ?? store.phone ?? "No contact details"}</p></div>
                <div className="flex items-center justify-between gap-4"><span className="text-sm text-light-secondary-text">{date(store.createdAt)}</span><StatusBadge tone="warning">Pending</StatusBadge><DashboardButton disabled={Boolean(busyId)} onClick={() => approve(store)}>{busyId === store.id ? "Verifying…" : "Verify"}</DashboardButton></div>
              </li>
            ))}
          </ul>
        ) : <div className="px-4 py-10 text-center text-sm text-light-secondary-text">No stores are waiting for verification.</div>}
      </DashboardCard>
    </>
  );
}
