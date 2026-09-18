import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Plus, Pencil, Trash2, X, LogOut } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import { GlassCard, glowButtonClasses } from '../components/ui/ui-bits'
import {
  fetchMe,
  logout,
  ApiError,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from '../services/api'

const inputClass =
  'glass h-10 w-full rounded-lg px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:border-neon-cyan/50 focus:ring-neon-cyan/30'

const PRODUCT_CATEGORIES = ['monitoring', 'diagnostics', 'respiratory', 'recovery', 'consumables']
const GALLERY_CATEGORIES = ['facility', 'product', 'deployment', 'team']

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-white/60">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

/* ---------------------------- Products ---------------------------- */

function emptyProduct() {
  return { slug: '', name: '', category: PRODUCT_CATEGORIES[0], shortDescription: '', price: '', imageUrl: '', inStock: true }
}

function ProductForm({ initial, onCancel, onSaved }) {
  const [form, setForm] = useState(initial ?? emptyProduct())
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const isEdit = Boolean(initial?.id)

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('submitting')
    setError('')
    try {
      const payload = {
        slug: form.slug.trim(),
        name: form.name.trim(),
        category: form.category,
        shortDescription: form.shortDescription.trim(),
        price: Number(form.price),
        imageUrl: form.imageUrl.trim() || undefined,
        inStock: Boolean(form.inStock),
      }
      const saved = isEdit ? await updateProduct(initial.id, payload) : await createProduct(payload)
      onSaved(saved)
    } catch (err) {
      setError(err.message ?? 'Save failed.')
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-2">
      <Field label="Slug (unique, lowercase-with-hyphens)">
        <input
          id="product-slug"
          name="slug"
          className={inputClass}
          value={form.slug}
          onChange={(e) => set('slug', e.target.value)}
          required
          disabled={isEdit}
        />
      </Field>
      <Field label="Name">
        <input
          id="product-name"
          name="name"
          className={inputClass}
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          required
        />
      </Field>
      <Field label="Category">
        <select id="product-category" name="category" className={inputClass} value={form.category} onChange={(e) => set('category', e.target.value)}>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Price (USD)">
        <input
          id="product-price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          className={inputClass}
          value={form.price}
          onChange={(e) => set('price', e.target.value)}
          required
        />
      </Field>
      <Field label="Short description">
        <input
          id="product-shortDescription"
          name="shortDescription"
          className={inputClass}
          value={form.shortDescription}
          onChange={(e) => set('shortDescription', e.target.value)}
          required
        />
      </Field>
      <Field label="Image URL">
        <input
          id="product-imageUrl"
          name="imageUrl"
          className={inputClass}
          value={form.imageUrl}
          onChange={(e) => set('imageUrl', e.target.value)}
        />
      </Field>
      <label className="flex items-center gap-2 text-sm text-white/70 sm:col-span-2">
        <input
          id="product-inStock"
          name="inStock"
          type="checkbox"
          checked={Boolean(form.inStock)}
          onChange={(e) => set('inStock', e.target.checked)}
        />
        In stock
      </label>

      {error && <p className="text-xs text-rose-400 sm:col-span-2">{error}</p>}

      <div className="flex gap-3 sm:col-span-2">
        <button type="submit" disabled={status === 'submitting'} className={`${glowButtonClasses('primary', 'sm')} disabled:opacity-60`}>
          {status === 'submitting' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isEdit ? 'Save changes' : 'Add product'}
        </button>
        <button type="button" onClick={onCancel} className={glowButtonClasses('ghost', 'sm')}>
          <X className="h-4 w-4" /> Cancel
        </button>
      </div>
    </form>
  )
}

function ProductsManager() {
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading')
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchProducts()
      .then((rows) => setProducts(rows))
      .catch(() => {})
      .finally(() => setStatus('ready'))
  }, [])

  async function handleDelete(id) {
    if (!window.confirm('Delete this product? This cannot be undone.')) return
    try {
      await deleteProduct(id)
      setProducts((rows) => rows.filter((r) => r.id !== id))
    } catch (err) {
      alert(err.message ?? 'Delete failed.')
    }
  }

  return (
    <GlassCard>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-white/80">Products ({products.length})</h2>
        {!showAdd && (
          <button onClick={() => setShowAdd(true)} className={glowButtonClasses('ghost', 'sm')}>
            <Plus className="h-4 w-4" /> Add product
          </button>
        )}
      </div>

      {showAdd && (
        <div className="mb-6">
          <ProductForm
            onCancel={() => setShowAdd(false)}
            onSaved={(p) => {
              setProducts((rows) => [p, ...rows])
              setShowAdd(false)
            }}
          />
        </div>
      )}

      {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-white/40" />}

      <div className="flex flex-col gap-3">
        {products.map((p) =>
          editingId === p.id ? (
            <ProductForm
              key={p.id}
              initial={p}
              onCancel={() => setEditingId(null)}
              onSaved={(updated) => {
                setProducts((rows) => rows.map((r) => (r.id === updated.id ? updated : r)))
                setEditingId(null)
              }}
            />
          ) : (
            <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white/85">{p.name}</p>
                <p className="truncate text-xs text-white/40">
                  {p.category} · ${p.price} · {p.slug}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => setEditingId(p.id)} className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="rounded-lg p-2 text-white/50 hover:bg-rose-500/10 hover:text-rose-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ),
        )}
      </div>
    </GlassCard>
  )
}

/* ---------------------------- Gallery ---------------------------- */

function emptyGalleryItem() {
  return { title: '', caption: '', category: GALLERY_CATEGORIES[0], imageUrl: '', tone: '' }
}

function GalleryForm({ initial, onCancel, onSaved }) {
  const [form, setForm] = useState(initial ?? emptyGalleryItem())
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const isEdit = Boolean(initial?.id)

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('submitting')
    setError('')
    try {
      const payload = {
        title: form.title.trim(),
        caption: form.caption.trim() || undefined,
        category: form.category,
        imageUrl: form.imageUrl.trim() || undefined,
        tone: form.tone.trim() || undefined,
      }
      const saved = isEdit ? await updateGalleryItem(initial.id, payload) : await createGalleryItem(payload)
      onSaved(saved)
    } catch (err) {
      setError(err.message ?? 'Save failed.')
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-2">
      <Field label="Title">
        <input
          id="gallery-title"
          name="title"
          className={inputClass}
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          required
        />
      </Field>
      <Field label="Category">
        <select id="gallery-category" name="category" className={inputClass} value={form.category} onChange={(e) => set('category', e.target.value)}>
          {GALLERY_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Caption">
        <input
          id="gallery-caption"
          name="caption"
          className={inputClass}
          value={form.caption}
          onChange={(e) => set('caption', e.target.value)}
        />
      </Field>
      <Field label="Image URL">
        <input
          id="gallery-imageUrl"
          name="imageUrl"
          className={inputClass}
          value={form.imageUrl}
          onChange={(e) => set('imageUrl', e.target.value)}
        />
      </Field>

      {error && <p className="text-xs text-rose-400 sm:col-span-2">{error}</p>}

      <div className="flex gap-3 sm:col-span-2">
        <button type="submit" disabled={status === 'submitting'} className={`${glowButtonClasses('primary', 'sm')} disabled:opacity-60`}>
          {status === 'submitting' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isEdit ? 'Save changes' : 'Add item'}
        </button>
        <button type="button" onClick={onCancel} className={glowButtonClasses('ghost', 'sm')}>
          <X className="h-4 w-4" /> Cancel
        </button>
      </div>
    </form>
  )
}

function GalleryManager() {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchGallery()
      .then((rows) => setItems(rows))
      .catch(() => {})
      .finally(() => setStatus('ready'))
  }, [])

  async function handleDelete(id) {
    if (!window.confirm('Delete this gallery item? This cannot be undone.')) return
    try {
      await deleteGalleryItem(id)
      setItems((rows) => rows.filter((r) => r.id !== id))
    } catch (err) {
      alert(err.message ?? 'Delete failed.')
    }
  }

  return (
    <GlassCard>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-white/80">Gallery ({items.length})</h2>
        {!showAdd && (
          <button onClick={() => setShowAdd(true)} className={glowButtonClasses('ghost', 'sm')}>
            <Plus className="h-4 w-4" /> Add item
          </button>
        )}
      </div>

      {showAdd && (
        <div className="mb-6">
          <GalleryForm
            onCancel={() => setShowAdd(false)}
            onSaved={(item) => {
              setItems((rows) => [item, ...rows])
              setShowAdd(false)
            }}
          />
        </div>
      )}

      {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-white/40" />}

      <div className="flex flex-col gap-3">
        {items.map((item) =>
          editingId === item.id ? (
            <GalleryForm
              key={item.id}
              initial={item}
              onCancel={() => setEditingId(null)}
              onSaved={(updated) => {
                setItems((rows) => rows.map((r) => (r.id === updated.id ? updated : r)))
                setEditingId(null)
              }}
            />
          ) : (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white/85">{item.title}</p>
                <p className="truncate text-xs text-white/40">{item.category}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => setEditingId(item.id)} className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="rounded-lg p-2 text-white/50 hover:bg-rose-500/10 hover:text-rose-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ),
        )}
      </div>
    </GlassCard>
  )
}

/* ---------------------------- Page ---------------------------- */

export default function AdminCatalog() {
  const navigate = useNavigate()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchMe()
      .then((user) => {
        if (cancelled) return
        if (user.role !== 'admin') {
          navigate('/admin/login')
          return
        }
        setChecked(true)
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          navigate('/admin/login')
        }
      })
    return () => {
      cancelled = true
    }
  }, [navigate])

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  if (!checked) {
    return (
      <div className="flex justify-center py-24 text-white/50">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <PageHeader tag="Staff dashboard" title="Manage products &" highlight="gallery." />
      <section className="px-6 pb-28">
        <div className="mx-auto max-w-shell">
          <div className="mb-6 flex justify-end">
            <button onClick={handleLogout} className={glowButtonClasses('ghost', 'sm')}>
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
          <div className="grid gap-8">
            <ProductsManager />
            <GalleryManager />
          </div>
        </div>
      </section>
    </>
  )
}
