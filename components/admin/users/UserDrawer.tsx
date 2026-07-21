"use client";

import { useEffect, useRef, useState, type SubmitEvent } from "react";
import type {
  AdminCreateUserRequest,
  AdminRole,
  AdminUpdateUserRequest,
  UserDetail,
} from "@/lib/api/admin-types";
import {
  createAdminUser,
  getAdminUser,
  updateAdminUser,
} from "@/lib/api/admin";
import { ApiClientError } from "@/lib/api/client";

const ROLES: AdminRole[] = ["Customer", "Seller", "Admin"];

type UserDrawerProps = {
  mode: "create" | "edit";
  userId?: string;
  accessToken: string;
  currentAdminId: string;
  onClose: () => void;
  onSaved: (message: string) => void;
};

function messageFor(error: unknown) {
  return error instanceof ApiClientError
    ? error.message
    : "Unable to save this user. Please try again.";
}

export default function UserDrawer({
  mode,
  userId,
  accessToken,
  currentAdminId,
  onClose,
  onSaved,
}: UserDrawerProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [roles, setRoles] = useState<AdminRole[]>(["Customer"]);
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSelf = detail?.id === currentAdminId;

  useEffect(() => {
    titleRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, submitting]);

  useEffect(() => {
    if (mode !== "edit" || !userId) return;
    let active = true;
    const timeout = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      void getAdminUser(accessToken, userId)
      .then((user) => {
        if (!active) return;
        setDetail(user);
        setEmail(user.email);
        setFullName(user.fullName);
        setPhone(user.phone ?? "");
        setIsActive(user.isActive);
        setRoles(user.roles.filter((role): role is AdminRole => ROLES.includes(role as AdminRole)));
      })
      .catch((caught) => {
        if (active) setError(messageFor(caught));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [accessToken, mode, userId]);

  function toggleRole(role: AdminRole) {
    if (isSelf && role === "Admin") return;
    setRoles((current) =>
      current.includes(role) ? current.filter((item) => item !== role) : [...current, role],
    );
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim();
    const normalizedPhone = phone.trim();
    if (!normalizedName) {
      setError("Full name is required.");
      return;
    }
    if (roles.length === 0) {
      setError("Select at least one role.");
      return;
    }
    if (mode === "create" && password.length < 8) {
      setError("Temporary password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "create") {
        const request: AdminCreateUserRequest = {
          email: normalizedEmail,
          password,
          fullName: normalizedName,
          roles,
          ...(normalizedPhone ? { phone: normalizedPhone } : {}),
        };
        await createAdminUser(accessToken, request);
        onSaved(`${normalizedName} was created successfully.`);
      } else if (userId && detail) {
        const request: AdminUpdateUserRequest = {
          fullName: normalizedName,
          isActive,
          roles: isSelf && !roles.includes("Admin") ? [...roles, "Admin"] : roles,
        };
        if (normalizedPhone) request.phone = normalizedPhone;
        await updateAdminUser(accessToken, userId, request);
        onSaved(`${normalizedName} was updated successfully.`);
      }
    } catch (caught) {
      setError(messageFor(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 border-0"
        aria-label="Close user panel"
        onClick={() => !submitting && onClose()}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-drawer-title"
        className="relative bg-white h-full w-full max-w-lg shadow-xl flex flex-col"
      >
        <header className="px-5 sm:px-6 py-5 border-b border-gray-500/20 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
              User account
            </p>
            <h2
              id="user-drawer-title"
              ref={titleRef}
              tabIndex={-1}
              className="text-xl font-bold text-light-primary-text focus:outline-none"
            >
              {mode === "create" ? "Create user" : "Edit user"}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            disabled={submitting}
            className="size-9 rounded-full hover:bg-gray-100 text-xl text-light-secondary-text disabled:opacity-50"
          >
            ×
          </button>
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center" role="status">
            <div className="size-9 rounded-full border-4 border-primary/20 border-t-primary animate-spin" aria-label="Loading user" />
          </div>
        ) : mode === "edit" && !detail ? (
          <div className="p-6">
            <div className="rounded-xl bg-error-alpha-16 text-error-dark px-4 py-3 text-sm" role="alert">
              {error ?? "This user could not be loaded."}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              <div>
                <label htmlFor="drawer-full-name" className="block text-sm font-semibold text-light-primary-text mb-2">Full name *</label>
                <input
                  id="drawer-full-name"
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-gray-100 ring ring-gray-500/20 border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="drawer-email" className="block text-sm font-semibold text-light-primary-text mb-2">Email address *</label>
                <input
                  id="drawer-email"
                  type="email"
                  autoComplete="off"
                  required
                  readOnly={mode === "edit"}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-gray-100 ring ring-gray-500/20 border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary read-only:text-light-secondary-text read-only:cursor-not-allowed"
                />
                {mode === "edit" && <p className="mt-1.5 text-xs text-light-secondary-text">Email editing is disabled until Identity validates updated addresses safely.</p>}
              </div>
              {mode === "create" && (
                <div>
                  <label htmlFor="drawer-password" className="block text-sm font-semibold text-light-primary-text mb-2">Temporary password *</label>
                  <input
                    id="drawer-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-gray-100 ring ring-gray-500/20 border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="mt-1.5 text-xs text-light-secondary-text">At least 8 characters.</p>
                </div>
              )}
              <div>
                <label htmlFor="drawer-phone" className="block text-sm font-semibold text-light-primary-text mb-2">Phone number</label>
                <input
                  id="drawer-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-gray-100 ring ring-gray-500/20 border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {mode === "edit" && detail?.phone && (
                  <p className="mt-1.5 text-xs text-light-secondary-text">Identity cannot clear an existing phone yet; leaving this blank keeps the current number.</p>
                )}
              </div>

              <fieldset>
                <legend className="block text-sm font-semibold text-light-primary-text mb-2">Roles *</legend>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {ROLES.map((role) => {
                    const checked = roles.includes(role);
                    const locked = Boolean(isSelf && role === "Admin");
                    return (
                      <label key={role} className={`rounded-xl ring ring-gray-500/20 px-3 py-2.5 flex items-center gap-2 text-sm ${locked ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={locked}
                          onChange={() => toggleRole(role)}
                          className="size-4 accent-primary"
                        />
                        {role}
                      </label>
                    );
                  })}
                </div>
                {isSelf && <p className="mt-1.5 text-xs text-light-secondary-text">Your own Admin role is locked to prevent account lockout.</p>}
              </fieldset>

              {mode === "edit" && (
                <label className="rounded-xl ring ring-gray-500/20 px-4 py-3 flex items-center justify-between gap-4 cursor-pointer">
                  <span>
                    <span className="block text-sm font-semibold text-light-primary-text">Active account</span>
                    <span className="block text-xs text-light-secondary-text mt-0.5">Inactive users cannot sign in.</span>
                  </span>
                  <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="size-5 accent-primary" />
                </label>
              )}

              {error && (
                <div className="rounded-xl bg-error-alpha-16 text-error-dark px-4 py-3 text-sm" role="alert">
                  {error}
                </div>
              )}
            </div>

            <footer className="px-5 sm:px-6 py-4 border-t border-gray-500/20 flex justify-end gap-3">
              <button type="button" onClick={onClose} disabled={submitting} className="h-10 px-5 rounded-full ring ring-gray-500/20 text-sm font-semibold hover:bg-gray-100 disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={submitting} className="h-10 px-5 rounded-full bg-primary hover:bg-primary-dark text-white text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting ? "Saving…" : mode === "create" ? "Create user" : "Save changes"}
              </button>
            </footer>
          </form>
        )}
      </section>
    </div>
  );
}
