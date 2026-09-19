/**
 * POST /api/waitlist — early-access email capture (idempotent on email).
 * GET  /api/waitlist  — admin-only signup listing.
 */

import { desc } from 'drizzle-orm'
import { requireDb } from './_lib/db.js'
import { waitlist } from './_lib/schema.js'
import { HttpError, handler, ok, parseWith, readBody } from './_lib/http.js'
import { waitlistSchema } from './_lib/validators.js'
import { requireAuth } from './_lib/auth.js'

export default handler(['GET', 'POST'], async (req, res) => {
  const db = requireDb()

  if (req.method === 'GET') {
    const actor = requireAuth(req)
    if (actor.role !== 'admin') throw new HttpError(403, 'forbidden', 'Admin access required.')
    const rows = await db.select().from(waitlist).orderBy(desc(waitlist.createdAt)).limit(200)
    return ok(res, rows)
  }

  const { email, source = 'home-cta' } = parseWith(waitlistSchema, readBody(req))

  const [row] = await db
    .insert(waitlist)
    .values({ email: email.toLowerCase(), source })
    .onConflictDoUpdate({ target: waitlist.email, set: { source } })
    .returning({ id: waitlist.id, email: waitlist.email })

  return ok(res, { id: row.id, email: row.email, message: "You're on the list." }, 201)
})
