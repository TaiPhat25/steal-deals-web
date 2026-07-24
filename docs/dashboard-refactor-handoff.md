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
- Page files are Server Components unless they use state or navigation hooks.
  Only the two inbox pages and the API-backed admin users component currently
  require client boundaries.

## Styling conventions

- Prefer a named component when the same visual structure occurs on at least
  three screens. Keep one-off layout in visible Tailwind utilities.
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
npx.cmd eslint "app/(admin)" "app/(seller)" components/admin components/dashboard
npm.cmd run build
```

At this handoff both commands pass. All 29 application routes build, including
the 16 admin/seller routes. The generated dashboard CSS is about 46 KB, down
from two copied 100 KB stylesheets, and dashboard public assets total about
4 KB instead of 1.96 MB across 370 files.

## Safe continuation points

- Replace mock arrays in individual pages with backend results without changing
  the shared shell.
- Map backend status values to the static `StatusBadge` tones.
- Pass real image URLs through a dedicated image component once the backend
  host and Next image policy are known.
- Add a shared search/filter component only when the current repeated controls
  become functional; do not abstract inactive mock controls preemptively.
- Browser-level visual regression coverage is not present. Before a design
  overhaul, capture desktop and mobile baselines for the dashboard, tables,
  inbox, product forms, and user dialogs.

## Out of scope

The `(store)` routes still use the crawled Bootstrap/store theme and the
`public/assets` tree. Existing storefront lint warnings and asset cleanup must
be handled as a separate refactor so dashboard Tailwind does not leak into the
storefront.
