"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/components/auth/AuthProvider";
import UserDrawer from "@/components/admin/users/UserDrawer";
import DeleteUserDialog from "@/components/admin/users/DeleteUserDialog";
import { deleteAdminUser, listAdminUsers } from "@/lib/api/admin";
import { ApiClientError } from "@/lib/api/client";
import type {
  AdminRole,
  PagedResult,
  UserSummary,
} from "@/lib/api/admin-types";

const ROLES: AdminRole[] = ["Customer", "Seller", "Admin"];
const PAGE_SIZES = [10, 20, 50] as const;

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function roleClass(role: string) {
  if (role === "Admin") return "bg-error-alpha-16 text-error-dark";
  if (role === "Seller") return "bg-warning-alpha-16 text-warning-dark";
  return "bg-success-alpha-16 text-success-dark";
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function loadErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    if (error.status === 401) return "Your access token is missing or expired. Sign in again from the normal login page.";
    if (error.status === 403) return "Your account no longer has permission to manage users.";
    return error.message;
  }
  return "Unable to load users. Check that Identity Service is available and try again.";
}

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const { accessToken, getCurrentUser, isInitialized } = useAuth();
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const lastActionRef = useRef<HTMLButtonElement | null>(null);
  const [result, setResult] = useState<PagedResult<UserSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [drawer, setDrawer] = useState<{ mode: "create" | "edit"; userId?: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserSummary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [currentAdminId, setCurrentAdminId] = useState("");

  const search = searchParams.get("search")?.trim() ?? "";
  const rawRole = searchParams.get("role");
  const role = ROLES.includes(rawRole as AdminRole) ? (rawRole as AdminRole) : "";
  const rawStatus = searchParams.get("status");
  const status = rawStatus === "active" || rawStatus === "inactive" ? rawStatus : "";
  const page = positiveInteger(searchParams.get("page"), 1);
  const rawPageSize = positiveInteger(searchParams.get("pageSize"), 10);
  const pageSize = PAGE_SIZES.includes(rawPageSize as (typeof PAGE_SIZES)[number])
    ? (rawPageSize as (typeof PAGE_SIZES)[number])
    : 10;

  const updateQuery = useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(queryString);
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || value === 1 && key === "page") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }
      const next = params.toString();
      router.replace(next ? `/admin/users?${next}` : "/admin/users", { scroll: false });
    },
    [queryString, router],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearchInput(searchParams.get("search") ?? "");
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [queryString, searchParams]);

  useEffect(() => {
    if (searchInput.trim() === search) return;
    const timeout = window.setTimeout(() => {
      updateQuery({ search: searchInput.trim() || null, page: null });
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [search, searchInput, updateQuery]);

  useEffect(() => {
    if (!isInitialized || !accessToken) return;
    let active = true;
    const timeout = window.setTimeout(() => {
      void getCurrentUser()
        .then((user) => {
          if (active) setCurrentAdminId(user.userId);
        })
        .catch(() => {
          if (active) setCurrentAdminId("");
        });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [accessToken, getCurrentUser, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    let active = true;
    const apiQuery = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    if (search) apiQuery.set("searchTerm", search);
    if (role) apiQuery.set("role", role);
    if (status) apiQuery.set("accountStatus", status);

    const timeout = window.setTimeout(() => {
      setLoading(true);
      setLoadError(null);
      if (!accessToken) {
        setLoading(false);
        setLoadError("Sign in from the normal login page before opening the admin user panel.");
        return;
      }
      void listAdminUsers(accessToken, apiQuery)
      .then((data) => {
        if (!active) return;
        if (data.totalPages > 0 && page > data.totalPages) {
          updateQuery({ page: data.totalPages });
          return;
        }
        setResult(data);
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(loadErrorMessage(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [accessToken, isInitialized, page, pageSize, reloadVersion, role, search, status, updateQuery]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const hasFilters = Boolean(search || role || status);
  const currentPage = result?.page ?? page;
  const totalPages = result?.totalPages ?? 0;
  const rangeLabel = useMemo(() => {
    if (!result || result.totalCount === 0) return "0 users";
    const start = (result.page - 1) * result.pageSize + 1;
    const end = Math.min(result.page * result.pageSize, result.totalCount);
    return `${start}–${end} of ${result.totalCount} users`;
  }, [result]);

  function restoreActionFocus() {
    window.setTimeout(() => lastActionRef.current?.focus(), 0);
  }

  function openCreate() {
    lastActionRef.current = createButtonRef.current;
    setDrawer({ mode: "create" });
  }

  function openEdit(user: UserSummary, button: HTMLButtonElement) {
    lastActionRef.current = button;
    setDrawer({ mode: "edit", userId: user.id });
  }

  const closeDrawer = useCallback(() => {
    setDrawer(null);
    restoreActionFocus();
  }, []);

  function handleSaved(message: string) {
    setDrawer(null);
    setToast(message);
    setReloadVersion((version) => version + 1);
    restoreActionFocus();
  }

  function askDelete(user: UserSummary, button: HTMLButtonElement) {
    lastActionRef.current = button;
    setDeleteError(null);
    setDeleteTarget(user);
  }

  const cancelDelete = useCallback(() => {
    if (deleting) return;
    setDeleteTarget(null);
    setDeleteError(null);
    restoreActionFocus();
  }, [deleting]);

  async function confirmDelete() {
    if (!accessToken || !deleteTarget || deleteTarget.id === currentAdminId) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAdminUser(accessToken, deleteTarget.id);
      setToast(`${deleteTarget.fullName} was deleted.`);
      setDeleteTarget(null);
      if ((result?.items.length ?? 0) === 1 && page > 1) {
        updateQuery({ page: page - 1 });
      } else {
        setReloadVersion((version) => version + 1);
      }
      restoreActionFocus();
    } catch (error) {
      setDeleteError(
        error instanceof ApiClientError ? error.message : "Unable to delete this user.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AdminLayout>
      {toast && (
        <div className="fixed top-20 right-4 z-50 rounded-xl bg-primary-darker text-white px-4 py-3 shadow-lg text-sm font-semibold max-w-sm" role="status" aria-live="polite">
          {toast}
        </div>
      )}

      <div className="bg-white rounded-2xl w-full overflow-hidden">
        <div className="p-4 sm:p-6 pb-4">
          <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">Identity Service</p>
              <h1 className="text-xl font-bold text-light-primary-text">User accounts</h1>
            </div>
            <button
              ref={createButtonRef}
              type="button"
              onClick={openCreate}
              className="rounded-full inline-flex items-center justify-center font-bold transition-colors bg-primary text-white hover:bg-primary-dark px-4 h-9 text-sm"
            >
              <span className="text-lg mr-1" aria-hidden="true">+</span> Create user
            </button>
          </div>

          <div className="flex flex-col lg:flex-row justify-between gap-4 lg:items-center">
            <div className="relative w-full" style={{ width: "200px", minWidth: "200px", flexShrink: 0 }}>
              <span className="absolute text-light-secondary-text left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">⌕</span>
              <label htmlFor="user-search" className="sr-only">Search users by name or email</label>
              <input
                id="user-search"
                className="pl-9 w-full pr-3.5 ring h-9 ring-gray-500/20 py-2 bg-gray-100 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Search..."
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>
            <div className="flex items-center" style={{ display: "flex", flexWrap: "nowrap", flexShrink: 0, gap: "12px", alignItems: "center" }}>
              <div style={{ flexShrink: 0 }}>
                <label htmlFor="role-filter" className="sr-only">Filter by role</label>
                <select id="role-filter" value={role} onChange={(event) => updateQuery({ role: event.target.value || null, page: null })} className="h-9 ring ring-gray-500/20 rounded-full bg-gray-100 px-3 text-sm text-light-primary-text border-none focus:outline-none focus:ring-2 focus:ring-primary" style={{ minWidth: "120px" }}>
                  <option value="">All roles</option>
                  {ROLES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div style={{ flexShrink: 0 }}>
                <label htmlFor="status-filter" className="sr-only">Filter by account status</label>
                <select id="status-filter" value={status} onChange={(event) => updateQuery({ status: event.target.value || null, page: null })} className="h-9 ring ring-gray-500/20 rounded-full bg-gray-100 px-3 text-sm text-light-primary-text border-none focus:outline-none focus:ring-2 focus:ring-primary" style={{ minWidth: "140px" }}>
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              {hasFilters && (
                <button type="button" onClick={() => { setSearchInput(""); router.replace("/admin/users", { scroll: false }); }} className="h-9 px-3 rounded-full text-sm font-semibold text-primary hover:bg-primary-lighter" style={{ flexShrink: 0 }}>Clear filters</button>
              )}
            </div>
          </div>
        </div>

        {loadError ? (
          <div className="border-t border-gray-500/20 px-4 py-14 text-center">
            <div className="mx-auto size-11 rounded-full bg-error-alpha-16 text-error-dark flex items-center justify-center font-bold" aria-hidden="true">!</div>
            <h2 className="mt-4 font-bold text-light-primary-text">Users could not be loaded</h2>
            <p className="mt-2 text-sm text-light-secondary-text max-w-md mx-auto">{loadError}</p>
            <button type="button" onClick={() => setReloadVersion((version) => version + 1)} className="mt-5 h-9 px-5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-dark">Try again</button>
          </div>
        ) : loading && !result ? (
          <div className="border-t border-gray-500/20 p-6 space-y-3" role="status" aria-label="Loading users">
            {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-12 rounded-xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : result?.items.length === 0 ? (
          <div className="border-t border-gray-500/20 px-4 py-16 text-center">
            <div className="mx-auto size-12 rounded-full bg-primary-lighter text-primary-dark flex items-center justify-center text-xl" aria-hidden="true">◎</div>
            <h2 className="mt-4 font-bold text-light-primary-text">{hasFilters ? "No matching users" : "No users yet"}</h2>
            <p className="mt-2 text-sm text-light-secondary-text">{hasFilters ? "Try changing or clearing the current filters." : "Create the first Identity user from this panel."}</p>
            {hasFilters && <button type="button" onClick={() => { setSearchInput(""); router.replace("/admin/users", { scroll: false }); }} className="mt-5 h-9 px-5 rounded-full ring ring-gray-500/20 text-primary text-sm font-bold hover:bg-gray-100">Clear filters</button>}
          </div>
        ) : (
          <div className="overflow-x-auto border-t border-gray-500/20">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-500/20">
                  <th className="h-12 p-3 pl-5 text-left text-light-primary-text text-sm font-semibold">ID</th>
                  <th className="h-12 p-3 text-left text-light-primary-text text-sm font-semibold">User</th>
                  <th className="h-12 p-3 text-left text-light-primary-text text-sm font-semibold">Roles</th>
                  <th className="h-12 p-3 text-left text-light-primary-text text-sm font-semibold">Created</th>
                  <th className="h-12 p-3 text-left text-light-primary-text text-sm font-semibold">Email</th>
                  <th className="h-12 p-3 text-left text-light-primary-text text-sm font-semibold">Status</th>
                  <th className="h-12 p-3 pr-5 text-right text-light-primary-text text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {result?.items.map((user) => {
                  const isCurrentAdmin = user.id === currentAdminId;
                  return (
                    <tr key={user.id} className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50">
                      <td className="px-3 py-3.5 pl-5 whitespace-nowrap text-xs text-light-secondary-text font-mono" title={user.id}>#{user.id.slice(0, 8)}</td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img alt="" src={user.avatarUrl} className="size-9 rounded-xl object-cover bg-gray-100" />
                          ) : (
                            <span className="size-9 rounded-xl bg-primary-lighter text-primary-dark flex items-center justify-center text-xs font-bold" aria-hidden="true">{initials(user.fullName)}</span>
                          )}
                          <div>
                            <span className="block text-sm font-semibold text-light-primary-text">{user.fullName}</span>
                            <span className="block text-xs text-light-secondary-text mt-0.5">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {user.roles.map((item) => <span key={item} className={`px-2 py-1 inline-flex rounded-full text-xs font-medium ${roleClass(item)}`}>{item}</span>)}
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-sm text-light-primary-text">{formatDate(user.createdAt)}</td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex rounded-full text-xs font-medium ${user.isEmailVerified ? "bg-success-alpha-16 text-success-dark" : "bg-warning-alpha-16 text-warning-dark"}`}>
                          {user.isEmailVerified ? "Verified" : "Unverified"}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex rounded-full text-xs font-medium ${user.isActive ? "bg-primary-lighter text-primary-dark" : "bg-error-alpha-16 text-error-dark"}`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 pr-5 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1">
                          <button type="button" onClick={(event) => openEdit(user, event.currentTarget)} className="h-8 px-3 rounded-lg text-sm font-semibold text-primary hover:bg-primary-lighter" aria-label={`Edit ${user.fullName}`}>Edit</button>
                          <button
                            type="button"
                            disabled={isCurrentAdmin}
                            title={isCurrentAdmin ? "You cannot delete your own administrator account." : undefined}
                            onClick={(event) => askDelete(user, event.currentTarget)}
                            className="h-8 px-3 rounded-lg text-sm font-semibold text-error-dark hover:bg-error-alpha-16 disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label={isCurrentAdmin ? `Cannot delete current administrator ${user.fullName}` : `Delete ${user.fullName}`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loadError && result && result.totalCount > 0 && (
          <div className="p-4 sm:px-6 border-t border-gray-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-light-secondary-text">
              <span>{rangeLabel}</span>
              <label htmlFor="page-size" className="sr-only">Users per page</label>
              <select id="page-size" value={pageSize} onChange={(event) => updateQuery({ pageSize: Number(event.target.value), page: null })} className="h-8 rounded-full ring ring-gray-500/20 bg-gray-100 px-2 text-sm border-none focus:outline-none focus:ring-2 focus:ring-primary">
                {PAGE_SIZES.map((size) => <option key={size} value={size}>{size} / page</option>)}
              </select>
            </div>
            <nav className="flex items-center gap-1 justify-end" aria-label="User pagination">
              <button type="button" onClick={() => updateQuery({ page: null })} disabled={currentPage <= 1 || loading} className="h-8 px-2 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed" aria-label="First page">First</button>
              <button type="button" onClick={() => updateQuery({ page: currentPage - 1 })} disabled={currentPage <= 1 || loading} className="size-8 rounded-lg text-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Previous page">‹</button>
              <span className="px-3 text-sm font-semibold text-light-primary-text" aria-current="page">Page {currentPage} of {totalPages}</span>
              <button type="button" onClick={() => updateQuery({ page: currentPage + 1 })} disabled={currentPage >= totalPages || loading} className="size-8 rounded-lg text-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Next page">›</button>
              <button type="button" onClick={() => updateQuery({ page: totalPages })} disabled={currentPage >= totalPages || loading} className="h-8 px-2 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Last page">Last</button>
            </nav>
          </div>
        )}
      </div>

      {drawer && accessToken && (
        <UserDrawer
          mode={drawer.mode}
          userId={drawer.userId}
          accessToken={accessToken}
          currentAdminId={currentAdminId}
          onClose={closeDrawer}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <DeleteUserDialog
          user={deleteTarget}
          deleting={deleting}
          error={deleteError}
          onCancel={cancelDelete}
          onConfirm={() => void confirmDelete()}
        />
      )}
    </AdminLayout>
  );
}
