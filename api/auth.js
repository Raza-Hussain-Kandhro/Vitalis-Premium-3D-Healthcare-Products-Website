/**
 * POST /api/auth/login    — verify credentials, return JWT.
 * POST /api/auth/register — create user + profile, return JWT.
 * A vercel.json rewrite sends both URLs here, with the action in ?action=.
 */

import { eq } from 'drizzle-orm'
import { requireDb } from './_lib/db.js'
import { profiles, users } from './_lib/schema.js'
import { HttpError, handler, ok, parseWith, readBody } from './_lib/http.js'
import { loginSchema, registerSchema } from './_lib/validators.js'
import { hashPassword, signToken, verifyPassword } from './_lib/auth.js'

async function login(req, res, db) {
  const { email, password } = parseWith(loginSchema, readBody(req))

  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1)

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new HttpError(401, 'invalid_credentials', 'Email or password is incorrect.')
  }

  const safeUser = { id: user.id, email: user.email, role: user.role }
  return ok(res, { token: signToken(safeUser), user: safeUser })
}

async function register(req, res, db) {
  const payload = parseWith(registerSchema, readBody(req))
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
}

export default handler(['POST'], async (req, res) => {
  const { action } = req.query
  const db = requireDb()

  if (action === 'login') return login(req, res, db)
  if (action === 'register') return register(req, res, db)

  throw new HttpError(404, 'not_found', 'Unknown auth action.')
})
