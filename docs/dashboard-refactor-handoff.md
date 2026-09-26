# Dashboard Architecture & Handoff

## Overview

The `(admin)` and `(seller)` route groups share a Tailwind 4 dashboard foundation wrapped in `DashboardShell`.

- **Stylesheet**: `app/dashboard.css` imports Tailwind 4 scanning only dashboard route groups and components.
- **Shell**: `components/dashboard/DashboardShell.tsx` provides responsive navigation, header, sidebar, role-based menus, and auth presentation.
- **Shared Primitives**: `components/dashboard/ui.tsx` (cards, buttons, badges, page headers, avatars) and `components/dashboard/Dialog.tsx` (native modal dialog, action footer, toast).
- **Authentication**: Admin dashboard routes use `/api/admin-auth/*` sessions (`Admin` and `SuperAdmin`). Seller dashboard routes use `/api/auth/*` sessions (`Seller`). Protected routes enforce client-side `RequireAuth` with mandatory backend authorization.

---

## Admin Routes (`/admin`)

- `/admin`: Marketplace overview with period-aware order metrics, recent orders, and pending store applications.
- `/admin/buyers`, `/admin/sellers`, `/admin/admins`: Account management for customers, sellers, and administrators via `/api/user` and `/api/admin`. Falls back to `lib/api/admin-demo.ts` only upon network failure.
- `/admin/categories`: Category CRUD connected to Store Service (`/api/categories`). Includes client-side filtering, soft-delete, and quick-navigation to pending category requests.
- `/admin/category-requests`: Review queue for category suggestions submitted by verified sellers:
  - Fetches pending suggestions via `GET /api/category-suggestions/pending`.
  - Moderates suggestions via `POST /api/category-suggestions/{id}/review`.
  - **Approve**: creates an active official category (with editable name and optional icon URL) and marks the request approved.
  - **Reject**: records an administrative explanation comment for the seller.
- `/admin/sellers`: Seller Management workspace with tabs for seller accounts, store profiles, and pending store verifications (`PATCH /api/stores/{id}/verify`, `DELETE /api/stores/{id}/reject`).
- `/admin/support`: Support tickets and moderation reports for food listings, stores, and users.

---

## Seller Routes (`/seller`)

Seller pages share client data boundaries through `SellerDemoProvider.tsx` or direct Store/Order Service queries.

- `/seller`: Overview metrics (confirmed pickups, remaining units expiring today, recent orders).
- `/seller/products`: Surprise bag listing and status management connected to `/api/bags`.
- `/seller/products/add`, `/seller/products/edit`, `/seller/products/details`: Bag create, edit, duplication, and status updates with pickup window validation.
- `/seller/orders`: Store orders loaded via `GET /api/orders/store/{storeId}`, status progression via `PATCH /api/orders/{id}/status`, and CSV export.
- `/seller/store-reviews`: Store reviews loaded via `GET /api/reviews/store/me`, reply management (`PATCH`/`DELETE /api/reviews/{id}/reply`), and reporting moderation.
- `/seller/category-requests`: Dedicated category suggestion portal:
  - Submits new category requests via `POST /api/category-suggestions`.
  - Displays suggestion history and review status via `GET /api/category-suggestions/me`.
  - Modal form for request submission and details modal to view admin feedback.
- `/seller/settings`: Store profile editing via `GET /api/stores/me` and `PUT /api/stores/{id}`.
- `/seller/inbox`: Asynchronous customer and order messaging prototype.

---

## API Services & Integration

| Service | Environment Variable | Usage |
|---|---|---|
| **Store Service** | `NEXT_PUBLIC_STORE_API_URL` | Categories, category suggestions, store profiles, surprise bags, store reviews (`lib/api/store.ts`) |
| **Order Service** | `NEXT_PUBLIC_ORDER_API_URL` | Store orders and status progression (`lib/api/order.ts`) |
| **Identity Service** | `NEXT_PUBLIC_API_URL` | Customer/seller identity, admin accounts, and auth sessions |

### In-Memory Fallbacks
When backend services are unreachable due to a network-level failure, affected pages display a **Demo data active** banner with a **Retry API** action, preserving complete table interactions and local state. Authentication, validation, and HTTP-level errors never trigger demo mode.

---

## Styling & Asset Guidelines

- Use named primitives (`DashboardCard`, `PageHeader`, `DashboardButton`, `StatusBadge`) for recurring UI structures.
- Tailwind variant maps must contain complete class strings (e.g. avoid string interpolation like `bg-${tone}`).
- Global dashboard styles belong in `app/dashboard.css`; do not place compiled CSS in `public`.
- Assets live under `public/dashboard`: `product-placeholder.png` and `favicon0a4b.ico`.

---

## Validation Commands

Always run the following commands after dashboard changes:

```powershell
npx.cmd eslint "app/(admin)" "app/(seller)" components/admin components/dashboard components/seller
node --experimental-strip-types lib/api/admin-demo.test.mjs
node --experimental-strip-types lib/api/client.test.mjs
node --experimental-strip-types lib/api/store.test.mjs
npm.cmd run build
```
