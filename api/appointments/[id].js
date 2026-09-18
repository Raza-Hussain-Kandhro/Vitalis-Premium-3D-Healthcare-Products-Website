/** PUT /api/appointments/:id — update status (admin/staff only). */

import { eq } from 'drizzle-orm'
import { requireDb } from '../_lib/db.js'
import { appointments } from '../_lib/schema.js'
import { HttpError, handler, ok, parseWith, readBody } from '../_lib/http.js'
import { appointmentStatusSchema } from '../_lib/validators.js'
import { requireAuth } from '../_lib/auth.js'

export default handler(['PUT', 'PATCH'], async (req, res) => {
  const actor = requireAuth(req)
  if (!['admin', 'staff'].includes(actor.role)) {
    throw new HttpError(403, 'forbidden', 'Staff access required.')
  }

  const { id } = req.query
  if (!id || typeof id !== 'string') throw new HttpError(400, 'bad_request', 'An appointment id is required.')

  const db = requireDb()
  const [existing] = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1)
  if (!existing) throw new HttpError(404, 'not_found', 'No appointment exists with that id.')

  const { status } = parseWith(appointmentStatusSchema, readBody(req))
  const [updated] = await db.update(appointments).set({ status }).where(eq(appointments.id, id)).returning()
  return ok(res, updated)
})