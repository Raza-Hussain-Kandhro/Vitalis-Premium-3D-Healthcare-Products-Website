/**
 * Stateless JWT auth — no server-side sessions (Vercel functions are stateless).
 * Secrets come strictly from process.env.
 */

import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { HttpError } from './http.js'

const SECRET = process.env.JWT_SECRET
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d'

function secret() {
  if (!SECRET) throw new HttpError(500, 'jwt_misconfigured', 'JWT_SECRET is not configured.')
  return SECRET
}

export const hashPassword = (plain) => bcrypt.hash(plain, 10)
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash)

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, secret(), { expiresIn: EXPIRES_IN })
}

/** Extracts and verifies the Bearer token. Throws 401 when missing/invalid. */
export function requireAuth(req) {
  const header = req.headers.authorization ?? ''
  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) {
    throw new HttpError(401, 'unauthenticated', 'A Bearer token is required for this endpoint.')
  }
  try {
    const payload = jwt.verify(token, secret())
    return { id: payload.sub, email: payload.email, role: payload.role }
  } catch {
    throw new HttpError(401, 'invalid_token', 'Your session has expired. Please sign in again.')
  }
}

/** Ownership check used by PUT/DELETE /api/records/:id (owner or admin only). */
export function assertOwnerOrAdmin(actor, ownerId) {
  if (actor.role === 'admin' || actor.id === ownerId) return
  throw new HttpError(403, 'forbidden', 'You do not have access to this record.')
}
