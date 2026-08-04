# Storefront implementation handoff

## Maintenance rule

Treat this file as a living handoff for the storefront. Every storefront
change should update the relevant sections in this document in the same work:
routes, components, behavior, API contracts, authentication, styling, assets,
configuration, validation results, known gaps, and continuation points.

## Current state

The `(store)` route group is a Next.js App Router conversion of the Molla
Bootstrap ecommerce template. It is visually separate from the Tailwind-based
admin and seller dashboards.

- Store routes live under `app/(store)`.
- Thin route files render page-level components such as
  `components/product/ProductMain.tsx`.
- `app/(store)/layout.tsx` owns storefront metadata, fonts, legacy stylesheets,
  and legacy JavaScript loading.
- `components/layout/SiteLayout.tsx` wraps every store page with the shared
  header, footer, authentication provider, mobile menu, sign-in modal, and
  global interaction handlers.
- Identity Service integration is implemented for registration, login, access
  token refresh, logout, current-user lookup, profile loading, email
  verification, and OTP resend.
- Catalog, product, cart, wishlist, and checkout content is still static demo
  data. Product-listing filters work against local data, but those screens do
  not yet use commerce backend services.

The storefront currently exposes 13 routes or route patterns:

| Route | Main component | Current data/behavior |
| --- | --- | --- |
| `/` | Home sections under `components/home` | Static demo-28 content with client-side carousel, countdown, and drag scrolling |
| `/about` | `components/about/AboutMain.tsx` | StealDeals purpose, principles, and three-step food-rescue explanation using local assets |
| `/cart` | `components/cart/CartMain.tsx` | Static cart markup; no cart state or API |
| `/checkout` | `components/checkout/CheckoutMain.tsx` | Client-auth protected checkout UI with pickup/delivery, grouped bags, payment selection, and local summary state |
| `/contact` | `components/contact/ContactMain.tsx` | StealDeals support details and frontend-only contact form |
| `/faq` | `components/faq/FaqMain.tsx` | Native accessible FAQ groups for food rescue, pickup/orders, and accounts |
| `/login` | `components/login/LoginMain.tsx` | Identity Service login |
| `/product?bag=` | `components/product/ProductMain.tsx` | Data-driven surprise-bag detail using shared static listing data |
| `/products` | `components/products/ProductListing.tsx` | Searchable/filterable static surprise-bag marketplace listing |
| `/profile` | `components/profile/ProfileMain.tsx` | Protected Identity Service profile and email verification |
| `/register` | `components/login/LoginMain.tsx` | Identity Service registration and OTP prompt |
| `/stores/[storeSlug]` | `components/products/ProductListing.tsx` | Store-scoped listing using the shared product-listing UI |
| `/wishlist` | `components/wishlist/WishlistMain.tsx` | Converted wishlist with static items |

## Storefront structure

The established conversion pattern is:

```text
app/(store)/<route>/page.tsx
  -> components/<feature>/<Feature>Main>.tsx
  -> shared app/(store)/layout.tsx
  -> components/layout/SiteLayout.tsx
```

Page files should remain small unless route-level server data is introduced.
Shared storefront shell components are re-exported through
`components/layout/Header.tsx` and `components/layout/Footer.tsx`; their
implementations currently live in `components/home`.

The original HTML templates are in the sibling `molla` project. Product and
wishlist pages retain converted Molla markup; the former category conversion
has been replaced by the StealDeals product listing. New conversions should
reuse the shared shell instead of copying Molla headers, footers, mobile menus,
modals, or script tags.

## Identity and API integration

### API layer

Store API code lives under `lib/api`:

- `client.ts` is the shared fetch wrapper.
- `auth.ts` contains Identity Service authentication and email-verification
  requests.
- `account.ts` contains account/profile requests.
- `store-types.ts` contains storefront request and response contracts.
- `admin.ts` and `admin-types.ts` are dashboard-specific and should not be
  mixed into storefront code.

`apiRequest`:

- prefixes requests with `NEXT_PUBLIC_API_URL`;
- serializes defined request bodies as JSON;
- always uses `credentials: "include"` so the browser can send the refresh
  token cookie;
- parses JSON, text, and `204 No Content` responses;
- throws `ApiClientError` with HTTP status and response details;
- retries one authorized request after a `401` when access-token refresh
  succeeds; and
- deduplicates concurrent refresh attempts with one in-flight promise.

`NEXT_PUBLIC_API_URL` is required. The client currently does not fail fast with
a clear configuration error when it is missing.

### Identity endpoints

| Frontend function | Endpoint | Purpose |
| --- | --- | --- |
| `login` | `POST /api/auth/login` | Returns an access token; refresh token is set by the backend cookie |
| `register` | `POST /api/auth/register` | Creates an account without logging it in |
| `refreshAccessToken` | `POST /api/auth/refresh` | Uses the refresh cookie and returns a new access token |
| `logout` | `POST /api/auth/logout` | Revokes/clears the refresh session on the backend |
| `getCurrentUser` | `GET /api/auth/me` | Loads header identity data using a Bearer access token |
| `verifyEmail` | `POST /api/auth/verify-email` | Verifies a six-digit OTP |
| `resendVerificationOtp` | `POST /api/auth/resend-otp` | Requests a replacement OTP |
| `getProfile` | `GET /api/account/profile` | Loads profile, roles, addresses, and trust score |

The frontend contracts expect:

- login/refresh: `AccessTokenResponse`;
- registration: `RegistrationResponse` with `message` and
  `requiresEmailVerification`;
- current user: ID, email, display name, and roles; and
- profile: personal details, email status, account status, addresses, roles,
  and optional trust score.

Keep these contracts synchronized with the Identity Service DTOs. Do not return
or expose refresh tokens through frontend JavaScript.

### Token and session model

The implemented token model follows the agreed security requirement:

- The access token is stored only in React state inside `AuthProvider`.
- No access token is stored in `localStorage`, `sessionStorage`, or a
  JavaScript-readable cookie.
- The refresh token is expected to be an `HttpOnly` backend cookie.
- A full page refresh clears the in-memory access token, then
  `AuthProvider` calls `/api/auth/refresh` and `/api/auth/me` to restore the
  session.
- Authorized API requests include `Authorization: Bearer <access token>`.
- A `401` from an authorized request triggers one refresh-and-retry attempt.
- Logout calls the backend and clears access-token/current-user state even if
  the logout request fails.

An unauthenticated `/api/auth/refresh` response during application startup is
expected and leaves the visitor logged out.

`AuthProvider` is mounted once around the complete store shell. Do not add
another provider inside individual pages.

### Route protection

`components/auth/RequireAuth.tsx` protects `/checkout` and `/profile`.

It waits for the initial refresh attempt, renders nothing while authentication
is being resolved, and redirects unauthenticated visitors to `/login`. This is
client-side protection only; sensitive backend endpoints must still enforce
authorization independently.

### Login and registration

`/login` and `/register` share `LoginMain` with different initial tabs.
`LoginTabHashHandler` keeps tab switching on clean routes rather than legacy
hash URLs:

- Sign In uses `/login`.
- Register uses `/register`.

Successful login stores the access token in memory, loads `/api/auth/me`, and
navigates to `/`. The header then displays `Welcome, <name>` with Profile and
Logout actions.

Registration sends first name, last name, email, password, and optional phone.
It does not authenticate the new account. When email verification is required,
the page opens an OTP modal. Successful verification and Enter later both
navigate to `/login`.

The registration email field in the OTP modal is read-only. Invalid or expired
OTP responses remain in the modal and display a user-facing error.

### OTP implementation

`components/auth/OtpInput.tsx` provides six independent digit boxes with:

- numeric-only input;
- replacement of a selected digit;
- forward focus after entry;
- backward navigation from an empty cell;
- arrow-key navigation; and
- multi-digit paste support.

`ResendOtpButton` provides a 30-second client cooldown. Cooldown state is kept
in a module-level map keyed by email so closing and reopening the profile modal
does not immediately enable another resend. It resets after a full browser
reload, so backend rate limiting remains mandatory.

The registration modal starts with a 30-second cooldown because registration
already caused an OTP to be sent. The profile modal permits the first resend
immediately, then applies the cooldown.

### Profile

The profile page loads real data from `/api/account/profile`. It displays:

- account active/inactive status;
- full name, email, phone, and member date;
- email-verification status;
- roles;
- saved addresses; and
- trust score when available.

The Verify link opens the email modal through `/profile?verify=email` without
scrolling the page. Successful verification reloads the profile and removes
the query parameter. Enter later closes the modal without scrolling.

The phone `Add` link points to `/profile?edit=phone`, but phone editing is not
implemented yet.

## Store pages and interactions

### Home

The home page uses retained Molla imagery and carousel runtime, but its visible
content has been adapted to the StealDeals buyer experience. It currently
renders:

- two-slide StealDeals hero carousel;
- StealDeals rescue campaign banners;
- StealDeals benefit/value blocks;
- food category section;
- near-expiry surprise bags;
- nearby surprise bags with store and distance information;
- trending surprise bags;
- new-store promotions;
- food rescue and sustainability news.

`IntroSection` initializes Owl Carousel after jQuery and the plugin become
available. `DragScrollRow` implements pointer-driven looping rows. The
near-expiry section uses typed static FE data through `SurpriseBagCard`; it
shows five bags in a five-column desktop draggable row with sale price,
original price, discount, pickup window, distance, and remaining quantity. Its
product, cart, wishlist, and listing links are scaffolding until commerce APIs
are connected.

The former template flash-sale countdown and static flash-product markup were
removed. The near-expiry section does not use a client-only countdown because
actual pickup/expiry times must eventually come from Store Service data.

`NearbySection` is FE-only static scaffolding for nearby surprise bags. It uses
the same draggable five-card desktop row and adds store names, distances, and
future store links. It does not request browser location or call Store Service
yet.

`TrendingSection` is FE-only static scaffolding for popular surprise bags. It
uses the same draggable five-card desktop row and marks each card as popular
this week. Popularity is not calculated yet, and listing sort values are static
scaffolding until real catalog data exists.

`NewStoresSection` is FE-only static scaffolding for newly registered store
promotions. It uses reusable `NewStoreCard` components with store category,
description, location, pickup information, and future store links. The store
cards currently use retained demo food imagery until Store Service media is
available.

`StealDealsNewsletterSection` and `StealDealsBannerGroupTwo` remain in source but
are commented out on Home because those banners are not currently needed.
Sustainability section headings and article cards use larger type for readability.

The rendered Home route no longer includes the duplicate template brand-logo,
recommendation, generic service, or generic blog sections. Their legacy source
files were moved to `remove-later` for manual cleanup.
The retained `StealDealsNewsletterSection` source is an account CTA rather than a
newsletter submission because no notification subscription endpoint exists.

Surprise-bag action labels (`View Details`, `Add to Cart`, and `Add to
wishlist`) use `1.5rem` text for stronger visibility.

The newsletter popup remains in source but is commented out. The promo strip,
currency selector, language selector, Compare item, demo chooser, Blog
navigation, and Elements navigation are retained as commented template code.

Files in the root `remove-later` folder are archived legacy components, not an
active component library. If one becomes necessary again, move it into the
corresponding active page/component directory and update its imports before
rendering it. The folder is excluded from `tsconfig.json` so archived files do
not affect application type-checking.

### Product listings

`/products` is the marketplace-wide surprise-bag listing. It renders 12 static
food bags using the same `SurpriseBagCard` used by Home and food imagery from
`public/assets/images/demos/demo-28/flash`. Search, category, pickup day, price,
distance, and sorting controls work against client-side demo data. Size, colour,
brand, compare, thumbnails, fake layout controls, and presentation-only
pagination were removed.

`/stores/[storeSlug]` renders the same listing scoped to one known store. It
keeps search, category, pickup, price, and sorting controls while omitting the
marketplace distance filter. Unknown static store slugs return `404`.

Product and store links now use `/products`, `/stores/[storeSlug]`, and
`/product?bag=`. The old `/category` route was removed because `/products` is
now the single marketplace listing route. Filters are not
written back to the URL and no catalog API is connected yet.

### Product, cart, wishlist, and checkout

The Product Detail page reads the `bag` query parameter and uses the shared
`components/products/product-listing-data.ts` records for every listing item.
It renders StealDeals-specific pricing, store, pickup, availability, and
related-bag information. Missing or unknown bag slugs return `404`. Add to Cart
passes the bag slug and selected quantity to Cart.

The Product Detail image gallery uses storefront-owned markup and avoids the
legacy Molla ElevateZoom selectors, so hovering the image does not inject the
old zoom container or thumbnail UI. It displays up to three existing product
gallery assets as vertical thumbnails, and selecting a thumbnail updates the
main image. The detail summary now shows backend-aligned pickup timestamps,
expiry time, status, category, and `quantity remaining of quantity total`
availability. Its quantity control uses the same minus/value/plus stepper
pattern as the Cart page. Summary field labels use a slightly larger type size
to improve scanning, and category links inherit the normal summary value size.
The previous pickup-day/discount footer row was removed. Product reviews now
show static FE review data until the Store Service review endpoint is connected.
The related-bag section uses the saved Product Detail design: four full
`SurpriseBagCard` cards, same-category items first, and a link to more bags in
the current category.

The Cart page now groups frontend cart lines by store and supports custom
quantity stepper updates, quantity limits based on available bags, item removal,
subtotal calculation, and a pickup-oriented checkout summary. Its initial data
is still static; a real cart API or persisted cart state is not connected yet.
Cart category labels link back to the filtered `/products?category=` listing,
while bag names and images link to `/product?bag=`.

The header cart dropdown now uses the same surprise-bag data as the Cart page,
including the shared bag names, images, item count, and VND total instead of
the legacy clothing demo items.

The Cart breadcrumb uses the shared compact storefront height instead of adding
a second layer of vertical padding.

These screens still retain static storefront data and do not call commerce APIs:

- Wishlist actions are not connected to an account or backend.
- Checkout is authentication-gated and now uses Order/Payment-aligned FE fields,
  but does not yet create an order or process payment.

The previous Molla checkout template is archived at
`remove-later/CheckoutMain.tsx`.

Treat their current markup as UI scaffolding. Replace static arrays and submit
handlers at page/component boundaries when commerce endpoints are available.

### Informational pages

The active informational pages use storefront-owned components and content
instead of the original generic Molla copy:

- `/faq` uses native `details` accordions grouped around rescuing food,
  pickup/orders, and payments/accounts. Its contact CTA links to `/contact`.
- `/about` explains the StealDeals purpose, operating principles, and the
  three-step flow from finding a bag to local pickup. It uses food-related
  imagery from the demo-28 food assets and links to the marketplace and Contact
  page.
- `/contact` provides StealDeals support hours, contact details, pickup guidance,
  food-related hero imagery, and a responsive controlled form. The form
  currently shows a frontend-only success state and does not send data to an
  API.

The old legacy `ProductMain.tsx`, `FaqMain.tsx`, `AboutMain.tsx`, and
`ContactMain.tsx` files are archived in the root `remove-later` folder. The
active page components use the project convention with `*Main.tsx` names.

## Styling and legacy runtime

The store does not use the dashboard Tailwind foundation. It loads the original
Bootstrap/Molla stack in `app/(store)/layout.tsx`:

- Bootstrap;
- Molla base styles;
- demo-28 skin and demo styles;
- Owl Carousel;
- Magnific Popup;
- line-awesome/icon fonts;
- jQuery;
- Bootstrap bundle;
- HoverIntent, Waypoints, Superfish;
- Owl Carousel, Magnific Popup, input spinner, ElevateZoom; and
- Molla `main.js`.

Store-specific fixes and additions live in `app/(store)/globals.css`, including:

- home/inner header spacing;
- informational-page hero, FAQ, About, and Contact layouts;
- drag-scroll product rows;
- authenticated account dropdown alignment and hover colors;
- profile action styling;
- OTP boxes and verification footer layout; and
- product-listing search, card grid, filters, ranges, and responsive rules.

`InteractiveHandlers` handles search toggling, mobile-menu opening/closing, and
the scroll-to-top button using DOM event listeners. When replacing legacy
widgets with React, remove the corresponding jQuery/DOM handler rather than
letting both systems own the same interaction.

## Navigation

The shared header currently provides:

- Home;
- Surprise Bags, linking to `/products`;
- Shop, linking to the current demo store at `/stores/morning-oven-bakery`;
- About Us, linking to `/about`;
- Contact Us, linking to `/contact`;
- search, wishlist, and cart presentation;
- Inline `Register | Login` links for visitors, using the same bold, slightly
  larger style and right-aligned account area as the authenticated Welcome
  link; and
- Clickable `Welcome, <name>` profile link followed by `| Logout` for
  authenticated users; the full account row is bold and slightly larger, and
  both interactive items use pointer cursors.

The utility bar now shows `Steal Deals E-commerce Website` on the far left
using the same bold, slightly larger uppercase styling as the Welcome text.
The template phone-number entry is commented out.
The storefront overrides the template account-menu minimum width so the
`Register | Login` and authenticated account rows do not retain empty space.

The storefront brand is `Steal Deals` across the shared logo, footer, metadata,
and newsletter copy.

The top-level storefront navigation currently has no rendered submenus:

- Home links directly to `/`.
- Surprise Bags links directly to `/products`.
- Shop links directly to the current demo store at `/stores/morning-oven-bakery`.
- About Us and Contact Us are direct navigation links instead of utility-bar links.
- Pages is commented out until its navigation destinations are finalized.
- The same structure is used by the mobile menu.

Several dropdown and footer links still reference original `.html` pages or
use `href="#"`. Replace or remove these as routes are converted. Avoid hash
links for commands because they can scroll the page unexpectedly.

`components/home/SigninModal.tsx` is still mounted globally but contains an
unconnected legacy login/register form. The functional authentication entry
point is `/login`; either remove the legacy modal or connect it deliberately
before exposing a trigger.

## Assets

The active storefront still uses `public/assets`. Current notable state:

- `public` contains 629 files and approximately 22.5 MB.
- `public/assets/images/demos/demo-28` contains the active home assets.
- `public/assets/images/demos/demo-26/logo-footer.png` was retained, although
  the image-based footer logo is currently commented in favor of text.
- `public/assets/images/menu/demos` was retained because the commented demo
  chooser still references those screenshots.
- Nineteen category-only fashion images (approximately 115 KB) were removed
  after their source references were replaced. The remaining product-detail,
  cart, wishlist, and header fashion assets stay until those screens are adapted.
- Unused Molla demo folders, landing-page assets, and default Next SVGs are
  currently removed from the working tree and appear as Git deletions.
- `public/removedAssets` does not currently exist. Removed assets remain
  recoverable from Git history.
- `.codex-runtime/` is ignored and is only for local logs, browser profiles,
  and screenshots.

Review the large asset deletion set before committing it. Do not restore
unrelated demo trees unless a future converted page actually requires them.

## Environment and local development

The browser API URL is configured through:

```env
NEXT_PUBLIC_API_URL=http://localhost:5158
```

The current ignored `.env.local` uses the HTTP Identity Service endpoint above.
`.env.example` still shows `https://localhost:7282`, so it should be updated or
documented when the team chooses one canonical local setup.

Cookie/session restoration requires:

- frontend and backend origins allowed by backend CORS;
- credentials enabled in CORS;
- `credentials: "include"` on frontend requests;
- compatible cookie `Domain`, `Path`, `SameSite`, and `Secure` settings; and
- matching local HTTP/HTTPS choices.

The team previously used frontend `http://localhost:3000` with backend
`http://localhost:5158` to make the localhost refresh-cookie flow work. In
production, prefer HTTPS and same-site deployment through related domains or a
reverse proxy.

## Validation

Current store-scoped checks:

```powershell
npx.cmd tsc --noEmit --incremental false
node --experimental-strip-types --test components/products/product-listing-data.test.mjs
npx.cmd eslint "app/(store)" components/about components/auth components/cart components/checkout components/contact components/faq components/home components/layout components/login components/product components/products components/profile components/wishlist lib/api
npm.cmd run build
```

At this handoff:

- TypeScript passes.
- The product-listing filter/sort test passes both checks.
- Store-scoped ESLint has 0 errors and 75 warnings.
- Most warnings are `@next/next/no-img-element` from retained template images.
- The production build passes and includes dynamic `/products` and
  `/stores/[storeSlug]` routes.
- Local HTTP checks return `200` for `/products`, category-filtered products,
  a known store, and all 12 listing images; unknown stores return `404`.
- The new listings were not visually checked through an automated browser in
  this environment; review desktop and mobile presentation before merging.

## Known gaps and risks

- Commerce screens are mock/static and should not be described as backend
  integrated.
- Listing filters use local client state and are not persisted in the URL or
  sent to a catalog service.
- Forgot password is not implemented.
- Remember Me has no behavior under the current memory-only access-token model.
- Google/Facebook login is commented out.
- Profile editing, including Add phone, is not implemented.
- Client resend cooldowns do not replace backend OTP throttling.
- `RequireAuth` is client-only and briefly renders nothing during session
  restoration.
- The API base URL is not validated before requests.
- Legacy jQuery scripts are globally loaded for all store pages and increase
  bundle/runtime cost.
- Many internal links still target `.html` template files or `#`.
- The globally mounted legacy sign-in modal is not connected to Identity.
- Store images use `<img>` instead of `next/image`, producing lint warnings.
- Product-listing data has one focused Node test; broader integration and
  browser coverage does not exist yet.
- Access-token refresh and cookie behavior depend on correct backend CORS and
  cookie configuration.

## Safe continuation points

1. Visually review `/products` and `/stores/morning-oven-bakery` at desktop and
   mobile breakpoints, then refine card density and filter placement if needed.
2. Update `.env.example` to match the agreed local Identity Service protocol
   and port.
3. Remove or connect `SigninModal`; keep `/login` as the single functional
   authentication path.
4. Implement forgot-password and profile-edit flows using Identity/Account
   endpoints.
5. Add catalog API modules under `lib/api`, replace static product-listing data,
   and move filtering/pagination to request parameters without putting fetch
   logic into visual components.
6. Add cart and wishlist state only after their ownership is decided
   (backend-backed account data versus temporary guest state).
7. Connect checkout to real cart/order/payment contracts while retaining both
   frontend route protection and backend authorization.
8. Replace obsolete `.html`/hash links as each destination becomes available.
9. Incrementally replace legacy jQuery widgets with React-owned components,
   then remove unused scripts and styles.
10. Add browser tests for registration/OTP, login/session restoration,
    refresh-and-retry, logout, protected-route redirects, profile verification,
    and responsive product/store listings.

## Working-tree note

At the time of this handoff, the storefront work is not a clean committed
baseline. It includes the product and store listings, shared navigation and CSS
changes, API-client changes, and removed legacy assets. Future work should
inspect `git status` and preserve unrelated changes rather than resetting the
tree.

## Out of scope

The `(admin)` and `(seller)` route groups use their own architecture and
Tailwind stylesheet. Read `docs/dashboard-refactor-handoff.md` before changing
those routes. Do not import storefront Bootstrap/Molla styles into dashboards,
and do not import dashboard Tailwind styling into the storefront.
