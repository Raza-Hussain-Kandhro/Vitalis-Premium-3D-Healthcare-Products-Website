/**
 * POST /api/appointments — booking request (public, validated).
 * GET  /api/appointments — admin/staff schedule listing (JWT Bearer).
 * PUT  /api/appointments/:id — update status (admin/staff only).
 * (Combined into one file via a catch-all route to stay under Vercel's function limit.)
 */

import { asc, eq } from 'drizzle-orm'
import { requireDb } from '../_lib/db.js'
import { appointments } from '../_lib/schema.js'
import { HttpError, handler, ok, parseWith, readBody } from '../_lib/http.js'
import { appointmentSchema, appointmentStatusSchema } from '../_lib/validators.js'
import { requireAuth } from '../_lib/auth.js'

export default handler(['GET', 'POST', 'PUT', 'PATCH'], async (req, res) => {
  const [id] = req.query.params ?? []
  const db = requireDb()

  // ---- Item level: /api/appointments/:id — admin/staff only ----
  if (id) {
    const actor = requireAuth(req)
    if (!['admin', 'staff'].includes(actor.role)) {
      throw new HttpError(403, 'forbidden', 'Staff access required.')
    }

    const [existing] = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1)
    if (!existing) throw new HttpError(404, 'not_found', 'No appointment exists with that id.')

    const { status } = parseWith(appointmentStatusSchema, readBody(req))
    const [updated] = await db.update(appointments).set({ status }).where(eq(appointments.id, id)).returning()
    return ok(res, updated)
  }

  // ---- Collection level: /api/appointments ----
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
