# Siyatha Online

Public shop for [siyatha.lk](https://siyatha.lk). People upload photos to print, and they can buy packaging for online selling and craft materials for making at home. The shop counter is [pos.siyatha.lk](https://pos.siyatha.lk) (`cloud_pos`), which is a separate app.

Work and push `main`.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Create `.env.local` and do not commit it. The app needs:

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | This shop’s database (`siyatha_online_db`) |
| `NEXTAUTH_SECRET` | Session signing secret |
| `NEXTAUTH_URL` | Site origin, `http://localhost:3000` locally |
| `CLOUD_POS_MONGODB_URI` | Optional. Cloud POS `Settings` for free delivery. If unset, `MONGODB_URI` is reused with the database name `pos_app_sl`. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Optional. Defaults to the shop WhatsApp number. |

## Vercel

Set the same variables on the project. `next build` imports API routes while it collects pages, so missing `MONGODB_URI` must not crash that step. The database connection opens on the first request that needs it. The live site still needs `MONGODB_URI` or product and order pages have nothing to read.

Customer photo files land in `public/uploads/prints` and stay out of git.

## Shop

- `/photo-prints` — prices, sizes, and paper. A sharp 4×6 is about 1200×1800 px.
- `/photo-prints/order` — upload JPG, PNG, or WEBP and add prints to the cart.
- `/packaging` and `/craft` — department shelves.
- `/shop` — full catalog. `?dept=packaging` or `?dept=craft`.

Print prices live in `src/lib/storefront.ts`. Checkout prices a print from its size id. Free delivery uses Cloud POS `onlineFreeDeliveryAbove` (starting value Rs 1,000) and `onlineDefaultDeliveryCharge`. Photo prints ship within one business day. The shop address stays in the footer and on Who Are We.
