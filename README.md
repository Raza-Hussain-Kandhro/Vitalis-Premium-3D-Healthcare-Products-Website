<div align="center">

# 🩺 Vitalis — Intelligent Healthcare Products

**A premium, 3D-animated healthcare product showcase, booking, and admin platform.**

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&labelColor=20232a)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite&logoColor=white&labelColor=20232a)
![Three.js](https://img.shields.io/badge/Three.js-3D_Scene-000000?logo=three.js&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Serverless-000000?logo=vercel&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/status-active-success)

</div>

---

## ✨ Overview

Vitalis is a full-stack website for a healthcare equipment brand — a cinematic, scroll-driven 3D homepage, a product catalogue, a project gallery, appointment booking, a contact/enquiry system, an early-access waitlist, and a private admin dashboard to manage all of it.

It's built as a **single deployable unit**: a React frontend and a set of Vercel serverless API functions, sharing one PostgreSQL database (hosted on Supabase).

---

## 🚀 Features

### Public site

- 🎬 **3D animated hero** built with Three.js / React Three Fiber, with scroll-linked narrative sections
- 🛒 **Product catalogue** — searchable, filterable by category, with real images
- 🖼️ **Gallery** — deployments, facilities, and product photography
- 📩 **Contact form** — validated enquiries, stored and reviewable by staff
- 📅 **Appointment booking** — consultation requests with preferred dates
- 📬 **Waitlist capture** — early-access email signups from the homepage

### Admin dashboard (`/admin`)

- 🔐 **JWT-based staff/admin login**
- 📊 **Enquiries, Appointments & Waitlist views** — with live status updates (mark enquiries/appointments as reviewed, responded, confirmed, etc.)
- 🗂️ **Catalog manager** — add, edit, and delete products and gallery items directly from the browser, no database tool required

---

## 🧱 Tech Stack

| Layer              | Technology                                             |
| ------------------ | ------------------------------------------------------ |
| **Frontend**       | React 18, Vite, React Router, Tailwind CSS             |
| **3D / Animation** | Three.js, React Three Fiber, Drei, Framer Motion, GSAP |
| **Backend**        | Vercel Serverless Functions (Node.js)                  |
| **Database**       | PostgreSQL, hosted on Supabase                         |
| **ORM**            | Drizzle ORM (+ raw SQL schema in `db/`)                |
| **Validation**     | Zod                                                    |
| **Auth**           | JWT (`jsonwebtoken`) + `bcryptjs` password hashing     |
| **Icons**          | Lucide                                                 |
| **Hosting**        | Vercel                                                 |

---

## 📁 Project Structure

```
vitalis/
├── api/                      # Vercel serverless functions (one file = one endpoint)
│   ├── _lib/                 # Shared backend code (not routable)
│   │   ├── db.js             # Pooled Postgres connection (Drizzle)
│   │   ├── schema.js         # Drizzle schema — source of truth for tables
│   │   ├── auth.js           # JWT signing/verification, password hashing, guards
│   │   ├── http.js           # CORS, method guard, error envelope, body parsing
│   │   └── validators.js     # Zod schemas for every endpoint
│   ├── health.js             # GET  /api/health
│   ├── me.js                 # GET  /api/me
│   ├── auth.js               # POST /api/auth/login, /api/auth/register
│   ├── products.js           # GET/POST/PUT/DELETE /api/products[/:slugOrId]
│   ├── gallery.js            # GET/POST/PUT/DELETE /api/gallery[/:id]
│   ├── enquiries.js          # GET/POST/PUT       /api/enquiries[/:id]
│   ├── appointments.js       # GET/POST/PUT       /api/appointments[/:id]
│   └── waitlist.js           # GET/POST           /api/waitlist
├── db/
│   ├── schema.sql            # Raw SQL schema (mirrors Drizzle schema)
│   └── seed.sql              # Sample products & gallery data
├── scripts/
│   └── seed.mjs              # Applies schema.sql + seed.sql locally
├── src/
│   ├── pages/                 # Home, About, Products, Gallery, Contact,
│   │                          # AdminLogin, AdminDashboard, AdminCatalog, NotFound
│   ├── components/ui/        # Navbar, Hero, Showcase, CTA, shared UI bits
│   ├── services/api.js       # Frontend fetch wrapper + typed API calls
│   └── lib/constants.js      # Shared design/scene constants
├── vercel.json                # Rewrites (nested API routes → flat functions), headers
└── .env.example
```

> **Note on API routing:** to stay within Vercel's function-count limits, endpoints like `/api/products/:slug` and `/api/auth/login` are routed through `vercel.json` **rewrites** into flat handler files (e.g. `api/products.js`), which read the dynamic segment from a query parameter internally. The frontend is unaware of this — it calls the same clean URLs either way.

---

## 🗄️ Database Schema

| Table                | Purpose                                                                         |
| -------------------- | ------------------------------------------------------------------------------- |
| `users` / `profiles` | Accounts (roles: `user`, `staff`, `admin`)                                      |
| `products`           | Catalogue items — category, price, images, specs                                |
| `gallery_items`      | Portfolio/deployment photography                                                |
| `enquiries`          | Contact form submissions (status: `new` → `in_review` → `responded` → `closed`) |
| `appointments`       | Booking requests (status: `requested` → `confirmed` → `completed`/`cancelled`)  |
| `waitlist`           | Early-access email signups                                                      |
| `app_records`        | Reserved for future use (not currently wired to the UI)                         |

---

## ⚙️ Getting Started Locally

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# then fill in DATABASE_URL, DATABASE_URL_UNPOOLED, JWT_SECRET, etc.

# 3. Create tables + seed sample data
npm run db:seed

# 4. Run the API functions (terminal 1)
vercel dev --listen 3001

# 5. Run the frontend (terminal 2)
npm run dev
```

Visit **http://localhost:5173**.

### Environment variables

| Variable                | Description                                                  |
| ----------------------- | ------------------------------------------------------------ |
| `VITE_API_URL`          | `/api` — same-origin API base path                           |
| `DATABASE_URL`          | Pooled Postgres connection string (used at runtime)          |
| `DATABASE_URL_UNPOOLED` | Direct connection string (used for local migrations/seeding) |
| `JWT_SECRET`            | Secret used to sign login tokens                             |
| `JWT_EXPIRES_IN`        | Token lifetime, e.g. `7d`                                    |
| `ALLOWED_ORIGINS`       | Comma-separated CORS allow-list (blank = same-origin only)   |
| `BLOB_READ_WRITE_TOKEN` | Optional — for future file upload support                    |

---

## ☁️ Deployment

1. Push the repository to GitHub.
2. Import the repo into [Vercel](https://vercel.com) (Framework: **Vite**, Build: `npm run build`, Output: `dist`).
3. Add the environment variables above in the Vercel project settings.
4. Deploy — Vercel builds the frontend and provisions each `api/*.js` file as a serverless function automatically.

---

## 👤 Author

**Raza Hussain**
BS Computer Science, Final Year — DHA Suffa University
SafeX SDC Internship
