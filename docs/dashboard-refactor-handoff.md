# Dashboard refactor handoff

## Current state

The `(admin)` and `(seller)` route groups now share a Tailwind 4 dashboard
foundation. The storefront was deliberately left untouched.

- `app/dashboard.css` is the only dashboard stylesheet. It imports Tailwind
  with automatic discovery disabled and explicitly scans only the two dashboard
  route groups and their components.
- Both route-group layouts import that stylesheet and wrap their pages in
  `DashboardShell`.
- `components/dashboard/DashboardShell.tsx` owns the responsive shell, header,
  sidebar, role-specific navigation, menus, and profile presentation.
  The seller header intentionally has no global surplus-bag search; bag and
  order filters stay on their relevant pages.
- `components/dashboard/ui.tsx` contains the small set of repeated primitives:
  cards, page headers, buttons, badges, avatars, and product placeholders.
- `components/dashboard/Dialog.tsx` contains the shared native dialog, action
  footer, and auto-dismissing toast used by the interactive admin screens.
- Page files are Server Components unless they use state or navigation hooks.
  The admin overview stays server-rendered and delegates its interactive
  day/month statistics control to
  `components/admin/dashboard/Statistics.tsx` and its recent-orders table to
  `components/admin/dashboard/RecentOrders.tsx`.

## Admin functionality

The admin routes now behave as a usable prototype instead of a static theme:

- `/admin/users` remains the Identity Service CRUD screen when the API is
  reachable. A network-level fetch failure activates an in-memory fallback with
  backend-shaped user fields, filtering, pagination, details, create/edit, and
  delete behavior. The page displays a Demo data banner and API retry action.
  Authentication, authorization, validation, and other HTTP errors never
  activate fallback mode.
- `/admin/categories` provides in-memory search, active-state filtering,
  pagination, selection, create/edit, unique name/slug validation, and
  confirmed deletion. Its dummy records now use the backend
  category fields: `id`, `name`, `slug`, `iconUrl`, and `isActive`.
- `/admin/sellers` is the Seller Accounts workspace. Its Stores tab uses the
  backend store-profile fields and provides local search, details, verification,
  and active-state toggling. Its Applications tab retains the searchable seller
  onboarding review, approval, and reasoned rejection flow, but is visibly
  labeled as a future-only contract because seller onboarding has no backend DTO.
- `/admin/support` separates Support tickets and Reports in tabs. Support
  tickets retain search/filter/pagination, conversation replies, and
  resolve/reopen actions. Reports cover food listings, stores, and users with
  target details and Open, Reviewing, Actioned, and Dismissed transitions.
- The former `/admin/customers` and `/admin/inbox` routes were removed.
  Customer identities remain available through `/admin/users`; support
  conversations now stay attached to their tickets instead of a separate admin
  chat inbox.
- `/admin` uses four period-aware summary blocks with a per-day/per-month
  switch. It also lists pending seller applications and links directly to
  `/admin/sellers?tab=applications`; these onboarding records remain
  future-only dummy data. Order status and recent-order dummy data use backend
  field names, snapshot fields, UUID-shaped IDs, ISO timestamps, VND amounts,
  and current backend-created/handled status spellings.

Admin prototype data resets on refresh. Categories, sellers, support, and
overview records remain page-local; the overview's pending-seller summary does
not share state with the seller workspace. User Accounts prefer the real API
and use `lib/api/admin-demo.ts` only while Identity Service is unreachable.
There is no browser storage or fake latency. When backend endpoints are stable,
remove the fallback and replace the remaining page-local mutation handlers with
API calls while retaining controls, dialogs, validation, and feedback.

## Seller functionality

Seller-domain endpoints are documented by the backend, but this dashboard does
not call them yet. Seller routes still use
`components/seller/SellerDemoProvider.tsx`, a small in-memory React provider
mounted inside the seller layout. Product, order, and store changes survive
client-side navigation between seller routes but reset on refresh. There is no
seller API client, browser storage, fake latency, or speculative
request/response layer.

- `/seller` derives four metrics, confirmed pickups, and recent orders from the
  shared demo state. Pending orders can be confirmed from the overview.
- `/seller/products` manages surplus bags rather than generic ecommerce
  products. It provides local search/filter/pagination, selection and bulk
  status changes, quantity updates, deletion, and links to record-specific
  create/edit/details routes.
- `/seller/products/add`, `/seller/products/edit`, and
  `/seller/products/details` share the backend-shaped surprise-bag model:
  `salePrice`, `quantityTotal`, `quantityRemaining`, category objects, ISO pickup
  timestamps, `expiryDate`, store snapshots, and `createdAt`. Forms validate
  pricing, pickup windows, and expiry; created and edited bags immediately
  appear across seller routes. Image inputs retain only the selected filename
  as an explicitly future UI field because the current bag DTO has no media.
  Both price inputs accept any positive number, matching backend `decimal`
  values without an accidental HTML step grid.
- `/seller/orders` provides local search/filter/pagination, derived status
  counts, and CSV export over backend-shaped order and item snapshots. Dummy
  statuses are limited to `Pending`, `Confirmed`,
  `InventoryReservationFailed`, `PaymentFailed`, and `Cancelled`. Order details
  allow the locally simulated `Pending` -> `Confirmed` transition or
  cancellation.
- `/seller/settings` uses the current store profile/create/update fields,
  including address, phone, bank account, and license URL. Latitude and
  longitude remain in the demo record because the current backend request
  requires them, but they are hidden from sellers. The backend does not
  currently document geocoding, so integration must preserve stored
  coordinates or add address-to-coordinate handling.
  Operating hours, cover images, and request-side avatar selection remain
  visibly marked future UI fields. Save updates the shared demo state, Cancel
  restores the last saved values, and active days require a closing time after
  their opening time.
- `/seller/inbox` provides customer/order search, local messages, emoji and
  attachment placeholders, contact details, and conversation clearing. Voice
  and video controls remain disabled until a calling service exists.
  For capstone scope, prefer order-linked asynchronous text messages only; do
  not add realtime presence, typing indicators, calls, or attachment storage
  unless messaging becomes a graded core requirement.

When seller endpoints arrive, replace provider reads and state setters at each
page boundary with backend queries and mutations, then remove the provider.
Keep the current controls, validation, order transition feedback, dialogs, and
empty/error presentation.

## Backend-aligned mock contracts

`lib/api/dashboard-types.ts` contains the small set of response shapes used by
dashboard dummy data: categories, store profiles, surprise bags, orders, and
order items. These types mirror the 2026-07-30 backend reference but do not add
fetch functions or map endpoints into pages.

Identity request/response types in `lib/api/admin-types.ts` and
`lib/api/store-types.ts` were also corrected for nullable current-user fields,
nullable request values, address fields, update email support, and optional
pagination.

`lib/api/admin-demo.ts` is the only API-unavailable fallback. It deliberately
mirrors the existing admin user functions instead of introducing a fake server
or general mock repository.

Backend status fields remain `string` in response types. The demo uses a narrow
UI-only list of current spellings; do not treat it as a final backend enum.
Future-only dashboard data remains local and explicit:

- bag image filename;
- store cover/avatar filename and operating hours;
- seller applications;
- support tickets, reports, and seller inbox conversations.

The first two preserve likely product needs without claiming current DTO
support. The last three remain prototypes until backend contracts exist.

## Styling conventions

- Prefer a named component when the same visual structure occurs on at least
  three screens. Keep one-off layout in visible Tailwind utilities.
- Match new interactive components to the existing dashboard primitives:
  rounded cards and controls, theme colors, border/shadow treatment, typography,
  responsive breakpoints, and hover/focus states.
- Do not add semantic CSS aliases with `@apply`; component names provide the
  semantic layer.
- Tailwind variant maps must contain complete class strings. Do not construct
  class names such as `bg-${tone}` because Tailwind cannot detect them.
- Add dashboard theme values to `app/dashboard.css`; do not restore a compiled
  stylesheet under `public`.
- Keep hard-coded styling in Tailwind. Inline style is reserved for values that
  genuinely come from runtime data, such as chart widths.

## Assets

The old `public/admin` and `public/seller` trees were identical and have been
deleted. They are recoverable from Git history if an original theme asset is
ever needed.

Dashboard assets now live under `public/dashboard`:

- `product-placeholder.png` is the single mock product/category image.
- `favicon0a4b.ico` is shared by both dashboard roots.

People are represented by the `Avatar` initials component, and the language
selector uses text/emoji. Do not add role-specific copies of shared assets.
Backend image URLs can replace `ProductImage` or `Avatar` at the data boundary
when those APIs are ready.

## Validation

Run these after dashboard changes:

```powershell
npx.cmd eslint "app/(admin)" "app/(seller)" components/admin components/dashboard components/seller
node --experimental-strip-types lib/api/admin-demo.test.mjs
npm.cmd run build
```

At this handoff all three commands pass. All application routes build,
including the 14 admin/seller routes. The generated dashboard CSS is about 46
KB, down from two copied 100 KB stylesheets, and dashboard public assets total
about 4 KB instead of 1.96 MB across 370 files.

## Safe continuation points

- Replace mock arrays in individual pages with backend results without changing
  the shared shell or page-level interaction patterns.
- Map backend status values to the static `StatusBadge` tones.
- Pass real image URLs through a dedicated image component once the backend
  host and Next image policy are known.
- Keep search/filter state page-specific until three pages share the same real
  backend query contract; the current controls have different domain behavior.
- Connect seller accounts/applications, categories, support/reports, and
  recent-order handlers at their existing local mutation boundaries. Do not
  preserve the disposable in-memory transformation code after an endpoint
  replaces it.
- Browser-level visual regression coverage is not present. Before a design
  overhaul, capture desktop and mobile baselines for the dashboard, tables,
  inbox, product forms, and user dialogs.

## Out of scope

The `(store)` routes still use the crawled Bootstrap/store theme and the
`public/assets` tree. Existing storefront lint warnings and asset cleanup must
be handled as a separate refactor so dashboard Tailwind does not leak into the
storefront.
