import 'dotenv/config'
import pg from 'pg'

const url = process.env.DATABASE_URL
console.log('Connecting to:', url?.replace(/:[^:@]+@/, ':****@'))

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
})

console.time('connect')
try {
  await client.connect()
  console.timeEnd('connect')
  console.log('✓ Connected successfully')
  const res = await client.query('select 1 as ok')
  console.log('✓ Query result:', res.rows)
} catch (err) {
  console.timeEnd('connect')
  console.error('✗ Connection failed')
  console.error('Error name:', err.name)
  console.error('Error message:', err.message)
  console.error('Error code:', err.code)
  console.error(err)
} finally {
  await client.end().catch(() => {})
}