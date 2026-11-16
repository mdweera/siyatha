# Notes

## 2026-11-16

- Free delivery and the delivery charge come from Cloud POS `Settings` in database `pos_app_sl` (`onlineFreeDeliveryAbove`, `onlineDefaultDeliveryCharge`). The starting free-delivery amount is Rs 1,000. Siyatha reads it through `getShopDelivery()`.
- A fixed bar at the bottom shows the cart total and how much is left for free delivery. Cart and checkout use the same figure.
- Photo prints ship within one business day. The shop address stays in the footer and on Who Are We.

- siyatha.lk is this repo. The shop counter is pos.siyatha.lk (`cloud_pos`).
- The public site leads with photo prints (`/photo-prints`), seller packaging (`/packaging`), and craft materials (`/craft`). Prices and department keywords live in `src/lib/storefront.ts`.
- Photo uploads are stored in `public/uploads/prints` and gitignored. Checkout prices print lines from the size id, not the client price.
- Vercel build failed because `src/lib/mongodb.ts` threw while route modules were imported. `dbConnect()` now throws only when a request needs the database. The Vercel project still needs `MONGODB_URI`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`.
- Each print size in `src/lib/storefront.ts` has a `pixels` hint. The photo-print page leads with 4×6, 5×7, passport sheet, and 8×10.
- Public colours keep pink `#DE2684`, crimson `#B10C53`, purple `#681878`, and cream `#F9E094`, with yellow `#F2B400` on primary buttons and the delivery progress. WhatsApp actions use `#25D366`. A dismissible one-day banner sits at the top. The bottom bar shows the cart total and how much is left for free delivery.
- Photo print prices and the two bulk discounts are `Settings.onlinePrintPrices` in `pos_app_sl`. Siyatha reads them with delivery through `getShopSettings()`. The built-in list in `src/lib/storefront.ts` is the fallback. Checkout reprices from that record.
- Checkout does not require an account. The shop grid shows packaging and craft unless the visitor searches. WhatsApp actions use `#25D366`.
- The one-day shipping bar is solid yellow `#F2B400` with black text. No gradient.
- Home carousel photos are `public/carousel-01.webp` through `public/carousel-05.jpg`. Slide 01 is the table of prints.
- Photo uploads use Cloudinary only. `CLOUDINARY_URL` is enough. Files land in `siyatha/prints/inbox/YYYY/MM/DD` and move to `siyatha/prints/orders/<orderNumber>/` when the order is placed. If Cloudinary is missing, the file is stored in Mongo `PrintFile`.
- Google sign-in needs `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. The redirect is `/api/auth/callback/google`. Customers see order steps on `/dashboard`. Cloud POS reads the same `online_orders` collection from `siyatha_online_db` at `/management/photo-prints`.
- The browser tab icon is the Siyatha logo (`src/app/icon.png`). The header shows the logo without the word beside it.
- Home sections are full-width bands with a thick colored top border. Carousel slides are `public/carousel-01.webp` through `public/carousel-06.jpg`. Slide 01 stays first.
- Guest orders get a unique `trackingCode` (`SY-XXXXXX`) on create. Public lookup is `GET /api/orders/track?code=` and `/track`. Confirmation shows the code + login CTA. Home, nav, and footer link to `/track`.
- Closable free-delivery banners on cart/checkout use `FreeDeliveryBanner` (session dismiss). Site-wide click/route pending UI is `NavigationFeedback` + `signalNavigationPending()` for `router.push`.
