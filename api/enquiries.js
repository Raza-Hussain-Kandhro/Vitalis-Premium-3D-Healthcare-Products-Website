/**
 * POST /api/enquiries — contact form submission (public, validated).
 * GET  /api/enquiries — admin-only inbox listing.
 * PUT  /api/enquiries/:id — update status (admin only).
 * A vercel.json rewrite sends /api/enquiries/:id here as ?id=.
 */

import { desc, eq } from 'drizzle-orm'
import { requireDb } from './_lib/db.js'
import { enquiries } from './_lib/schema.js'
import { HttpError, clientIp, handler, ok, parseWith, readBody } from './_lib/http.js'
import { enquirySchema, enquiryStatusSchema } from './_lib/validators.js'
import { requireAuth } from './_lib/auth.js'

export default handler(['GET', 'POST', 'PUT', 'PATCH'], async (req, res) => {
  const { id } = req.query
  const db = requireDb()

  if (id) {
    const actor = requireAuth(req)
    if (actor.role !== 'admin') throw new HttpError(403, 'forbidden', 'Admin access required.')

    const [existing] = await db.select().from(enquiries).where(eq(enquiries.id, id)).limit(1)
    if (!existing) throw new HttpError(404, 'not_found', 'No enquiry exists with that id.')

    const { status } = parseWith(enquiryStatusSchema, readBody(req))
    const [updated] = await db.update(enquiries).set({ status }).where(eq(enquiries.id, id)).returning()
    return ok(res, updated)
  }

  if (req.method === 'GET') {
    const actor = requireAuth(req)
    if (actor.role !== 'admin') throw new HttpError(403, 'forbidden', 'Admin access required.')
    const rows = await db.select().from(enquiries).orderBy(desc(enquiries.createdAt)).limit(100)
    return ok(res, rows)
  }

  const payload = parseWith(enquirySchema, readBody(req))
  const [created] = await db
    .insert(enquiries)
    .values({
      ...payload,
      sourceIp: clientIp(req),
      userAgent: req.headers['user-agent']?.slice(0, 500) ?? null,
    })
    .returning({ id: enquiries.id, createdAt: enquiries.createdAt })

  return ok(res, { id: created.id, receivedAt: created.createdAt, message: 'Enquiry received.' }, 201)
})
