# Storefront implementation handoff

## Maintenance rule

Treat this file as a living handoff for the storefront. Every storefront
change should update the relevant sections in this document in the same work:
routes, components, behavior, API contracts, authentication, styling, assets,
configuration, validation results, known gaps, and continuation points.

For a cross-project summary and the complete customer-to-seller demo plan, see
[`project-progress-summary.md`](./project-progress-summary.md).

The local frontend environment uses HTTP service URLs: Identity `5158`, Store
`5169`, and Order `5165`. Payment port `5155` is optional until online payment
integration is started.

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
  header, footer, authentication provider, mobile menu, and global interaction
  handlers.
- Identity Service integration is implemented for registration, login, access
  token refresh, logout, current-user lookup, profile loading, email
  verification, OTP resend, password-reset OTP requests, and password reset.
- Customer/Seller login remains at `/login` and uses `/api/auth/login`.
  Admin login is intentionally separate at `/admin/login` and belongs to the
  dashboard auth flow; it uses `/api/admin-auth/login` and does not change the
  storefront login contract. The shared `RequireAuth` component now accepts a
  custom login path so admin routes can redirect to `/admin/login`.
- A successful storefront login now sends accounts with the `Seller` role to
  `/seller`; customer-only accounts continue to go to `/`.
- The `/products` catalog now loads active bags from the Store Service and runs
  its existing client-side filters and sorting against the API response.
- Home category, surprise-bag, new-store, campaign, and sustainability content
  images use `next/image` with stable dimensions and responsive `sizes`. API
  image URLs outside the configured optimizer allowlist fall back to direct
  loading instead of causing an unconfigured-host runtime error.
- Product detail now loads the selected bag from the Store Service. The legacy
  `/cart` and `/checkout` routes use the in-memory cart, while the current
  product/header actions point to the parallel Redis-backed `/newcart` and
  `/newcheckout` routes. Order history and shipping currently use static demo
  data.
- The `Become a Seller` profile form now collects required latitude and
  longitude values and validates them against the Store Service coordinate
  ranges (`-90..90` and `-180..180`). It submits authenticated applications to
  `POST /api/stores`, which creates an unverified store for admin approval.
  Profile edit modals are constrained to the viewport with an internal scroll
  area for longer forms.
- The shared storefront header and mobile navigation derive their active item
  from the current pathname. Product and store detail routes keep their parent
  item highlighted, and active navigation uses the storefront green theme
  color.
- Product-detail and shared surprise-bag store links prefer the backend
  `storeId` when building `/stores/[id]` URLs; presentation slugs remain only
  as a fallback for legacy static data.

The storefront currently exposes 19 routes or route patterns:

| Route | Main component | Current data/behavior |
| --- | --- | --- |
| `/` | Home sections under `components/home` | Store Service-backed categories, bags, and stores with shared loading/error/empty states, retry, a React carousel, and drag scrolling |
| `/about` | `components/about/AboutMain.tsx` | StealDeals purpose, principles, and three-step food-rescue explanation using local assets |
| `/cart` | `components/cart/CartMain.tsx` | Legacy client-side cart UI; authenticated mutations are mirrored to Cart Service, but initial state is not restored from Redis |
| `/checkout` | `components/checkout/CheckoutMain.tsx` | Legacy protected checkout consuming the in-memory cart and creating Order Service records |
| `/contact` | `components/contact/ContactMain.tsx` | StealDeals support details and frontend-only contact form |
| `/faq` | `components/faq/FaqMain.tsx` | Native accessible FAQ groups for food rescue, pickup/orders, and accounts |
| `/forgot-password` | `components/login/ForgotPasswordMain.tsx` | Identity Service reset-code request, resend cooldown, password reset, validation, and success flow |
| `/login` | `components/login/LoginMain.tsx` | Identity Service login |
| `/newcart` | `components/cart/NewCartMain.tsx` | Protected Cart Service/Redis cart with loading, error, quantity, removal, grouping, and totals |
| `/newcheckout` | `components/checkout/NewCheckoutMain.tsx` | Protected Redis-cart checkout using profile and Order Service APIs; payment and voucher handling remain local UI state |
| `/orders` | `components/orders/OrderHistoryMain.tsx` | Authenticated static order history with search and status filters |
| `/product?bag=` | `components/product/ProductMain.tsx` | Data-driven surprise-bag detail using Store Service data with static presentation fallbacks |
| `/products` | `components/products/ProductListing.tsx` | Searchable/filterable Store Service-backed surprise-bag marketplace listing; cards use the API `imageUrl` with the original StealDeals surprise-bag placeholder as fallback |
| `/profile` | `components/profile/ProfileMain.tsx` | Protected Identity Service profile and email verification |
| `/register` | `components/login/LoginMain.tsx` | Identity Service registration and OTP prompt |
| `/stores` | `components/stores/StoreListing.tsx` | Searchable, filterable Store Service-backed store directory with pagination and API avatar/fallback imagery |
| `/stores/[id]` | `components/stores/StoreInfo.tsx`, `StoreProducts.tsx`, `StoreReviews.tsx` | Store Service-backed profile, active surprise bags, reviews, and API avatar/fallback imagery |
| `/shipping` | `components/shipping/ShippingMain.tsx` | Authenticated order progress, pickup/delivery details, and order summary |
| `/wishlist` | `components/wishlist/WishlistMain.tsx` | Temporarily disabled; previous static template retained in comments |

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
- `auth.ts` contains Identity Service authentication, email-verification, and
  password-reset requests.
- `account.ts` contains account/profile requests.
- `store.ts` contains public catalog/store reads and seller/admin store
  management requests. Customer catalog reads include `listBags()` and
  `getBag(id)`.
- `order.ts` contains authenticated order requests. Customer order reads now
  include `listMyOrders(accessToken)` and `getOrder(accessToken, id)` in
  addition to order creation and seller order management.
- `cart.ts` contains authenticated Cart Service requests for Redis-backed cart
  reads, additions, quantity updates, removals, and clearing.
- `store-types.ts` contains storefront request and response contracts.
- `admin.ts` and `admin-types.ts` are dashboard-specific and should not be
  mixed into storefront code.

`apiRequest`:

- uses `NEXT_PUBLIC_API_URL` for Identity/Account requests and accepts an
  explicit service base URL for Store, Order, and Cart requests;
- serializes defined request bodies as JSON;
- always uses `credentials: "include"` so the browser can send the refresh
  token cookie;
- parses JSON, text, and `204 No Content` responses;
- throws `ApiClientError` with HTTP status and response details;
- retries one authorized request after a `401` when access-token refresh
  succeeds; and
- deduplicates concurrent refresh attempts with one in-flight promise.

`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_STORE_API_URL`, and
`NEXT_PUBLIC_ORDER_API_URL` are required by the current flows.
`NEXT_PUBLIC_CART_API_URL` is additionally required for `/newcart` and
`/newcheckout`. Store, Order, and Cart clients throw a clear configuration
error when their URL is missing; the default Identity URL does not yet fail
fast before constructing the request.

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
| `requestPasswordReset` | `POST /api/auth/forgot-password` | Requests a password-reset OTP without disclosing whether the account exists |
| `resetPassword` | `POST /api/auth/reset-password` | Verifies the reset OTP and changes the password |
| `getProfile` | `GET /api/account/profile` | Loads profile, roles, addresses, and trust score |

### Commerce API methods

The Store Service catalog client exposes `listBags()` and `getBag(id)`. The
product listing uses `listBags()` and filters out bags whose backend status is
not `Active`. Backend pickup timestamps are formatted for the card UI and
`SurpriseBagResponse.imageUrl` is used when present, with the shared local bag
asset as its fallback.

The Order Service client exposes `createOrder`, `getOrder`, `listMyOrders`, and
seller order methods. Checkout now calls `createOrder` once per store in the
cart and shows the returned order IDs after all requests succeed.

The Cart Service client exposes `listCarts`, `getCart`, `addCartItem`,
`updateCartItemQuantity`, `removeCartItem`, `clearStoreCart`, and
`clearAllCarts`. `CartProvider` keeps the legacy in-memory cart usable while
mirroring authenticated mutations to Cart Service. `/newcart` reads the Redis
cart directly, so the duplicate cart implementations and route names still
need consolidation.

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

`components/auth/RequireAuth.tsx` protects `/checkout`, `/newcart`,
`/newcheckout`, `/orders`, `/profile`, and `/shipping`.

It waits for the initial refresh attempt, renders nothing while authentication
is being resolved, and redirects unauthenticated visitors to `/login`. This is
client-side protection only; sensitive backend endpoints must still enforce
authorization independently.

### Login and registration

`/login` and `/register` share `LoginMain` with different initial tabs. The
form tabs use local React state and debounce clean-route synchronization through
the native History API. Switching forms does not trigger an App Router request,
avoiding the legacy Bootstrap tab handler and rapid navigation request buildup:

- Sign In uses `/login`.
- Register uses `/register`.

Auth component ownership is split by responsibility:

- `components/login/LoginMain.tsx` coordinates tabs, clean-route synchronization,
  header-driven tab changes, and verification-dialog visibility.
- `SignInForm.tsx` and `RegisterForm.tsx` own their respective field state,
  validation, and API submission.
- `EmailVerificationDialog.tsx` owns OTP verification and modal keyboard behavior.
- `PrivacyPolicyDialog.tsx` presents the registration policy in a scrollable
  modal, while `use-dialog-focus-trap.ts` provides shared dialog focus and
  Escape-key behavior.
- `PasswordField.tsx` provides the shared password/visibility control.
- `auth-form-utils.ts` contains shared normalization-adjacent validation, request
  error mapping, and invalid-field focus behavior.

The header Register/Sign In controls dispatch the same local tab change while an
authentication page is mounted, without attaching a Next.js navigation handler.
From other storefront pages, they retain normal Next.js client navigation.

The auth section reserves enough height for the registration form at mobile
widths, avoiding a background resize and repaint on every form switch.
Rapid tab requests are coalesced to one state update per animation frame. The
desktop background is anchored to the viewport so inline validation messages
can increase the form height without rescaling the image; mobile retains fixed
image dimensions with normal scrolling.

Both routes use direct breadcrumbs from `Home` to the current authentication
page; the old template `Pages` placeholder has been removed.

Successful login stores the access token in memory and loads `/api/auth/me`.
Customer-only accounts navigate to `/`, while accounts with the `Seller` role
navigate to `/seller`. The storefront header displays `Welcome, <name>` with
Profile and Logout actions.

The sign-in form does not ask the visitor to select a role. Customer and Seller
accounts both use `POST /api/auth/login`; the backend determines access from
the roles assigned to the account. Admin and SuperAdmin accounts use the
separate `/admin/login` flow instead.

Registration sends first name, last name, email, password, and required phone.
It does not authenticate the new account. When email verification is required,
the page opens an OTP modal. Successful verification and Enter later both
navigate to `/login`.

The storefront auth forms validate required values, email syntax, phone format,
password length, confirmation, and privacy-policy acceptance before sending a
request. Names, email, and phone are trimmed at submission, and email is
lowercased. Input errors render beside their fields; API handling distinguishes
invalid credentials (`401`), duplicate email (`409`), connection failures, and
server failures.

Remember Me was removed because the storefront does not support persistent
sign-in. The registration Privacy Policy control opens an accessible,
scrollable dialog that traps focus, closes with Escape or its OK action, and
returns focus to the link after closing.

Sign In and Register use compact page headings inside the shared form surface,
stronger label/field spacing, and full-width outline actions matching the Home
page's View Details button. The Privacy Policy OK action uses the same visual
treatment. Secondary controls are arranged separately from the submit action
and collapse into a single-column order on small screens.

The auth tabs implement the ARIA tabs pattern with one tab stop and automatic
activation for Left Arrow, Right Arrow, Home, and End. Header-driven form
changes move focus to the selected panel heading, and failed submissions move
focus to the first invalid field. Template IDs and the misspelled sign-in field
IDs have been replaced with clean tab, panel, label, and input relationships.

Storefront password fields include visibility controls. Registration mirrors
the Identity Service minimum of 8 characters and requires a matching confirmation
password before submitting; the confirmation value is not sent to the API.

The registration email field in the OTP modal is read-only. Invalid or expired
OTP responses remain in the modal and display a user-facing error.

`/forgot-password` implements the complete frontend reset flow in one page:
request a six-digit code, enforce a 60-second resend cooldown, validate the OTP
and matching new-password fields, submit the reset, and show a success state.
The page normalizes email addresses, moves focus between stages, reuses
`OtpInput` and `PasswordField`, and preserves the backend's non-enumerating
forgot-password response. The Identity Service must provide both reset
endpoints and its email delivery path for the flow to complete end to end.

### OTP implementation

`components/auth/OtpInput.tsx` provides six independent digit boxes with:

- numeric-only input;
- replacement of a selected digit;
- forward focus after entry;
- backward navigation from an empty cell;
- Left Arrow, Right Arrow, Home, and End focus navigation; and
- multi-digit paste support.

The registration verification dialog focuses the first OTP digit when opened,
traps Tab and Shift+Tab within the dialog, restores prior focus when closed,
prevents background scrolling, and supports Escape while verification is not
in flight.

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

The phone `Edit` link opens a local profile modal at `/profile?edit=phone`.
The address section provides an `Add address` modal at `/profile?edit=address`.
Both modals update the profile view immediately; permanent account/address
persistence still requires an Account Service update endpoint.

Buyers without the `Seller` role also see a `Become a Seller` link in the
Roles section. It opens an application modal at `/profile?seller=apply` with
store name, description, address, contact phone, latitude, longitude, bank
account, and license URL fields. Submission calls authenticated
`POST /api/stores`, creates an unverified store application, and shows its
pending-admin-approval state. The profile does not yet refresh the user's roles
after the later verification event promotes the account to Seller.

## Store pages and interactions

### Home

The Home page uses StealDeals-owned imagery and React interactions throughout.
It currently renders, in order:

- two-slide StealDeals hero carousel;
- food category section;
- near-expiry surprise bags;
- StealDeals rescue campaign banners;
- nearby surprise bags with store and distance information;
- trending surprise bags;
- Discover New Stores;
- StealDeals benefit/value blocks;
- food rescue and sustainability news.

Category cards use the Store Service `iconUrl` when present and the original
`/assets/images/brand/category-placeholder.webp` asset when it is missing.

`HomeDataProvider` owns the page-scoped Store Service reads. It requests bags,
categories, and stores once, preserves successful responses when another
resource fails, and shares the results with the category, Near Expiry, Near
You, Trending, and New Stores sections. It exposes independent resource status
and a shared retry action. Those sections now render stable loading skeletons,
explicit empty messages, and retryable error states instead of silently showing
demo records when Store Service data is unavailable.

`IntroSection` owns a two-slide React pointer carousel and no longer depends on
Owl Carousel. `DragScrollRow` implements pointer-driven looping rows. The
near-expiry section maps active Store Service bags through `SurpriseBagCard`
and shows five bags in a five-column desktop draggable row with sale price,
original price, discount, pickup window, distance, and remaining quantity.
Product, store, category, Cart Service mirroring, and cart navigation are
connected; wishlist controls remain intentionally disabled.

The former template flash-sale countdown and static flash-product markup were
removed. The near-expiry section does not use a client-only countdown because
actual pickup/expiry times must eventually come from Store Service data.

`NearbySection` uses the shared Store Service bag response and sorts mapped
cards by the frontend distance value. It does not request browser location;
unknown API bags currently map to `0` distance, so genuinely user-relative
distance still needs a product/backend decision.

`TrendingSection` uses the shared Store Service bag response and sorts by the
frontend popularity value, then discount. API bags without matching local
presentation metadata have popularity `0`, so a real popularity signal is
still not available.

`NewStoresSection` maps shared Store Service store and bag responses, sorts by
creation time, and links each reusable `NewStoreCard` to `/stores/[id]`. The
cards use `avatarUrl` when present and the StealDeals-owned
`/assets/images/home/store-fallback.webp` storefront image otherwise.

`StealDealsNewsletterSection` and `StealDealsBannerGroupTwo` remain in source but
are commented out on Home because those banners are not currently needed. Their
background references now use Home-owned assets rather than demo-28 images.
The sustainability cards use four dedicated food-rescue, local-business,
community-action, and pickup photographs with descriptive alternative text.

The rendered Home route no longer includes the duplicate template brand-logo,
recommendation, generic service, or generic blog sections. Their legacy source
files were moved to `remove-later` for manual cleanup.
The retained `StealDealsNewsletterSection` source is an account CTA rather than a
newsletter submission because no notification subscription endpoint exists.

Surprise-bag action labels (`View Details` and `Add to Cart`) use `1.5rem` text
for stronger visibility.

The newsletter popup remains in source but is commented out. The promo strip,
currency selector, language selector, Compare item, demo chooser, Blog
navigation, and Elements navigation are retained as commented template code.

Files in the root `remove-later` folder are archived legacy components, not an
active component library. If one becomes necessary again, move it into the
corresponding active page/component directory and update its imports before
rendering it. The folder is excluded from `tsconfig.json` so archived files do
not affect application type-checking.

### Product listings

`/products` is the marketplace-wide surprise-bag listing. It renders active
Store Service bags using the same `SurpriseBagCard` used by Home and local food
imagery from `public/assets/images/demos/demo-28/flash` when the API does not
provide media. Search, category, price, distance, and sorting controls work
against the Store Service response. Price and
Distance now use min/max numeric fields with functional storefront-owned
minus/plus steppers and an Apply button instead of sliders; both ranges default
to 0 with no upper limit, and blank bounds mean no lower or upper limit. The sidebar no longer
shows the pickup-day radio filter; pickup timing remains available through the
`Sort by` dropdown's `Pickup Soonest` option. Size, colour, brand, compare,
thumbnails, fake layout controls, and presentation-only
pagination were removed.

`/stores` renders the Store Service-backed store directory with a half-width
desktop search field, old/new store filters, and rating, bag-count, or name
sorting. Store cards use a four-column desktop grid, use the shared
`/assets/images/demos/demo-28/banners/store.jpg` listing image, and link to
`/stores/[id]`. Client-side pagination is implemented at 20 stores per page.
The listing loads store profiles and available bags from `GET /api/stores` and
`GET /api/bags`.

`/stores/[id]` renders the Store Service-backed profile, active surprise bags,
and reviews. It loads `GET /api/stores/{id}`, `GET /api/bags/store/{id}`, and
`GET /api/reviews/store/{id}`. Store bag cards map backend-shaped bag records to
the shared listing slugs so product and cart links remain compatible. The
store detail profile uses `/assets/images/demos/demo-28/banners/store.jpg` as
its main store image. The `Bags From` cards and `/products` use each bag's API
`imageUrl`, falling back to
`/assets/images/brand/surprise-bag-placeholder.webp`. The
store-detail profile does not show the verification badge; its status is
presented as `Open` or `Closed`. Joined and Status now share a single bottom
divider in the store information grid without duplicating the next row. Unknown
or inactive store IDs return `404`.

Product and store links now use `/products`, `/stores`, `/stores/[id]`, and
`/products?store=`, and `/product?bag=`. Store detail marketplace links use the
same store slug filter as the listing page. The old `/category` route was removed because `/products` is
now the single marketplace listing route. Category, store, and sort query
parameters are read on initial load, but interactive filter changes are not
written back to the URL or sent to the Store Service.

### Product, cart, wishlist, and checkout

The Product Detail page reads the `bag` query parameter and loads API-backed
items through `getBag(id)` from the Store Service. API listing cards pass the
backend bag ID; older static Home links can still pass a known slug, which is
resolved through `listBags()` during the transition. The response is adapted
through `toListingBag` and renders backend pricing, store, pickup, expiry,
category, and availability data. Missing or unknown bags return `404`. Add to
Cart updates the shared legacy cart state, mirrors authenticated backend bag
mutations to Cart Service, and navigates to the protected `/newcart` route.

The Product Detail image gallery uses storefront-owned markup and avoids the
legacy Molla ElevateZoom selectors, so hovering the image does not inject the
old zoom container or thumbnail UI. It displays up to three existing product
gallery assets as vertical thumbnails, and selecting a thumbnail updates the
main image. Thumbnail keys include their position so repeated fallback assets
do not trigger React duplicate-key errors. The detail summary now shows
backend-aligned pickup timestamps,
expiry time, category, and `quantity remaining of quantity total`
availability; the unnecessary Status field is omitted. Its quantity control uses
the same minus/value/plus stepper pattern as the Cart page. Summary field labels
use a slightly larger type size
to improve scanning, and category links inherit the normal summary value size.
The Add to Cart hover state uses a filled green button with both the label and
cart icon in white.
The previous pickup-day/discount footer row was removed. Product reviews now
show static FE review data until the Store Service review endpoint is connected.
The related-bag section uses the saved Product Detail design: five full
`SurpriseBagCard` cards, same-category items first, and a link to more bags in
the current category.

The legacy `/cart` page consumes the shared in-memory `CartProvider`, groups cart
lines by store, supports custom quantity stepper updates, clamps quantities to
each bag's available amount, removes items, and calculates the subtotal. The
header dropdown, Product Detail, listing cards, `/cart`, and `/checkout` use
that same state. Authenticated mutations are mirrored to Cart Service, but a
full browser refresh still clears the legacy React state.
Cart category labels link back to the filtered `/products?category=` listing,
while bag names and images link to `/product?bag=`. The `Continue browsing`
action uses the same outlined button treatment as Home's `View Details` action.

The header cart dropdown reads from the shared legacy cart state, including the
current bag names, images, quantities, item count, and VND total instead of
the legacy clothing demo items. Its storefront-specific dropdown offset keeps
the popup visually closer to the cart trigger when opened, and its `1x` item
quantity markers are emphasized for easier scanning.

The Cart breadcrumb uses the shared compact storefront height instead of adding
a second layer of vertical padding.

Current commerce status:

- Wishlist controls and the wishlist route are intentionally disabled because
  short-lived near-expiry surprise bags are not suitable for long-term saving.
  The previous implementation is retained in comments for possible future
  saved-store or notification functionality.
- The legacy `/checkout` route is authentication-gated and submits one Order
  Service request per
  store in the cart. It validates the backend-required contact fields, shows
  returned order IDs, and clears the shared cart only after every request
  succeeds. Payment selection remains UI-only because no payment request is
  sent yet. It also loads the authenticated customer name, email, and phone
  into an editable customer information section. Delivery loads saved
  addresses from the profile response, selects the default address when one is
  available, and supports entering a new delivery address.
- Checkout keeps the customer information fields as the single source of truth
  for contact details; the delivery section no longer contains duplicate contact
  state. Static/demo cart items without backend IDs are rejected before order
  submission so the frontend does not send invalid order payloads.
- `/newcart` loads Cart Service/Redis state and supports API-backed quantity
  changes and removals. `/newcheckout` reads the same Redis carts, loads profile
  data, and calls `checkoutFromCart` once per selected store. These routes are
  currently parallel replacements; route names, header state, and the legacy
  cart implementation still need consolidation before the cart flow is final.

The previous Molla checkout template is archived at
`remove-later/CheckoutMain.tsx`.

`OrderHistoryMain` and `ShippingMain` currently use
`components/orders/order-data.ts`. Order API methods remain available in
`lib/api/order.ts`, but these two customer pages are intentionally static until
their integration work resumes.

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
- Magnific Popup;
- line-awesome/icon fonts;
- jQuery;
- Bootstrap bundle;
- HoverIntent, Waypoints, Superfish;
- Magnific Popup, input spinner, ElevateZoom; and
- Molla `main.js`.

Store-specific fixes and additions live in `app/(store)/globals.css`, including:

- home/inner header spacing;
- informational-page hero, FAQ, About, and Contact layouts;
- drag-scroll product rows;
- authenticated account dropdown alignment and hover colors;
- profile action styling;
- OTP boxes and verification footer layout; and
- product-listing search, card grid, filters, min/max range fields, and
  responsive rules.

`InteractiveHandlers` handles search toggling, mobile-menu opening/closing, and
the scroll-to-top button using DOM event listeners. When replacing legacy
widgets with React, remove the corresponding jQuery/DOM handler rather than
letting both systems own the same interaction.

## Navigation

The shared header currently provides:

- Home;
- Surprise Bags, linking to `/products`;
- Stores, linking to the store directory at `/stores`;
- About Us, linking to `/about`;
- Contact Us, linking to `/contact`;
- an implemented product search overlay and cart presentation; wishlist is
  intentionally disabled;
- Inline `Register | Sign In` links for visitors, using the same bold, slightly
  larger style and right-aligned account area as the authenticated Welcome
  link; and
- Clickable `Welcome, <name>` profile link followed by `| Logout` for
  authenticated users; the full account row is bold and slightly larger, and
  both interactive items use pointer cursors.

The utility bar shows the centralized `StealDeals | Rescue Food Marketplace`
title on the far left using the same bold, slightly larger styling as the
Welcome text.
The template phone-number entry is commented out.
The storefront overrides the template account-menu minimum width so the
`Register | Sign In` and authenticated account rows do not retain empty space.

The storefront brand is centralized in `lib/brand.ts` as `StealDeals`, with
`Rescue Food Marketplace` as its descriptor. Shared logo, footer, metadata,
header title, and active newsletter copy consume those constants.

The top-level storefront navigation currently has no rendered submenus:

- Home links directly to `/`.
- Surprise Bags links directly to `/products`.
- Stores links directly to the store directory at `/stores`.
- About Us and Contact Us are direct navigation links instead of utility-bar links.
- Pages is commented out until its navigation destinations are finalized.
- The same structure is used by the mobile menu.

Several dropdown and footer links still reference original `.html` pages or
use `href="#"`. Replace or remove these as routes are converted. Avoid hash
links for commands because they can scroll the page unexpectedly.

The unconnected legacy `SigninModal` is no longer mounted globally and its
source is archived at `remove-later/SigninModal.tsx`. `/login` and `/register`
are the storefront authentication entry points.

## Assets

The active storefront still uses `public/assets`. Current notable state:

- `public` contains 105 files and approximately 6.52 MB.
- `public/assets/images/home` contains ten Home-owned hero, campaign, store
  fallback, and sustainability images. The five generated step-4 additions are
  optimized WebP files rather than shipping their full-resolution PNG sources.
- All Home content images now use `next/image`; CSS backgrounds remain only on
  the hero, guide campaigns, and newsletter compositions that place copy over
  decorative media.
- Bag, category, and store fallback paths are centralized in
  `lib/image-assets.ts`. Store cards and store detail prefer the API
  `avatarUrl`, then use the shared store fallback instead of a Molla image.
- `public/assets/images/demos/demo-28` remains active for some catalog and store
  fallback imagery, but the rendered Home route no longer depends on it.
- `public/assets/images/menu/demos` was retained because the commented demo
  chooser still references those screenshots.
- The original asset audit moved 344 unused or legacy template assets into
  `remove-later/assets`, preserving their original `public/assets` path
  structure. This includes old Molla page-image folders, unused demo and skin
  stylesheets, unused demo/helper scripts, Font Awesome, Flaming fonts, and
  unused standalone images.
- A later audit moved another 166 safe cleanup candidates into the same archive:
  29 unused demo stylesheets, 23 unused skin stylesheets, and 114 legacy product
  images. `demo-28.css`, `skin-demo-28.css`, and the three
  commented wishlist table images remain in `public`.
- The latest audit moved 29 more safe candidates (approximately 1.14 MB),
  including superseded login, logo, favicon, category, and product-placeholder
  images plus the unmounted Owl Carousel JS/CSS bundle.
- The Home imagery audit moved four newly orphaned demo-28 images (approximately
  94 KB): the old promo, banner 6, and blog images 3 and 4.
- Assets referenced only by intentionally retained commented code were left in
  `public/assets`, including the menu screenshots, newsletter popup images, and
  wishlist/product template images.
- The remaining 104 files in `public/assets` are the active storefront assets,
  CSS/JS dependencies, and intentionally retained commented-code assets.
- Nineteen category-only fashion images (approximately 115 KB) were removed
  after their source references were replaced. The remaining product-detail,
  cart, wishlist, and header fashion assets stay until those screens are adapted.
- Unused Molla demo folders, landing-page assets, and default Next SVGs are
  currently removed from the working tree and appear as Git deletions.
- `public/removedAssets` does not currently exist. Removed assets remain
  recoverable from Git history.
- `remove-later` now contains 560 files and approximately 18.46 MB, including
  archived components and assets.
- `.codex-runtime/` is ignored and is only for local logs, browser profiles,
  and screenshots.

Review the large asset deletion set before committing it. Do not restore
unrelated demo trees unless a future converted page actually requires them.

## Environment and local development

The browser API URL is configured through:

```env
NEXT_PUBLIC_API_URL=http://localhost:5158
NEXT_PUBLIC_STORE_API_URL=http://localhost:5169
NEXT_PUBLIC_ORDER_API_URL=http://localhost:5165
NEXT_PUBLIC_CART_API_URL=<Cart Service URL>
```

The current ignored `.env.local` defines Identity, Store, and Order URLs but
does not define `NEXT_PUBLIC_CART_API_URL`; `/newcart` and `/newcheckout` cannot
load Redis cart data until that value is added. There is currently no
`.env.example`; add a secret-free example once the team confirms canonical
local ports.

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
npx.cmd vitest run
npx.cmd eslint "app/(store)" components/about components/auth components/cart components/checkout components/contact components/faq components/home components/layout components/login components/orders components/product components/products components/profile components/shipping components/stores components/wishlist lib/api
npm.cmd run build
```

At this handoff:

- TypeScript passes with `--incremental false`.
- Vitest passes 11 files and 92 tests, covering authentication components,
  password reset, OTP/focus behavior, header search, and shared Home data states.
- The changed Home/store image files pass ESLint. The complete storefront lint
  is temporarily blocked by a parsing error in the separate untracked
  `components/auth/ResendOtpButton.test.tsx` work; excluding that file, the
  scope has 12 warnings: seven legacy stylesheet warnings, four remaining
  native `<img>` warnings, and one `CartProvider` hook-dependency warning.
- The production build passes after the Home content-image migration.
- Local HTTP checks return `200` for `/products`, category-filtered products,
  a known store, and all 12 listing images; unknown stores return `404`.
- The public `/stores` listing now loads stores and their available bags from
  the Store Service, maps them into the existing card model, and retains local
  search/filter/sort/pagination behavior.
- `/stores/[id]` now loads the store profile, store bags, and store reviews from
  the Store Service and maps them into the existing detail components. The
  route remains dynamic and returns `404` for missing or inactive stores.
- The new listings were not visually checked through an automated browser in
  this environment; review desktop and mobile presentation before merging.

## Known gaps and risks

- Most commerce screens are still mock/static and should not be described as
  fully backend integrated. The `/products` listing and product detail call the
  Store Service, both checkout implementations create Order Service records,
  and `/newcart` reads Cart Service/Redis state. Order history, shipping,
  payment processing, and other commerce workflows still need page-level
  integration.
- Listing filters use local client state and are not persisted in the URL or
  sent to a catalog service.
- The generated Privacy Policy copy requires product-owner and legal review
  before production use.
- Google/Facebook login is not implemented.
- Profile phone/address edits are currently frontend-only until Account Service
  update endpoints are connected.
- The `Become a Seller` form submits to `POST /api/stores`, but the form does
  not yet refresh the profile or seller role after admin approval. The backend
  approval/event flow must complete before the account can use seller-only
  screens.
- Client resend cooldowns do not replace backend OTP throttling.
- `RequireAuth` is client-only and briefly renders nothing during session
  restoration.
- The Identity API base URL is not validated before constructing requests;
  Store, Order, and Cart clients do validate their service URLs.
- `NEXT_PUBLIC_CART_API_URL` is absent from the current `.env.local`.
- Legacy `/cart` and `/checkout` coexist with Redis-backed `/newcart` and
  `/newcheckout`; navigation and state ownership must be consolidated.
- Legacy jQuery scripts are globally loaded for all store pages and increase
  bundle/runtime cost.
- Many internal links still target `.html` template files or `#`.
- Four storefront images still use `<img>` instead of `next/image`, producing
  lint warnings in cart, checkout, Footer, and NewsletterPopup.
- Unit/component coverage now exists for core authentication behavior, header
  search, product-listing helpers, and Home data sharing. End-to-end browser
  coverage does not exist yet.
- Access-token refresh and cookie behavior depend on correct backend CORS and
  cookie configuration.

## UI revamp backlog

Track the storefront revamp as eight work packages. Authentication is complete,
Home is in progress, and seven packages still require work or final validation.

1. [x] **Authentication - complete:** Sign In, Register, Forgot Password, privacy
   dialog, focus behavior, responsive layout, and shared form components.
2. [ ] **Home - in progress:** the requested section order, React hero, branding,
   API mapping, shared `HomeDataProvider`, and explicit loading/error/empty/retry
   states are complete. Visible Molla/demo imagery has been replaced with
   Home-owned assets. Ranking semantics and final desktop/mobile validation
   remain.
3. [ ] **Image standardization:** the shared bag/category/store fallbacks, S3
   bag path allowlist, and Home content-image migration are complete. Replace
   the four remaining content-bearing native `<img>` elements with `next/image`, add
   stable dimensions and responsive `sizes`, preserve CSS backgrounds only for
   decorative media, and narrowly allowlist any additional remote storage paths.
4. [ ] **Shared storefront shell:** active navigation, authentication controls,
   product search, branding, and cart presentation are implemented. Remove
   hidden Molla navigation markup and dead `.html`/hash links, then finish
   Header, mobile menu, and Footer consistency.
5. [ ] **Catalog:** Store Service listing/detail mapping, search/filter/sort,
   product fields, quantity controls, related cards, and cart actions are
   implemented. Complete responsive, accessibility, error-state, and
   performance validation for `/products` and `/product`.
6. [ ] **Stores:** Store Service listing, detail, bags, reviews, filtering, and
   pagination are implemented. Complete responsive/accessibility validation and
   use API store imagery when its contract is available.
7. [ ] **Commerce and account:** profile loading, seller applications, both
   checkout implementations, and Redis cart screens exist. Consolidate the
   legacy and Redis cart/checkout routes, persist profile edits, and reconnect
   `/orders` and `/shipping` to their API contracts.
8. [ ] **Cross-page QA:** About, Contact, and FAQ have storefront-owned content;
   recheck their consistency, then run
   storefront accessibility, responsive, asset, lint, test, and production-build
   validation.

## Safe continuation points

1. Finish Home ranking semantics and responsive validation.
2. Add `NEXT_PUBLIC_CART_API_URL`, decide whether `/newcart` and `/newcheckout`
   replace the legacy route names, and remove duplicate cart state afterward.
3. Add a secret-free `.env.example` once canonical local service ports are
   agreed.
4. Implement persistent profile phone/address edits, then connect order history
   and shipping to the Order Service.
5. Complete the seller approval/event flow and refresh the profile role after
   approval.
6. Decide whether to add saved-store or availability-notification state; do not
   restore wishlist state for short-lived surprise bags without a clear product
   requirement.
7. Replace obsolete `.html`/hash links as each destination becomes available.
8. Incrementally replace legacy jQuery widgets with React-owned components,
   then remove unused scripts and styles.
9. Add browser tests for registration/OTP, password reset, login/session restoration,
   refresh-and-retry, logout, protected-route redirects, profile verification,
   and responsive product/store listings.

## Working-tree note

At the time of the September 22 audit, the worktree includes staged Home data
provider changes and separate in-progress authentication/test edits. Future
work should inspect `git status` and preserve unrelated changes rather than
resetting the tree.

## Out of scope

The `(admin)` and `(seller)` route groups use their own architecture and
Tailwind stylesheet. Read `docs/dashboard-refactor-handoff.md` before changing
those routes. Do not import storefront Bootstrap/Molla styles into dashboards,
and do not import dashboard Tailwind styling into the storefront.
