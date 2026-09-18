/** PUT /api/enquiries/:id — update status (admin only). */

import { eq } from 'drizzle-orm'
import { requireDb } from '../_lib/db.js'
import { enquiries } from '../_lib/schema.js'
import { HttpError, handler, ok, parseWith, readBody } from '../_lib/http.js'
import { enquiryStatusSchema } from '../_lib/validators.js'
import { requireAuth } from '../_lib/auth.js'

export default handler(['PUT', 'PATCH'], async (req, res) => {
  const actor = requireAuth(req)
  if (actor.role !== 'admin') throw new HttpError(403, 'forbidden', 'Admin access required.')

  const { id } = req.query
  if (!id || typeof id !== 'string') throw new HttpError(400, 'bad_request', 'An enquiry id is required.')

  const db = requireDb()
  const [existing] = await db.select().from(enquiries).where(eq(enquiries.id, id)).limit(1)
  if (!existing) throw new HttpError(404, 'not_found', 'No enquiry exists with that id.')

  const { status } = parseWith(enquiryStatusSchema, readBody(req))
  const [updated] = await db.update(enquiries).set({ status }).where(eq(enquiries.id, id)).returning()
  return ok(res, updated)
})