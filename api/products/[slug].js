/**
 * GET    /api/products/:slug — single product detail (public, lookup by slug).
 * PUT    /api/products/:id   — update a product (admin only, lookup by id).
 * DELETE /api/products/:id   — delete a product (admin only, lookup by id).
 */

import { eq } from 'drizzle-orm'
import { requireDb } from '../_lib/db.js'
import { products } from '../_lib/schema.js'
import { HttpError, handler, ok, parseWith, readBody } from '../_lib/http.js'
import { productUpdateSchema } from '../_lib/validators.js'
import { requireAuth } from '../_lib/auth.js'

export default handler(['GET', 'PUT', 'PATCH', 'DELETE'], async (req, res) => {
  const { slug: param } = req.query
  if (!param || typeof param !== 'string') {
    throw new HttpError(400, 'bad_request', 'A product identifier is required.')
  }

  const db = requireDb()

  if (req.method === 'GET') {
    const [product] = await db.select().from(products).where(eq(products.slug, param)).limit(1)
    if (!product) throw new HttpError(404, 'not_found', 'No product exists with that slug.')
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return ok(res, product)
  }

  const actor = requireAuth(req)
  if (actor.role !== 'admin') throw new HttpError(403, 'forbidden', 'Admin access required.')

  const [existing] = await db.select().from(products).where(eq(products.id, param)).limit(1)
  if (!existing) throw new HttpError(404, 'not_found', 'No product exists with that id.')

  if (req.method === 'DELETE') {
    await db.delete(products).where(eq(products.id, param))
    return ok(res, { id: param, deleted: true })
  }

  const payload = parseWith(productUpdateSchema, readBody(req))
  const [updated] = await db.update(products).set(payload).where(eq(products.id, param)).returning()
  return ok(res, updated)
})