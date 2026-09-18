/**
 * POST /api/enquiries — contact form submission (public, validated server-side).
 * GET  /api/enquiries — admin-only inbox listing (JWT Bearer, role=admin).
 */

import { desc } from 'drizzle-orm'
import { requireDb } from '../_lib/db.js'
import { enquiries } from '../_lib/schema.js'
import { HttpError, clientIp, handler, ok, parseWith, readBody } from '../_lib/http.js'
import { enquirySchema } from '../_lib/validators.js'
import { requireAuth } from '../_lib/auth.js'

export default handler(['GET', 'POST'], async (req, res) => {
  const db = requireDb()

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
