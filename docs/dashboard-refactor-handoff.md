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
  The account label and avatar initials use the authenticated
  `/api/auth/me` name for both roles. Notifications remain intentionally
  unconnected because the Notification Service is not ready.
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

- `/admin/buyers`, `/admin/sellers`, and `/admin/admins` are the three account
  management destinations. Buyers and admins reuse the Identity Service CRUD
  screen with a fixed role filter; Seller Management adds Seller accounts to
  its existing Stores and future Applications/contracts tabs. `/admin/users`
  remains available as the unfiltered Identity screen but is no longer in the
  sidebar. The header presents `SuperAdmin` as a frontend-only role; the API
  still receives only the current backend roles.
- Identity management uses the real API when it is reachable. A network-level
  fetch failure activates an in-memory fallback with
  backend-shaped user fields, filtering, pagination, details, create/edit, and
  delete behavior. The page displays a Demo data banner and API retry action.
  Authentication, authorization, validation, and other HTTP errors never
  activate fallback mode.
- `/admin/categories` uses the Store Service for list, create, update, and
  delete. A failed list request restores backend-shaped dummy categories with
  a Demo data banner and retry action; edit and delete remain local only while
  that fallback is active. Search, active-state filtering, pagination, and
  selection remain client-side. Bulk delete calls the single-record endpoint
  for each selected category and refreshes the list if any request fails.
  Category delete is a backend soft delete: it sets `isActive` to `false`
  instead of removing the record. The current table removes a successfully
  deleted row immediately; a later list reload may show it again as inactive.
- `/admin/sellers` is the Seller Management workspace. Its Stores tab loads
  `GET /api/stores` and uses the Store Service verification and active-state
  endpoints. A failed list request restores backend-shaped dummy stores with a
  Demo data banner and retry action; verification and active-state changes stay
  local only while that fallback is active. Its Applications tab retains the
  searchable seller onboarding review, approval, and reasoned rejection flow,
  but is visibly labeled as a future-only contract because seller onboarding
  has no backend DTO.
- `/admin/support` separates Support tickets and Reports in tabs. Support
  tickets retain search/filter/pagination, conversation replies, and
  resolve/reopen actions. Reports cover food listings, stores, and users with
  target details and Open, Reviewing, Actioned, and Dismissed transitions.
- The former `/admin/customers` and `/admin/inbox` routes were removed.
  Customer identities remain available through `/admin/buyers`; support
  conversations now stay attached to their tickets instead of a separate admin
  chat inbox.
- `/admin` uses four period-aware summary blocks with a per-day/per-month
  switch. It also lists pending seller applications and links directly to
  `/admin/sellers?tab=applications`; these onboarding records remain
  future-only dummy data. Order status and recent-order dummy data use backend
  field names, snapshot fields, UUID-shaped IDs, ISO timestamps, VND amounts,
  and current backend-created/handled status spellings.
- GUIDs remain record keys and mutation identifiers, but account, store, and
  recent-order tables display page-aware row numbers instead.

Admin category CRUD and the Seller Management Stores tab prefer the Store
Service and fall back to local behavior when their initial lists cannot load.
Applications, support, and overview records remain page-local; the overview's
pending-seller summary does not share state with the seller workspace. User
Accounts prefer the real API and use `lib/api/admin-demo.ts` only while Identity
Service is unreachable.
There is no browser storage or fake latency. When backend endpoints are stable,
remove the fallback and replace the remaining page-local mutation handlers with
API calls while retaining controls, dialogs, validation, and feedback.

## Seller functionality

Seller routes use `components/seller/SellerDemoProvider.tsx` as the shared
client data boundary. After authentication initializes, it resolves the
seller's store through `GET /api/stores/me`, then loads that store's bags and
orders in parallel. Store, bag, and order failures retain separate loading and
fallback reasons so each affected page can show a Demo data banner and retry
all three services. Product, order, and store changes survive client-side
navigation between seller routes but reset on refresh. There is no browser
storage, fake latency, notification integration, or speculative API layer.

- `/seller` derives five metrics, including remaining units expiring today,
  plus confirmed pickups and recent orders from the provider's API-backed
  store, bag, and order data. Pending orders use the Order Service status
  endpoint. When a required service fails, the overview explicitly uses the
  provider's fallback records and exposes a retry action.
- `/seller/products` manages surplus bags rather than generic ecommerce
  products. Its initial list prefers the Store Service and falls back to dummy
  data. Search/filter/pagination stays client-side. Single and bulk status
  changes call the single-record status endpoint, and deletion calls the
  single-record delete endpoint for each selected bag. Those mutations remain
  local only in visible fallback mode. Inline `quantityRemaining` edits remain
  local because the current API has no inventory-adjustment request.
- `/seller/products/add`, `/seller/products/edit`, and
  `/seller/products/details` share the backend-shaped surprise-bag model:
  `salePrice`, `quantityTotal`, `quantityRemaining`, category objects, ISO pickup
  timestamps, `expiryDate`, store snapshots, and `createdAt`. Forms validate
  pricing, pickup windows, and expiry; created and edited bags immediately
  appear across seller routes. Image inputs retain only the selected filename
  as an explicitly future UI field because the current bag DTO has no media.
  Both price inputs accept any positive number, matching backend `decimal`
  values without an accidental HTML step grid. Discount shortcuts, the custom
  percentage input, and the live discount label derive `salePrice` in the UI;
  no unsupported discount field is sent to the Store Service.
  The shared form groups related fields and defaults new pickup windows to the
  next half-hour for one hour. Native date-time inputs remain available for
  exact values, with shortcuts for shifting pickup and expiry times.
  The add form uses real category IDs and `POST /api/bags`. Edit uses
  `PUT /api/bags/{id}` plus the status endpoint when needed. Details can change
  status and duplicate a bag through the Store Service. All successful results
  are written back to the shared provider immediately.
- `/seller/orders` loads `GET /api/orders/store/{storeId}` and provides local
  search/filter/pagination, derived status counts, and CSV export over those
  results. Details use the loaded order and send Confirmed or Cancelled through
  `PATCH /api/orders/{id}/status`. If the Order Service fails, both screens use
  the provider's backend-shaped dummy orders with a visible retryable banner.
  Customer names remain available only for those demo IDs because the current
  order response exposes only `userId`; real records display `Unknown customer`.
- `/seller/settings` uses the current store profile/create/update fields,
  including address, phone, bank account, and license URL. Latitude and
  longitude remain in the demo record because the current backend request
  requires them, but they are hidden from sellers. The backend does not
  currently document geocoding, so integration must preserve stored
  coordinates or add address-to-coordinate handling.
  The form loads `GET /api/stores/me` through the provider and saves supported
  fields through `PUT /api/stores/{id}`. Operating hours, cover images, and
  request-side avatar selection remain visibly marked future UI fields. Cancel
  restores the last successfully loaded or saved values, and active days
  require a closing time after their opening time. `bankAccount` and
  `licenseUrl` can be sent but are cleared on reload because the response does
  not return them.
- `/seller/store-reviews` remains local. The current response omits `bagId` and
  `isReported`, which the screen requires, and the API has no remove-reply or
  clear-report operation. Do not partially integrate this page by inventing
  those fields.
- `/seller/inbox` provides customer/order search, local messages, emoji and
  attachment placeholders, contact details, and conversation clearing. Voice
  and video controls remain disabled until a calling service exists.
  For capstone scope, prefer order-linked asynchronous text messages only; do
  not add realtime presence, typing indicators, calls, or attachment storage
  unless messaging becomes a graded core requirement.

When the Store and Order services are stable, remove the provider's fallback
records and demo-mode mutation branches. The provider can remain as shared
client state while seller routes need changes to appear immediately across
pages. Keep the current controls, validation, feedback, dialogs, and
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

`lib/api/admin-demo.ts` is the Identity-specific API-unavailable fallback. It
deliberately mirrors the existing admin user functions instead of introducing
a fake server or general mock repository. Store-shaped and Order-shaped
fallback arrays remain colocated with their existing dashboard consumers or
the seller provider.

`lib/api/store.ts` contains only the Store Service calls currently in use:
category CRUD, store listing/current-store/update/moderation, and bag
list/create/update/delete/status operations. They use
`NEXT_PUBLIC_STORE_API_URL`. `lib/api/order.ts` contains seller store-order
listing and status updates and uses `NEXT_PUBLIC_ORDER_API_URL`. Identity calls
continue to use `NEXT_PUBLIC_API_URL`.

Backend status fields remain `string` in response types. The demo uses a narrow
UI-only list of current spellings; do not treat it as a final backend enum.
Future-only dashboard data remains local and explicit:

- bag image filename;
- store cover/avatar filename and operating hours;
- seller applications;
- support tickets, reports, and seller inbox conversations.
- seller store reviews and review moderation state;
- dashboard notification counts and menu content.

The first two preserve likely product needs without claiming current DTO
support. The remaining entries stay prototypes until backend contracts exist.

## API fallback removal checklist

These are temporary API-unavailable fallbacks, not permanent application data.
Remove each one when its backend service and browser integration are stable:

- Identity account management: `lib/api/admin-demo.ts`, used by Buyers,
  Sellers, Admins, and the unfiltered Users route only after a network-level
  Identity failure.
- Admin categories: `INITIAL_CATEGORIES` in `/admin/categories`; create, edit,
  and delete remain local only while its Demo data banner is visible.
- Admin store management: `INITIAL_STORES` in `/admin/sellers`; verification
  and activation remain local only while its Demo data banner is visible.
- Seller store, bag, and order data: `INITIAL_SETTINGS`, `DEMO_PRODUCTS`, and
  `INITIAL_ORDERS` in `SellerDemoProvider`. The provider records a separate
  fallback reason for Store, Bag, and Order loading and exposes one retry action.
- Seller customer display names: `DEMO_CUSTOMER_NAMES` is only meaningful for
  fallback orders. Remove it when the seller-safe order response supplies the
  customer display field.

Do not confuse those fallbacks with future-only prototypes. Seller
applications, support/reports, inbox, reviews, notifications, media, and
operating hours have no complete approved contract and must remain explicitly
local until the backend work is complete.

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
node --experimental-strip-types lib/api/client.test.mjs
npm.cmd run build
```

At this handoff all four commands pass. All application routes build,
including the 16 admin/seller routes. The generated dashboard CSS is about 46
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
- Connect seller applications, support/reports, and admin overview orders at
  their existing local mutation boundaries once complete backend contracts
  exist. Do not preserve the disposable in-memory transformation code after an
  endpoint replaces it.
- Browser-level visual regression coverage is not present. Before a design
  overhaul, capture desktop and mobile baselines for the dashboard, tables,
  inbox, product forms, and user dialogs.

## Out of scope

The `(store)` routes still use the crawled Bootstrap/store theme and the
`public/assets` tree. Existing storefront lint warnings and asset cleanup must
be handled as a separate refactor so dashboard Tailwind does not leak into the
storefront.
