/**
 * Shared HTTP helpers for every Vercel serverless function.
 * Stateless by design — no filesystem writes, no module-level mutable request state.
 */

const DEFAULT_ALLOWED = ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:3000']

function allowedOrigins() {
  const fromEnv = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const vercelUrl = process.env.VERCEL_URL ? ['https://' + process.env.VERCEL_URL] : []
  return [...fromEnv, ...vercelUrl, ...DEFAULT_ALLOWED]
}

/**
 * Applies CORS headers. Frontend and API share an origin on Vercel, so this
 * mainly covers local dev and any custom domains listed in ALLOWED_ORIGINS.
 * Returns true when the request was a preflight and is already finished.
 */
export function applyCors(req, res) {
  const origin = req.headers.origin
  if (origin && allowedOrigins().includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Max-Age', '86400')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return true
  }
  return false
}

export function ok(res, data, status = 200) {
  return res.status(status).json({ data })
}

export function fail(res, status, code, message, extra = {}) {
  return res.status(status).json({ error: { code, message, ...extra } })
}

export class HttpError extends Error {
  constructor(status, code, message, extra = {}) {
    super(message)
    this.status = status
    this.code = code
    this.extra = extra
  }
}

/** Rejects any method not in the allow-list. */
export function methodGuard(req, res, methods) {
  if (methods.includes(req.method)) return false
  res.setHeader('Allow', methods.join(', '))
  fail(res, 405, 'method_not_allowed', `${req.method} is not allowed on this endpoint.`)
  return true
}

/** Body parsing that tolerates both parsed objects and raw JSON strings. */
export function readBody(req) {
  if (!req.body) return {}
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      throw new HttpError(400, 'invalid_json', 'Request body must be valid JSON.')
    }
  }
  return req.body
}

/** Validates with a Zod schema and returns flattened field errors on failure. */
export function parseWith(schema, payload) {
  const result = schema.safeParse(payload)
  if (!result.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(result.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0]]),
    )
    throw new HttpError(422, 'validation_failed', 'Some fields need attention.', { fieldErrors })
  }
  return result.data
}

/**
 * Wraps a handler with CORS, method guard, and centralised error handling so
 * no function ever leaks a stack trace or hangs past the execution limit.
 */
export function handler(methods, fn) {
  return async (req, res) => {
    if (applyCors(req, res)) return undefined
    if (methodGuard(req, res, methods)) return undefined
    try {
      return await fn(req, res)
    } catch (err) {
      if (err instanceof HttpError) {
        return fail(res, err.status, err.code, err.message, err.extra)
      }
      console.error('[api] unhandled error', err)
      return fail(res, 500, 'internal_error', 'Unexpected server error.')
    }
  }
}

export function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim()
  return req.socket?.remoteAddress ?? null
}
