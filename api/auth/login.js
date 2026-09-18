/** POST /api/auth/login — verify credentials, return JWT. */

import { eq } from 'drizzle-orm'
import { requireDb } from '../_lib/db.js'
import { users } from '../_lib/schema.js'
import { HttpError, handler, ok, parseWith, readBody } from '../_lib/http.js'
import { loginSchema } from '../_lib/validators.js'
import { signToken, verifyPassword } from '../_lib/auth.js'

export default handler(['POST'], async (req, res) => {
  const { email, password } = parseWith(loginSchema, readBody(req))
  const db = requireDb()

  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1)

  // Same error for unknown email and wrong password (no account enumeration).
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new HttpError(401, 'invalid_credentials', 'Email or password is incorrect.')
  }

  const safeUser = { id: user.id, email: user.email, role: user.role }
  return ok(res, { token: signToken(safeUser), user: safeUser })
})
