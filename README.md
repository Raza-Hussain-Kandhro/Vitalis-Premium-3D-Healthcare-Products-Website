# Vitalis — Premium 3D Healthcare Products Website

Full-stack project: **Vite + React frontend** and a **Node.js serverless API** in `/api`, backed by **PostgreSQL** (Neon or Supabase, pooled), deployed together on **Vercel**.

---

## 1. Folder structure

```
vitalis/
├── api/                          # Vercel Serverless Functions (Node.js 20)
│   ├── _lib/                     # shared code — underscore = NOT routable
│   │   ├── db.js                 # pooled / HTTP Postgres client (Drizzle)
│   │   ├── schema.js             # Drizzle schema (source of truth)
│   │   ├── auth.js               # JWT sign/verify + bcrypt + ownership checks
│   │   ├── http.js               # CORS, method guard, errors, body parsing
│   │   └── validators.js         # Zod schemas (mirror client validation)
│   ├── health.js                 # GET    /api/health
│   ├── me.js                     # GET    /api/me
│   ├── products/
│   │   ├── index.js              # GET    /api/products
│   │   └── [slug].js             # GET    /api/products/:slug
│   ├── gallery/index.js          # GET    /api/gallery
│   ├── enquiries/index.js        # POST   /api/enquiries   | GET (admin)
│   ├── appointments/index.js     # POST   /api/appointments | GET (staff)
│   ├── waitlist/index.js         # POST   /api/waitlist
│   ├── auth/
│   │   ├── register.js           # POST   /api/auth/register
│   │   └── login.js              # POST   /api/auth/login
│   └── records/
│       ├── index.js              # GET/POST      /api/records
│       └── [id].js               # PUT/DELETE    /api/records/:id
├── db/
│   ├── schema.sql                # plain SQL schema (equivalent to Drizzle)
│   ├── seed.sql                  # catalogue + gallery seed data
│   └── migrations/               # drizzle-kit output
├── scripts/seed.mjs              # node scripts/seed.mjs
├── src/                          # frontend
│   ├── pages/                    # Home, About, Products, Gallery, Contact, NotFound
│   ├── components/canvas/        # Three.js / R3F scene (code-split)
│   ├── components/ui/            # Navbar, Hero, Footer, PageHeader, cards…
│   ├── services/api.js           # single REST client for /api
│   ├── hooks/ lib/               # device tier, WebGL probe, scroll store
│   ├── App.jsx  main.jsx  index.css
├── drizzle.config.js
├── vercel.json                   # SPA rewrites + function runtime/limits
├── .env.example
└── package.json
```

Why this shape works on Vercel: every file in `/api` becomes its own stateless function (no long-running Express server), folders starting with `_` are ignored by the router, and `vercel.json` rewrites all non-`/api` paths to `index.html` so React Router deep links (`/products`, `/contact`) work on refresh.

---

## 2. Local setup

```bash
npm install
cp .env.example .env          # fill DATABASE_URL + JWT_SECRET
npm run db:push               # or: psql "$DATABASE_URL_UNPOOLED" -f db/schema.sql
npm run db:seed               # applies db/schema.sql + db/seed.sql

npm run dev                   # frontend only (API calls fall back to sample data)
npx vercel dev                # frontend + /api functions together
```

Generate a JWT secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

## 3. API reference

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | Liveness + DB latency probe |
| GET | `/api/products` | Public | Catalogue, `?category=&search=&limit=` |
| GET | `/api/products/:slug` | Public | Single product |
| GET | `/api/gallery` | Public | Gallery items, `?category=` |
| POST | `/api/enquiries` | Public | Contact form (Zod validated) |
| GET | `/api/enquiries` | Admin (JWT) | Enquiry inbox |
| POST | `/api/appointments` | Public | Booking request |
| GET | `/api/appointments` | Staff/Admin (JWT) | Upcoming bookings |
| POST | `/api/waitlist` | Public | Early-access capture (upsert) |
| POST | `/api/auth/register` | Public | Create user + profile, returns JWT |
| POST | `/api/auth/login` | Public | Returns JWT |
| GET | `/api/me` | JWT | Current user + profile |
| GET/POST | `/api/records` | JWT | List/create owned records |
| PUT/DELETE | `/api/records/:id` | Owner/Admin | Update, soft delete (`?hard=true`) |

Response envelope: success `{ "data": ... }`, failure `{ "error": { code, message, fieldErrors? } }`.

---

## 4. Deploy to Vercel

1. **Provision Postgres** — Neon or Supabase. Copy the **pooled** connection string (Neon `-pooler`, Supabase port `6543`) and the direct one for migrations.
2. **Push to GitHub** — `git init && git add . && git commit -m "feat: full-stack Vitalis" && git push`.
3. **Import on Vercel** — New Project → pick the repo. Framework preset **Vite**, build `npm run build`, output `dist` (already in `vercel.json`).
4. **Add env vars** (Settings → Environment Variables, all three environments): `DATABASE_URL`, `JWT_SECRET`, optional `JWT_EXPIRES_IN`, `ALLOWED_ORIGINS`, `VITE_API_URL=/api`.
5. **Apply the schema** — run `db/schema.sql` + `db/seed.sql` in your provider's SQL editor, or locally `npm run db:push && npm run db:seed`.
6. **Deploy**, then verify: `curl https://<app>.vercel.app/api/health` → `database: "connected"`; submit the contact form and confirm a row in `enquiries`.
7. **Custom domain** (optional) — add it in Settings → Domains; add it to `ALLOWED_ORIGINS` if you also call the API from another origin.

### Constraint checklist

- Serverless functions only (no Express server) — `nodejs20.x`, `maxDuration: 10`.
- Stateless: no filesystem writes; images/uploads use `image_url`/`avatar_url` pointing at Vercel Blob or S3.
- Pooling: Neon HTTP driver, or `pg.Pool({ max: 1 })` cached on `globalThis` against a PgBouncer endpoint.
- Secrets only via `process.env`; nothing sensitive is prefixed `VITE_`.
- CORS handled centrally in `api/_lib/http.js` (same-origin by default, allow-list for extras).
