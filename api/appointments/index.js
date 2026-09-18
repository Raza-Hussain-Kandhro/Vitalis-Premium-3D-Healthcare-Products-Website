/**
 * POST /api/appointments — booking request (public, validated).
 * GET  /api/appointments — admin/staff schedule listing (JWT Bearer).
 */

import { asc } from 'drizzle-orm'
import { requireDb } from '../_lib/db.js'
import { appointments } from '../_lib/schema.js'
import { HttpError, handler, ok, parseWith, readBody } from '../_lib/http.js'
import { appointmentSchema } from '../_lib/validators.js'
import { requireAuth } from '../_lib/auth.js'

export default handler(['GET', 'POST'], async (req, res) => {
  const db = requireDb()

  if (req.method === 'GET') {
    const actor = requireAuth(req)
    if (!['admin', 'staff'].includes(actor.role)) {
      throw new HttpError(403, 'forbidden', 'Staff access required.')
    }
    const rows = await db.select().from(appointments).orderBy(asc(appointments.preferredDate)).limit(100)
    return ok(res, rows)
  }

  const payload = parseWith(appointmentSchema, readBody(req))
  const [created] = await db
    .insert(appointments)
    .values({ ...payload, preferredDate: payload.preferredDate })
    .returning({ id: appointments.id, preferredDate: appointments.preferredDate })

  return ok(
    res,
    { id: created.id, preferredDate: created.preferredDate, status: 'requested', message: 'Booking requested.' },
    201,
  )
})
