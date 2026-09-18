/**
 * PUT    /api/records/:id — update a record (owner or admin).
 * DELETE /api/records/:id — soft delete by default, ?hard=true for hard delete.
 */

import { eq } from 'drizzle-orm'
import { requireDb } from '../_lib/db.js'
import { appRecords } from '../_lib/schema.js'
import { HttpError, handler, ok, parseWith, readBody } from '../_lib/http.js'
import { recordUpdateSchema } from '../_lib/validators.js'
import { assertOwnerOrAdmin, requireAuth } from '../_lib/auth.js'

export default handler(['PUT', 'PATCH', 'DELETE'], async (req, res) => {
  const actor = requireAuth(req)
  const db = requireDb()
  const { id, hard } = req.query

  if (!id || typeof id !== 'string') throw new HttpError(400, 'bad_request', 'A record id is required.')

  const [existing] = await db.select().from(appRecords).where(eq(appRecords.id, id)).limit(1)
  if (!existing) throw new HttpError(404, 'not_found', 'No record exists with that id.')
  assertOwnerOrAdmin(actor, existing.userId)

  if (req.method === 'DELETE') {
    if (hard === 'true') {
      await db.delete(appRecords).where(eq(appRecords.id, id))
      return ok(res, { id, deleted: 'hard' })
    }
    const [archived] = await db
      .update(appRecords)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(appRecords.id, id))
      .returning()
    return ok(res, archived)
  }

  const payload = parseWith(recordUpdateSchema, readBody(req))
  const [updated] = await db
    .update(appRecords)
    .set({ ...payload, updatedAt: new Date() })
    .where(eq(appRecords.id, id))
    .returning()

  return ok(res, updated)
})
