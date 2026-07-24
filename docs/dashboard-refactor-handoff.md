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
- `components/dashboard/ui.tsx` contains the small set of repeated primitives:
  cards, page headers, buttons, badges, avatars, and product placeholders.
- `components/dashboard/Dialog.tsx` contains the shared native dialog, action
  footer, and auto-dismissing toast used by the interactive admin screens.
- Page files are Server Components unless they use state or navigation hooks.
  The admin overview keeps its static metrics server-rendered and delegates the
  interactive recent-orders table to
  `components/admin/dashboard/RecentOrders.tsx`.

## Admin functionality

The admin routes now behave as a usable prototype instead of a static theme:

- `/admin/users` remains the existing Identity Service CRUD screen.
- `/admin/customers` reuses the completed admin Users API with a locked
  `Customer` role filter. It provides backend search, account-status filtering,
  pagination, trust activity, addresses, and links back to User Accounts for
  identity changes. It is intentionally not a second user CRUD screen.
- `/admin/categories` provides in-memory search, creator/date filtering,
  pagination, selection, create/edit, duplicate-name validation, and confirmed
  deletion.
- `/admin/sellers` models seller onboarding rather than identity management.
  Applications can be searched, filtered, reviewed, approved, rejected with a
  reason, and exported as CSV.
- `/admin/support` provides in-memory ticket search/filter/pagination,
  conversation replies, and resolve/reopen actions.
- `/admin/inbox` provides contact search, conversation switching, text
  messages, emoji insertion, local file/image attachment placeholders, contact
  details, and conversation clearing. Voice and video buttons are explicitly
  disabled until a calling service exists.
- `/admin` retains presentational metrics and adds working recent-order
  pagination and order details.

Except for Customer Operations and User Accounts, admin data is deliberately
page-local mock state and resets on refresh. There is no mock repository,
local-storage persistence, fake latency, or invented API layer. When backend
endpoints arrive, replace each page's local filtering/slicing and mutation
handlers with API calls while retaining its controls, dialogs, validation, and
feedback.

## Seller functionality

The seller backend does not expose seller-domain endpoints yet. Seller routes
therefore use `components/seller/SellerDemoProvider.tsx`, a small in-memory
React provider mounted inside the seller layout. Product, order, and store
changes survive client-side navigation between seller routes but reset on
refresh. There is no seller API client, browser storage, fake latency, or
speculative request/response layer.

- `/seller` derives its metrics, pickup queue, and recent orders from the shared
  demo state. Pickup orders can be marked ready or completed directly from the
  overview.
- `/seller/products` manages surplus bags rather than generic ecommerce
  products. It provides local search/filter/pagination, selection and bulk
  status changes, quantity updates, deletion, and links to record-specific
  create/edit/details routes.
- `/seller/products/add`, `/seller/products/edit`, and
  `/seller/products/details` share the surplus-bag data model. Forms validate
  pricing and pickup windows; created and edited bags immediately appear across
  seller routes. Image inputs retain only the selected filename.
- `/seller/orders` provides local search/filter/pagination, derived status
  counts, and CSV export. Order details enforce the demo transition sequence:
  New -> Confirmed -> Ready for pickup -> Completed, with cancellation available
  before completion.
- `/seller/settings` provides controlled store-profile and pickup-hour forms.
  Save updates the shared demo state, Cancel restores the last saved values, and
  active days require a closing time after their opening time.
- `/seller/inbox` provides customer/order search, local messages, emoji and
  attachment placeholders, contact details, and conversation clearing. Voice
  and video controls remain disabled until a calling service exists.

When seller endpoints arrive, replace provider reads and state setters at each
page boundary with backend queries and mutations, then remove the provider.
Keep the current controls, validation, order transition feedback, dialogs, and
empty/error presentation.

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
npm.cmd run build
```

At this handoff both commands pass. All 29 application routes build, including
the 16 admin/seller routes. The generated dashboard CSS is about 46 KB, down
from two copied 100 KB stylesheets, and dashboard public assets total about
4 KB instead of 1.96 MB across 370 files.

## Safe continuation points

- Replace mock arrays in individual pages with backend results without changing
  the shared shell or page-level interaction patterns.
- Map backend status values to the static `StatusBadge` tones.
- Pass real image URLs through a dedicated image component once the backend
  host and Next image policy are known.
- Keep search/filter state page-specific until three pages share the same real
  backend query contract; the current controls have different domain behavior.
- Connect seller approval, category, support, inbox, and recent-order handlers
  at their existing local mutation boundaries. Do not preserve the disposable
  in-memory transformation code after an endpoint replaces it.
- Browser-level visual regression coverage is not present. Before a design
  overhaul, capture desktop and mobile baselines for the dashboard, tables,
  inbox, product forms, and user dialogs.

## Out of scope

The `(store)` routes still use the crawled Bootstrap/store theme and the
`public/assets` tree. Existing storefront lint warnings and asset cleanup must
be handled as a separate refactor so dashboard Tailwind does not leak into the
storefront.
