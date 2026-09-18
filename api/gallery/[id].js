/**
 * PUT    /api/gallery/:id — update a gallery item (admin only).
 * DELETE /api/gallery/:id — delete a gallery item (admin only).
 */

import { eq } from 'drizzle-orm'
import { requireDb } from '../_lib/db.js'
import { galleryItems } from '../_lib/schema.js'
import { HttpError, handler, ok, parseWith, readBody } from '../_lib/http.js'
import { galleryUpdateSchema } from '../_lib/validators.js'
import { requireAuth } from '../_lib/auth.js'

export default handler(['PUT', 'PATCH', 'DELETE'], async (req, res) => {
  const actor = requireAuth(req)
  if (actor.role !== 'admin') throw new HttpError(403, 'forbidden', 'Admin access required.')

  const { id } = req.query
  if (!id || typeof id !== 'string') throw new HttpError(400, 'bad_request', 'A gallery item id is required.')

  const db = requireDb()
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