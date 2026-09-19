/**
 * GET    /api/gallery?category= — public gallery items.
 * POST   /api/gallery — create a gallery item (admin only).
 * PUT    /api/gallery/:id — update a gallery item (admin only).
 * DELETE /api/gallery/:id — delete a gallery item (admin only).
 * (Combined into one file via a catch-all route to stay under Vercel's function limit.)
 */

import { asc, eq } from 'drizzle-orm'
import { requireDb } from '../_lib/db.js'
import { galleryItems } from '../_lib/schema.js'
import { HttpError, handler, ok, parseWith, readBody } from '../_lib/http.js'
import { galleryQuerySchema, galleryCreateSchema, galleryUpdateSchema } from '../_lib/validators.js'
import { requireAuth } from '../_lib/auth.js'

export default handler(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], async (req, res) => {
  const [id] = req.query.params ?? []
  const db = requireDb()

  // ---- Collection level: /api/gallery ----
  if (!id) {
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
  }

  // ---- Item level: /api/gallery/:id — admin only ----
  const actor = requireAuth(req)
  if (actor.role !== 'admin') throw new HttpError(403, 'forbidden', 'Admin access required.')

  const [existing] = await db.select().from(galleryItems).where(eq(galleryItems.id, id)).limit(1)
  if (!existing) throw new HttpError(404, 'not_found', 'No gallery item exists with that id.')

  if (req.method === 'DELETE') {
    await db.delete(galleryItems).where(eq(galleryItems.id, id))
    return ok(res, { id, deleted: true })
  }

  const payload = parseWith(galleryUpdateSchema, readBody(req))
  const [updated] = await db.update(galleryItems).set(payload).where(eq(galleryItems.id, id)).returning()
  return ok(res, updated)
})
