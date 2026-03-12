# PRD — Bazzario Full-Stack Ecommerce

## Original Problem Statement
"i want to build ecomerce websiote i will share you images you have to develop same as mostly possible ... i9 need it in react js this will be just for frontend for now just.... and it should be industry standard and also animations in all website and also i will deploy it on vercel soo be sure of languages and code structure./ images in website you may browse and place accordingly."

## User Preferences Captured
- Build from shared screenshots and keep UI/UX very close in structure.
- Initially frontend-only React build, then user requested full backend + payment integration.
- Professional, world-class ecommerce look.
- Animations across website.
- Use browsed images where needed.

## Architecture Decisions
- **Frontend stack**: React + React Router + Tailwind + shadcn/ui components.
- **Motion**: Framer Motion for page/section transitions and hover interactions.
- **Backend stack (phase 2)**: FastAPI + MongoDB + JWT auth + Stripe checkout integration.
- **Data strategy**: seeded product catalog in MongoDB + API-driven auth/cart/orders/settings.
- **Page architecture**: multi-route SPA with reusable layout/components (header, footer, trust bar, newsletter, product cards).
- **Code quality**: modular componentized structure suitable for Vercel static deployment.

## User Personas
1. **Style-focused shopper** — wants visually premium products and easy browsing.
2. **Tech enthusiast** — compares specs, ratings, and deals quickly.
3. **Mobile-first buyer** — expects clean responsive checkout/cart flow.

## Core Requirements (Static)
- Modern ecommerce frontend in React.
- Screens to include: Home, Product Listing, Product Details, Cart, Checkout, Auth.
- Polished animations and industry-standard UI.
- Visual alignment to reference screenshots.

## What’s Implemented (with date)
### 2026-03-12
- Built complete frontend routes:
  - `/` Home page
  - `/shop` Listing page with filters, sort, pagination
  - `/product/:productId` Product details with gallery, tabs, selectors
  - `/cart` Shopping cart with quantity controls and order summary
  - `/checkout` Checkout form and dynamic shipping summary
  - `/auth` Login/Signup style authentication UI
- Implemented shared reusable UI blocks:
  - Sticky responsive header
  - Trust/benefits strip
  - Newsletter subscribe section
  - Full ecommerce footer
  - Reusable animated product cards
- Added animations (Framer Motion + interaction transitions) throughout all pages.
- Added strong `data-testid` coverage for interactive and critical user-facing elements.
- Fixed QA issues from test report:
  - Mobile header overflow on checkout/small screens fixed.
  - Empty state added for zero-result filter scenario on shop page.

### 2026-03-13
- Rebranded entire UI from ShopCentral to **Bazzario** (custom special logo typography).
- Added requested pages and UX updates:
  - `/search-results` page
  - `/account` dashboard page with orders/profile/settings
  - separate `/signin` and `/signup` pages
  - light/dark theme toggle in settings and header
  - Google/Apple icon-only social auth buttons
- Replaced images across site contextually with updated professional product/store visuals.

- Implemented full backend APIs in FastAPI:
  - `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`
  - `GET /api/products`, `GET /api/products/{id}`
  - `GET /api/cart`, `POST /api/cart/items`, `PUT /api/cart/items/{item_id}`, `DELETE /api/cart/items/{item_id}`, `DELETE /api/cart/clear`
  - `POST /api/orders/checkout`, `GET /api/orders`, `GET /api/orders/{order_id}`, `GET /api/orders/preview`
  - `POST /api/payments/checkout/session`, `GET /api/payments/checkout/status/{session_id}`, `POST /api/webhook/stripe`
  - `GET/PUT /api/account/settings`, `PUT /api/account/profile`
- Added MongoDB startup seed for Bazzario product catalog.

- Integrated frontend to backend with shared store context:
  - real sign in/sign up
  - real cart state and quantity updates
  - real checkout order creation
  - Stripe redirect from frontend checkout
  - account page wired to profile/settings/order APIs

- QA + bug fixes:
  - Added checkout order-preview sync to align UI totals with backend totals.
  - Disabled checkout payment actions on empty cart and added explicit empty-cart messaging.
  - Verified Stripe redirect from UI to checkout.stripe.com with non-empty cart.
  - Verified APIs with curl and automated tests; payment session/status endpoints return valid responses.

### 2026-03-13 (follow-up)
- Fixed social auth buttons so **Google** and **Apple** now perform real sign-in/sign-up flow and redirect to account.
- Added password visibility toggle behavior on both sign-in and sign-up forms.
- Added forgot-password click handling (demo reset action with UX feedback) so it is no longer a dead button.
- Revalidated via browser automation that Google/Apple buttons are functional and reach `/account` successfully.

## Prioritized Backlog
### P0 (Next Critical)
- Add production-grade Stripe webhook secret verification and post-payment confirmation page.
- Add admin product management APIs and secure role-based access.
- Add robust error/retry states for payment failure/recovery UX.

### P1 (Important)
- Product search endpoint refinements (fuzzy and typo-tolerance behavior).
- Product list URL-state syncing for filters/sort.
- Wishlist persistence and account-level favorites.
- Skeleton loaders and request-error states.

### P2 (Enhancement)
- Personalized recommendations.
- Recently viewed products.
- Advanced micro-interactions (parallax/scroll storytelling).
- A/B test hero/banner conversion variations.

## Next Tasks List
1. Build dedicated order-success and order-failed pages tied to Stripe status polling.
2. Add admin dashboard for product CRUD and inventory updates.
3. Add email notifications (order placed, shipped, delivered).
4. Add wishlist persistence and recently viewed history per user.
5. Add analytics events and conversion dashboard hooks.
