/**
 * GET  /api/records — records owned by the authenticated user (admins see all).
 * POST /api/records — create a record for the authenticated user.
 */

import { desc, eq } from 'drizzle-orm'
import { requireDb } from '../_lib/db.js'
import { appRecords } from '../_lib/schema.js'
import { handler, ok, parseWith, readBody } from '../_lib/http.js'
import { recordCreateSchema } from '../_lib/validators.js'
import { requireAuth } from '../_lib/auth.js'

export default handler(['GET', 'POST'], async (req, res) => {
  const actor = requireAuth(req)
  const db = requireDb()

  if (req.method === 'GET') {
    const rows = await db
      .select()
      .from(appRecords)
      .where(actor.role === 'admin' ? undefined : eq(appRecords.userId, actor.id))
      .orderBy(desc(appRecords.createdAt))
      .limit(100)
    return ok(res, rows)
  }

  const payload = parseWith(recordCreateSchema, readBody(req))
  const [created] = await db
    .insert(appRecords)
    .values({
      userId: actor.id,
      title: payload.title,
      metadata: payload.metadata ?? {},
      status: payload.status ?? 'active',
    })
    .returning()

  return ok(res, created, 201)
})
