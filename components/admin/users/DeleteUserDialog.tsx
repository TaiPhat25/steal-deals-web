"use client";

import { useEffect, useRef } from "react";
import type { UserSummary } from "@/lib/api/admin-types";

type DeleteUserDialogProps = {
  user: UserSummary;
  deleting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteUserDialog({ user, deleting, error, onCancel, onConfirm }: DeleteUserDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !deleting) onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleting, onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button type="button" className="absolute inset-0 bg-black/50 border-0" aria-label="Cancel deletion" onClick={() => !deleting && onCancel()} />
      <section role="alertdialog" aria-modal="true" aria-labelledby="delete-user-title" aria-describedby="delete-user-description" className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <div className="size-11 rounded-full bg-error-alpha-16 text-error-dark flex items-center justify-center text-xl font-bold" aria-hidden="true">!</div>
        <h2 id="delete-user-title" className="mt-4 text-xl font-bold text-light-primary-text">Delete {user.fullName}?</h2>
        <p id="delete-user-description" className="mt-2 text-sm leading-6 text-light-secondary-text">
          This soft-deletes and deactivates <strong className="text-light-primary-text">{user.email}</strong>. The account will disappear from this list and cannot be restored here.
        </p>
        {error && <div className="mt-4 rounded-xl bg-error-alpha-16 text-error-dark px-4 py-3 text-sm" role="alert">{error}</div>}
        <div className="mt-6 flex justify-end gap-3">
          <button ref={cancelRef} type="button" onClick={onCancel} disabled={deleting} className="h-10 px-5 rounded-full ring ring-gray-500/20 text-sm font-semibold hover:bg-gray-100 disabled:opacity-50">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={deleting} className="h-10 px-5 rounded-full bg-error text-white text-sm font-bold hover:opacity-90 disabled:opacity-60">
            {deleting ? "Deleting…" : "Delete user"}
          </button>
        </div>
      </section>
    </div>
  );
}
