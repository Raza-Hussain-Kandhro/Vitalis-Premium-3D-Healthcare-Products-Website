/**
 * Local seeding helper: node scripts/seed.mjs
 * Applies db/schema.sql then db/seed.sql using the DIRECT (non-pooled) URL.
 */
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import pg from 'pg'

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
if (!url) {
  console.error('Set DATABASE_URL (or DATABASE_URL_UNPOOLED) in .env first.')
  process.exit(1)
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } })

try {
  await client.connect()
  await client.query(readFileSync('db/schema.sql', 'utf8'))
  console.log('✓ schema applied')
  await client.query(readFileSync('db/seed.sql', 'utf8'))
  console.log('✓ seed data inserted')
} catch (err) {
  console.error('Seeding failed:', err.message)
  process.exitCode = 1
} finally {
  await client.end()
}
