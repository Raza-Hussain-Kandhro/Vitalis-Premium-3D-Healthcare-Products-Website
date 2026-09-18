/**
 * Typed-ish REST client for the Vercel serverless API in /api.
 * Same-origin in production, so API_BASE defaults to "/api".
 */

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'
const TOKEN_KEY = 'vitalis.token'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* storage unavailable — ignore */
  }
}

export class ApiError extends Error {
  constructor(message, { status, fieldErrors } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors ?? null
  }
}

async function request(path, { method = 'GET', body, auth = false, signal } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    signal,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const text = await res.text()
  const payload = text ? JSON.parse(text) : {}

  if (!res.ok) {
    throw new ApiError(payload?.error?.message ?? `Request failed (${res.status})`, {
      status: res.status,
      fieldErrors: payload?.error?.fieldErrors,
    })
  }
  return payload.data ?? payload
}

/* ---------------- Public endpoints ---------------- */

/** GET /api/health */
export const checkHealth = () => request('/health')

/** GET /api/products?category=&search= */
export function fetchProducts({ category, search, signal } = {}) {
  const qs = new URLSearchParams()
  if (category && category !== 'all') qs.set('category', category)
  if (search) qs.set('search', search)
  const suffix = qs.toString() ? `?${qs}` : ''
  return request(`/products${suffix}`, { signal })
}

/** GET /api/products/:slug */
export const fetchProduct = (slug) => request(`/products/${encodeURIComponent(slug)}`)

/** GET /api/gallery?category= */
export function fetchGallery({ category, signal } = {}) {
  const suffix = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : ''
  return request(`/gallery${suffix}`, { signal })
}

/** POST /api/enquiries — contact / enquiry form */
export const submitEnquiry = (payload) => request('/enquiries', { method: 'POST', body: payload })

/** POST /api/appointments — booking form */
export const bookAppointment = (payload) => request('/appointments', { method: 'POST', body: payload })

/** POST /api/waitlist — early-access email capture */
export const joinWaitlist = (email, source = 'home-cta') =>
  request('/waitlist', { method: 'POST', body: { email, source } })

/* ---------------- Auth + private endpoints ---------------- */

export async function register(payload) {
  const data = await request('/auth/register', { method: 'POST', body: payload })
  if (data?.token) setToken(data.token)
  return data
}

export async function login(payload) {
  const data = await request('/auth/login', { method: 'POST', body: payload })
  if (data?.token) setToken(data.token)
  return data
}

export const logout = () => setToken(null)

/** GET /api/me — current user profile (JWT Bearer) */
export const fetchMe = () => request('/me', { auth: true })

/** GET /api/enquiries — admin only */
export const fetchEnquiries = () => request('/enquiries', { auth: true })

/** GET /api/appointments — admin/staff only */
export const fetchAppointments = () => request('/appointments', { auth: true })

/** GET /api/waitlist — admin only */
export const fetchWaitlist = () => request('/waitlist', { auth: true })

/** GET /api/records — private */
export const fetchRecords = () => request('/records', { auth: true })

/** POST /api/records — private */
export const createRecord = (payload) => request('/records', { method: 'POST', body: payload, auth: true })

/** PUT /api/records/:id — owner/admin */
export const updateRecord = (id, payload) =>
  request(`/records/${id}`, { method: 'PUT', body: payload, auth: true })

/** DELETE /api/records/:id — owner/admin */
export const deleteRecord = (id) => request(`/records/${id}`, { method: 'DELETE', auth: true })

/** POST /api/products — admin only */
export const createProduct = (payload) => request('/products', { method: 'POST', body: payload, auth: true })

/** PUT /api/products/:id — admin only */
export const updateProduct = (id, payload) =>
  request(`/products/${id}`, { method: 'PUT', body: payload, auth: true })

/** DELETE /api/products/:id — admin only */
export const deleteProduct = (id) => request(`/products/${id}`, { method: 'DELETE', auth: true })

/** POST /api/gallery — admin only */
export const createGalleryItem = (payload) => request('/gallery', { method: 'POST', body: payload, auth: true })

/** PUT /api/gallery/:id — admin only */
export const updateGalleryItem = (id, payload) =>
  request(`/gallery/${id}`, { method: 'PUT', body: payload, auth: true })

/** DELETE /api/gallery/:id — admin only */
export const deleteGalleryItem = (id) => request(`/gallery/${id}`, { method: 'DELETE', auth: true })

/** PUT /api/enquiries/:id — admin only, updates status */
export const updateEnquiryStatus = (id, status) =>
  request(`/enquiries/${id}`, { method: 'PUT', body: { status }, auth: true })

/** PUT /api/appointments/:id — admin/staff only, updates status */
export const updateAppointmentStatus = (id, status) =>
  request(`/appointments/${id}`, { method: 'PUT', body: { status }, auth: true })

export { API_BASE }
