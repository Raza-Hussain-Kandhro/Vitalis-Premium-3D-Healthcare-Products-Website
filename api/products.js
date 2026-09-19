/**
 * GET    /api/products?category=&search=&limit= — public catalogue listing.
 * GET    /api/products/:slug — single product detail (public).
 * POST   /api/products — create a product (admin only).
 * PUT    /api/products/:id — update a product (admin only).
 * DELETE /api/products/:id — delete a product (admin only).
 * A vercel.json rewrite sends /api/products/:slug here as ?slug=.
 */

import { and, asc, ilike, or, eq } from 'drizzle-orm'
import { requireDb } from './_lib/db.js'
import { products } from './_lib/schema.js'
import { HttpError, handler, ok, parseWith, readBody } from './_lib/http.js'
import { productQuerySchema, productCreateSchema, productUpdateSchema } from './_lib/validators.js'
import { requireAuth } from './_lib/auth.js'

export default handler(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], async (req, res) => {
  const { slug: param } = req.query
  const db = requireDb()

  // ---- Collection level: /api/products ----
  if (!param) {
    if (req.method === 'POST') {
      const actor = requireAuth(req)
      if (actor.role !== 'admin') throw new HttpError(403, 'forbidden', 'Admin access required.')
      const payload = parseWith(productCreateSchema, readBody(req))
      const [created] = await db.insert(products).values(payload).returning()
      return ok(res, created, 201)
    }

    const { category, search, limit = 60 } = parseWith(productQuerySchema, req.query ?? {})
    const filters = []
    if (category) filters.push(eq(products.category, category))
    if (search) {
      filters.push(or(ilike(products.name, `%${search}%`), ilike(products.shortDescription, `%${search}%`)))
    }

    const rows = await db
      .select()
      .from(products)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(asc(products.sortOrder), asc(products.name))
      .limit(limit)

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return ok(res, rows)
  }

  // ---- Item level: /api/products/:slugOrId ----
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
