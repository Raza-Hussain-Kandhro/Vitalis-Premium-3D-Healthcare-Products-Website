/** GET /api/me — current user + profile (JWT Bearer). */

import { eq } from 'drizzle-orm'
import { requireDb } from './_lib/db.js'
import { profiles, users } from './_lib/schema.js'
import { HttpError, handler, ok } from './_lib/http.js'
import { requireAuth } from './_lib/auth.js'

export default handler(['GET'], async (req, res) => {
  const actor = requireAuth(req)
  const db = requireDb()

  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      fullName: profiles.fullName,
      organization: profiles.organization,
      registrationId: profiles.registrationId,
      avatarUrl: profiles.avatarUrl,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.id, users.id))
    .where(eq(users.id, actor.id))
    .limit(1)

  if (!row) throw new HttpError(404, 'not_found', 'Account no longer exists.')
  return ok(res, row)
})
