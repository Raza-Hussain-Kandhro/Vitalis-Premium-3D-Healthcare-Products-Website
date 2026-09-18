/**
 * Serverless-safe Postgres client.
 *
 * Vercel functions scale horizontally, so every cold start must NOT open a new
 * long-lived TCP pool. Two strategies are supported:
 *
 *  1. Neon HTTP driver (@neondatabase/serverless) — stateless HTTP queries,
 *     zero connection exhaustion. Used automatically for *.neon.tech URLs.
 *  2. node-postgres Pool with max: 1, cached on globalThis so warm invocations
 *     reuse the socket. Point DATABASE_URL at a pooled endpoint
 *     (Supabase pgbouncer :6543 or PgBouncer) — never the direct :5432 port.
 */

import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http'
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres'
import { neon } from '@neondatabase/serverless'
import pg from 'pg'
import * as schema from './schema.js'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.warn('[db] DATABASE_URL is not set — database routes will return 503.')
}

const isNeonHttp = Boolean(connectionString && /neon\.(tech|build)/.test(connectionString))

function createClient() {
  if (!connectionString) return null

  if (isNeonHttp) {
    // Stateless HTTP — ideal for serverless, no pool to exhaust.
    return drizzleHttp(neon(connectionString), { schema, casing: 'snake_case' })
  }

  // Pooled TCP connection, one socket per warm container.
  const pool = new pg.Pool({
    connectionString,
    max: 1,
    idleTimeoutMillis: 120_000,
    connectionTimeoutMillis: 15_000,
    ssl: connectionString.includes('sslmode=disable') ? false : { rejectUnauthorized: false },
  })
  return drizzleNode(pool, { schema, casing: 'snake_case' })
}

// Cache across warm invocations of the same container.
const globalForDb = globalThis
if (!globalForDb.__vitalisDb) globalForDb.__vitalisDb = createClient()

/** Drizzle instance, or null when DATABASE_URL is missing. */
export const db = globalForDb.__vitalisDb

export { schema }

/** Throws a 503 instead of crashing when the database is not configured. */
export function requireDb() {
  if (!db) {
    const err = new Error('Database is not configured. Set DATABASE_URL in your environment.')
    err.status = 503
    err.code = 'db_unavailable'
    throw err
  }
  return db
}
