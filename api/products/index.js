/**
 * GET  /api/products?category=&search=&limit= — public catalogue listing.
 * POST /api/products — create a product (admin only).
 */

import { and, asc, ilike, or, eq } from 'drizzle-orm'
import { requireDb } from '../_lib/db.js'
import { products } from '../_lib/schema.js'
import { HttpError, handler, ok, parseWith, readBody } from '../_lib/http.js'
import { productQuerySchema, productCreateSchema } from '../_lib/validators.js'
import { requireAuth } from '../_lib/auth.js'

export default handler(['GET', 'POST'], async (req, res) => {
  const db = requireDb()

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
})