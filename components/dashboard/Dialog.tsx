"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { DashboardButton } from "@/components/dashboard/ui";

export function DashboardDialog({
  children,
  onClose,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="dashboard-dialog-title"
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl bg-white p-0 text-light-primary-text shadow-xl backdrop:bg-black/50"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div onClick={(event) => event.stopPropagation()}>
        <header className="flex items-center justify-between gap-4 border-b border-gray-500/20 px-5 py-4 sm:px-6">
          <h2 id="dashboard-dialog-title" className="text-xl font-bold">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close dialog"
            className="size-9 rounded-full text-xl text-light-secondary-text hover:bg-gray-100"
            onClick={onClose}
          >
            ×
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}

export function DialogActions({
  children,
  onCancel,
}: {
  children: ReactNode;
  onCancel: () => void;
}) {
  return (
    <footer className="flex justify-end gap-3 border-t border-gray-500/20 px-5 py-4 sm:px-6">
      <DashboardButton variant="secondary" onClick={onCancel}>
        Cancel
      </DashboardButton>
      {children}
    </footer>
  );
}

export function DashboardToast({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), 4000);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed right-4 top-20 z-50 max-w-sm rounded-xl bg-primary-darker px-4 py-3 text-sm font-semibold text-white shadow-lg"
      role="status"
      aria-live="polite"
    >
      {children}
    </div>
  );
}
