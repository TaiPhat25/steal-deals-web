"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { DashboardButton, DashboardCard, ProductImage, StatusBadge } from "@/components/dashboard/ui";
import { DashboardDialog, DashboardToast, DialogActions } from "@/components/dashboard/Dialog";
import { useSellerDemo } from "@/components/seller/SellerDemoProvider";
import { ApiClientError } from "@/lib/api/client";
import type { OrderResponse } from "@/lib/api/dashboard-types";
import { getOrder, markOrderNoShow } from "@/lib/api/order";

const money = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
const dateTime = (value: string | null) => value ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Not set";
const tone = (status: string) => status === "Confirmed" ? "success" : status === "Pending" ? "warning" : "error";
const provided = (value?: string | null) => value?.trim() || "Not provided";

export default function SellerOrderDetails({ orderId }: { orderId: string | null }) {
  const { accessToken } = useAuth();
  const { orders, setOrders, ordersLoading, ordersDemoReason, retryApi } = useSellerDemo();
  const [loadedOrder, setLoadedOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);
  const [confirmNoShow, setConfirmNoShow] = useState(false);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const requestScope = useRef<{ accessToken: string | null; orderId: string | null } | null>(null);
  const demoOrder = orders.find((item) => item.id === orderId);
  const order = ordersDemoReason ? demoOrder : loadedOrder?.id === orderId ? loadedOrder : null;

  const mergeOrder = useCallback((updated: OrderResponse) => {
    setOrders((items) => items.some((item) => item.id === updated.id)
      ? items.map((item) => item.id === updated.id ? updated : item)
      : [updated, ...items]);
  }, [setOrders]);

  const commitOrder = useCallback((updated: OrderResponse) => {
    setLoadedOrder(updated);
    mergeOrder(updated);
  }, [mergeOrder]);

  useEffect(() => {
    const scope = { accessToken, orderId };
    requestScope.current = scope;
    submitting.current = false;
    const timeout = window.setTimeout(() => {
      setLoadedOrder(null);
      setLoading(true);
      setLoadError("");
      setConfirmNoShow(false);
      setToast("");
      setBusy(false);
      setError("");
    }, 0);
    return () => {
      requestScope.current = null;
      submitting.current = false;
      window.clearTimeout(timeout);
    };
  }, [accessToken, orderId]);

  useEffect(() => {
    if (ordersLoading) return;
    let active = true;
    const timeout = window.setTimeout(() => {
      setLoadError("");
      if (ordersDemoReason) {
        setLoading(false);
        return;
      }
      if (!orderId || !accessToken) {
        setLoadError(orderId ? "A seller session is required to view this order." : "No order was selected.");
        setLoading(false);
        return;
      }
      setLoading(true);
      void getOrder(accessToken, orderId)
        .then((updated) => {
          if (active) commitOrder(updated);
        })
        .catch((caught) => {
          if (active) setLoadError(caught instanceof Error ? caught.message : "Unable to load this order. Please try again.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [accessToken, orderId, ordersLoading, ordersDemoReason, reloadVersion, commitOrder]);

  function refreshOrder() {
    if (submitting.current) return;
    setConfirmNoShow(false);
    setError("");
    if (ordersDemoReason) retryApi();
    else {
      setLoading(true);
      setReloadVersion((version) => version + 1);
    }
  }

  async function confirmCollectionMissed() {
    if (submitting.current || !order || !accessToken || ordersDemoReason || order.canMarkNoShow !== true) return;
    const scope = requestScope.current;
    if (!scope) return;
    const isCurrent = () => requestScope.current === scope;
    const isSameSession = () => requestScope.current?.accessToken === scope.accessToken;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const updated = await markOrderNoShow(accessToken, order.id);
      if (!isSameSession()) return;
      if (!isCurrent()) {
        mergeOrder(updated);
        return;
      }
      commitOrder(updated);
      setConfirmNoShow(false);
      setToast("Order marked as NoShow.");
    } catch (caught) {
      if (!isCurrent()) return;
      setError(caught instanceof Error ? caught.message : "Unable to mark this order as NoShow. Please try again.");
      if (caught instanceof ApiClientError && caught.status === 409) {
        setConfirmNoShow(false);
        try {
          const updated = await getOrder(accessToken, order.id);
          if (isCurrent()) commitOrder(updated);
          else if (isSameSession()) mergeOrder(updated);
        } catch {
          if (isCurrent()) setLoadError("The order could not be refreshed. Refresh it before trying again.");
        }
      }
    } finally {
      if (isCurrent()) {
        submitting.current = false;
        setBusy(false);
      }
    }
  }

  if (ordersLoading || loading) {
    return <DashboardCard className="p-8 text-center text-sm text-light-secondary-text" role="status">Loading order…</DashboardCard>;
  }

  if (!order || loadError) {
    return (
      <DashboardCard className="p-8 text-center">
        <h1 className="text-xl font-bold">{loadError ? "Unable to load order" : "Order not found"}</h1>
        <p className="mt-2 text-sm text-light-secondary-text" role={loadError ? "alert" : undefined}>{loadError || "The selected order does not exist."}</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link href="/seller/orders" className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-bold text-white">Back to orders</Link>
          <DashboardButton variant="secondary" onClick={refreshOrder}>Retry</DashboardButton>
        </div>
      </DashboardCard>
    );
  }

  const canMarkNoShow = !ordersDemoReason && order.canMarkNoShow === true;
  const statusLabel = order.status === "NoShow" ? "No show" : order.status;

  return (
    <>
      {toast && <DashboardToast key={toast}>{toast}</DashboardToast>}
      <div className="space-y-6">
        {ordersDemoReason && <div role="status" className="rounded-xl bg-warning/10 px-4 py-3 text-sm"><strong>Demo data active.</strong> {ordersDemoReason} NoShow actions are unavailable for demo orders.</div>}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div><Link href="/seller/orders" className="text-sm font-semibold text-primary hover:underline">← Back to orders</Link><h1 className="mt-2 text-xl font-bold">Order #{order.id.slice(0, 8)}</h1></div>
          <div className="flex flex-wrap gap-3">
            <DashboardButton disabled={busy} variant="secondary" onClick={refreshOrder}>Refresh order</DashboardButton>
            {canMarkNoShow && <DashboardButton disabled={busy} variant="danger" onClick={() => { setError(""); setConfirmNoShow(true); }}>Mark as NoShow</DashboardButton>}
          </div>
        </div>
        {error && !confirmNoShow && <div role="alert" className="rounded-xl bg-error-alpha-16 px-4 py-3 text-sm text-error-dark">{error}</div>}
        {order.status === "NoShow" ? (
          <p className="rounded-xl bg-warning/10 px-4 py-3 text-sm">This paid order was marked as not collected. Marking NoShow does not automatically refund the payment.</p>
        ) : !canMarkNoShow && order.noShowIneligibleReason && !ordersDemoReason ? (
          <p className="rounded-xl bg-gray-100 px-4 py-3 text-sm text-light-secondary-text">{order.noShowIneligibleReason} Refresh the order to check its current eligibility.</p>
        ) : null}
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <DashboardCard className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-500/20 p-4 sm:px-6"><h2 className="font-bold">Bag items</h2><StatusBadge tone={tone(order.status)}>{statusLabel}</StatusBadge></div>
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-100 text-left"><tr><th className="p-3 pl-5">Bag</th><th className="p-3">Unit price</th><th className="p-3">Quantity</th><th className="p-3 pr-5 text-right">Subtotal</th></tr></thead><tbody>{order.items.map((item) => <tr key={item.id} className="border-t border-gray-500/20"><td className="p-3 pl-5"><div className="flex items-center gap-3"><span className="size-10 overflow-hidden rounded-xl"><ProductImage alt="" /></span><div><strong className="block">{item.bagNameSnapshot}</strong><span className="font-mono text-xs text-light-secondary-text">{item.bagId.slice(0, 8)}…</span></div></div></td><td className="p-3">{money(item.unitPriceSnapshot)}</td><td className="p-3">{item.quantity}</td><td className="p-3 pr-5 text-right">{money(item.subtotal)}</td></tr>)}</tbody></table></div>
            <div className="flex justify-end border-t border-gray-500/20 p-4 sm:px-6"><dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm"><dt className="text-light-secondary-text">Delivery fee</dt><dd className="text-right">{money(order.deliveryFee)}</dd><dt className="text-light-secondary-text">Voucher discount</dt><dd className="text-right">−{money(order.voucherDiscount)}</dd><dt className="font-semibold">Total</dt><dd className="text-right text-lg font-bold">{money(order.totalAmount)}</dd></dl></div>
          </DashboardCard>
          <div className="space-y-6">
            <DashboardCard className="p-5">
              <h2 className="font-bold">Fulfillment</h2>
              {order.pickupCode && <div className="mt-4 rounded-2xl bg-primary-lighter p-5 text-center"><p className="text-xs font-semibold uppercase tracking-wide text-primary">Pickup code</p><p className="mt-2 break-all text-3xl font-bold tracking-widest">{order.pickupCode}</p></div>}
              <dl className="mt-4 grid grid-cols-[90px_1fr] gap-3 text-sm"><dt className="text-light-secondary-text">Type</dt><dd>{order.deliveryType}</dd><dt className="text-light-secondary-text">Deadline</dt><dd>{dateTime(order.pickupDeadline)}</dd><dt className="text-light-secondary-text">Address</dt><dd>{provided(order.deliveryAddress)}</dd></dl>
              {order.deliveryType.toLowerCase() === "pickup" && <p className="mt-4 text-xs leading-5 text-light-secondary-text">Confirmed means payment was accepted. Check the pickup code when handing over the bags. Mark NoShow only after checking that the customer did not collect them.</p>}
            </DashboardCard>
            <DashboardCard className="p-5"><h2 className="font-bold">Record</h2><dl className="mt-4 grid grid-cols-[90px_1fr] gap-3 text-sm"><dt className="text-light-secondary-text">Customer</dt><dd>{provided(order.contactNameSnapshot)}</dd><dt className="text-light-secondary-text">Phone</dt><dd>{provided(order.contactPhoneSnapshot)}</dd><dt className="text-light-secondary-text">Created</dt><dd>{dateTime(order.createdAt)}</dd><dt className="text-light-secondary-text">Updated</dt><dd>{dateTime(order.updatedAt)}</dd></dl></DashboardCard>
          </div>
        </div>
      </div>
      {confirmNoShow && <DashboardDialog title={`Mark order #${order.id.slice(0, 8)} as NoShow?`} onClose={() => !busy && setConfirmNoShow(false)}>
        <p className="p-5 text-sm leading-6 text-light-secondary-text sm:p-6">Confirm that you checked this order and the customer has not collected the bags. This records the order as NoShow and applies the system policy automatically.</p>
        {error && <p role="alert" className="px-5 pb-4 text-sm text-error-dark sm:px-6">{error}</p>}
        <DialogActions onCancel={() => !busy && setConfirmNoShow(false)}><DashboardButton disabled={busy} variant="danger" onClick={() => void confirmCollectionMissed()}>{busy ? "Saving…" : "Confirm NoShow"}</DashboardButton></DialogActions>
      </DashboardDialog>}
    </>
  );
}
