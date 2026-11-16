# Hosting

- Public site: https://siyatha.lk — this repo, branch `main`, Vercel.
- Shop counter: https://pos.siyatha.lk — `cloud_pos`, not this repo.
- This app’s Mongo database is `siyatha_online_db`. Free-delivery settings are read from Cloud POS `Settings` in `pos_app_sl`.

## Build

`src/lib/mongodb.ts` connects inside `dbConnect()`. Do not throw for a missing `MONGODB_URI` at import time. Vercel runs `next build` and collects route modules before the runtime database is required. Set `MONGODB_URI`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` on the Vercel project so the live site can read products and sign in.

Do not commit `.env*`, `next-env.d.ts`, or files under `public/uploads/prints` other than `.gitkeep`.
