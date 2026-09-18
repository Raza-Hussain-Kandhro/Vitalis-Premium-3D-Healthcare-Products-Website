/** POST /api/auth/register — create user + profile, return JWT. */

import { eq } from 'drizzle-orm'
import { requireDb } from '../_lib/db.js'
import { profiles, users } from '../_lib/schema.js'
import { HttpError, handler, ok, parseWith, readBody } from '../_lib/http.js'
import { registerSchema } from '../_lib/validators.js'
import { hashPassword, signToken } from '../_lib/auth.js'

export default handler(['POST'], async (req, res) => {
  const payload = parseWith(registerSchema, readBody(req))
  const db = requireDb()
  const email = payload.email.toLowerCase()

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
  if (existing) throw new HttpError(409, 'email_taken', 'An account with that email already exists.')

  const passwordHash = await hashPassword(payload.password)

  const [user] = await db
    .insert(users)
    .values({ email, passwordHash })
    .returning({ id: users.id, email: users.email, role: users.role })

  await db.insert(profiles).values({
    id: user.id,
    fullName: payload.fullName,
    organization: payload.organization ?? null,
    registrationId: payload.registrationId ?? null,
  })

  return ok(res, { token: signToken(user), user }, 201)
})
