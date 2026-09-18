/**
 * GET  /api/gallery?category= — public gallery items.
 * POST /api/gallery — create a gallery item (admin only).
 */

import { asc, eq } from 'drizzle-orm'
import { requireDb } from '../_lib/db.js'
import { galleryItems } from '../_lib/schema.js'
import { HttpError, handler, ok, parseWith, readBody } from '../_lib/http.js'
import { galleryQuerySchema, galleryCreateSchema } from '../_lib/validators.js'
import { requireAuth } from '../_lib/auth.js'

export default handler(['GET', 'POST'], async (req, res) => {
  const db = requireDb()

  if (req.method === 'POST') {
    const actor = requireAuth(req)
    if (actor.role !== 'admin') throw new HttpError(403, 'forbidden', 'Admin access required.')
    const payload = parseWith(galleryCreateSchema, readBody(req))
    const [created] = await db.insert(galleryItems).values(payload).returning()
    return ok(res, created, 201)
  }

  const { category } = parseWith(galleryQuerySchema, req.query ?? {})

  const rows = await db
    .select()
    .from(galleryItems)
    .where(category ? eq(galleryItems.category, category) : undefined)
    .orderBy(asc(galleryItems.sortOrder), asc(galleryItems.title))
    .limit(60)

  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=600')
  return ok(res, rows)
})
