# Storefront focus

Siyatha Online (siyatha.lk) leads with three departments. The shop counter is pos.siyatha.lk (`cloud_pos`).

## Photo prints

Inspired by Kärkkäinen’s print desk (copies, enlargements, cards, a visible price), Prints.lk’s local photo menu, and Creaze’s live total plus a file check.

- Landing: `/photo-prints` targets “photo print Sri Lanka”, with sizes, paper, FAQ, and islandwide delivery from Kirimatiya, Batapola, Ambalangoda.
- Order: `/photo-prints/order` is one page. Pick the family, size, and paper, drop photos, set copies, then add to cart or send the list on WhatsApp.
- Prices live in `src/lib/storefront.ts`. Glossy, matte, and lustre share a price. Twelve copies of one size are 10% less. Thirty are 20% less. Passport sheets do not discount.
- Uploads go to `public/uploads/prints` through `POST /api/photo-prints/upload` and are gitignored. Checkout recomputes the print price from the size. Frames and wall prints stay a WhatsApp quote.

## Packaging and craft

- `/packaging` is for online sellers: mailers, boxes, bubble, tape, thank-you cards, labels.
- `/craft` is for home making: paper, glue, sewing, ribbon, paint, felt, glitter.
- Category tiles search `/shop?dept=`. A product matches when its name, description, category, brand, or SKU contains that department’s keywords. Set the category to Packaging or Craft when publishing from the shop.

## Later

A customer photo locker, calendars, and priced canvas or frames can wait until the print desk is in daily use. Uploaded files sit on the app disk, so a host that wipes the disk on deploy will need object storage before that matters.
