# Notes

## 2026-11-16

- Free delivery and the delivery charge come from Cloud POS `Settings` in database `pos_app_sl` (`onlineFreeDeliveryAbove`, `onlineDefaultDeliveryCharge`). The starting free-delivery amount is Rs 1,000. Siyatha reads it through `getShopDelivery()`.
- A fixed bar at the bottom shows the cart total and how much is left for free delivery. Cart and checkout use the same figure.
- Photo prints ship within one business day. The shop address stays in the footer and on Who Are We.

- siyatha.lk is this repo. The shop counter is pos.siyatha.lk (`cloud_pos`).
- The public site leads with photo prints (`/photo-prints`), seller packaging (`/packaging`), and craft materials (`/craft`). Prices and department keywords live in `src/lib/storefront.ts`.
- Photo uploads are stored in `public/uploads/prints` and gitignored. Checkout prices print lines from the size id, not the client price.
