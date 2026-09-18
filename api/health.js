/** GET /api/health — public liveness + database reachability probe. */

import { sql } from 'drizzle-orm'
import { db } from './_lib/db.js'
import { handler, ok } from './_lib/http.js'

export default handler(['GET'], async (req, res) => {
  let database = 'not_configured'
  let latencyMs = null

  if (db) {
    const started = Date.now()
    try {
      await db.execute(sql`select 1`)
      database = 'connected'
      latencyMs = Date.now() - started
    } catch (err) {
      console.error('[health] db check failed', err)
      database = 'error'
    }
  }

  return ok(res, {
    status: database === 'error' ? 'degraded' : 'ok',
    service: 'vitalis-api',
    version: '2.0.0',
    region: process.env.VERCEL_REGION ?? 'local',
    database,
    latencyMs,
    timestamp: new Date().toISOString(),
  })
})
