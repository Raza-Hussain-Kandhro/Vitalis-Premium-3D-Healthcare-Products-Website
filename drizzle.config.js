import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

/**
 * drizzle-kit runs only locally / in CI (never inside a serverless function),
 * so it uses the DIRECT (non-pooled) connection string when available.
 */
export default defineConfig({
  schema: './api/_lib/schema.js',
  out: './db/migrations',
  dialect: 'postgresql',
  casing: 'snake_case',
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
})
