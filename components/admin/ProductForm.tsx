'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { Upload, Loader2, Trash2, Save, ExternalLink } from 'lucide-react'
import { slugify } from '@/lib/utils'
import { Category } from '@/types'
import { cn } from '@/lib/utils'

const PRODUCT_TYPES = ['TEMPLATE', 'PLUGIN', 'SAAS_ACCESS', 'EBOOK', 'COURSE', 'OTHER']

interface ProductFormProps {
  categories: Category[]
  initial?: {
    id?: string
    name?: string
    nameEn?: string
    slug?: string
    description?: string
    descriptionEn?: string
    price?: number
    type?: string
    categoryId?: string | null
    imageUrl?: string | null
    fileUrl?: string
    filePublicId?: string | null
    demoUrl?: string | null
    tags?: string[]
    featured?: boolean
    active?: boolean
  }
}

export function ProductForm({ categories, initial = {} }: ProductFormProps) {
  const locale = useLocale()
  const router = useRouter()
  const isEdit = !!initial.id

  const [form, setForm] = useState({
    name: initial.name || '',
    nameEn: initial.nameEn || '',
    slug: initial.slug || '',
    description: initial.description || '',
    descriptionEn: initial.descriptionEn || '',
    price: initial.price?.toString() || '',
    type: initial.type || 'TEMPLATE',
    categoryId: initial.categoryId || '',
    imageUrl: initial.imageUrl || '',
    fileUrl: initial.fileUrl || '',
    filePublicId: initial.filePublicId || '',
    demoUrl: initial.demoUrl || '',
    tags: initial.tags?.join(', ') || '',
    featured: initial.featured || false,
    active: initial.active !== undefined ? initial.active : true,
  })

  const [uploading, setUploading] = useState<'image' | 'file' | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }))

  const handleNameEnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setForm((prev) => ({ ...prev, nameEn: val, slug: isEdit ? prev.slug : slugify(val) }))
  }

  const MAX_UPLOAD_SIZE = 4 * 1024 * 1024 // 4MB, safely under Vercel's 4.5MB request limit

  async function uploadFile(file: File, type: 'image' | 'file') {
    if (file.size > MAX_UPLOAD_SIZE) {
      setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max ${MAX_UPLOAD_SIZE / 1024 / 1024}MB — use an external link (e.g. GitHub Releases) for larger files.`)
      return null
    }
    setUploading(type)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', type)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Upload failed')
      }
      return await res.json()
    } catch (err: any) {
      setError(err.message || 'Upload failed')
      return null
    } finally {
      setUploading(null)
    }
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        categoryId: form.categoryId || null,
      }

      const url = isEdit ? `/api/products/${initial.id}` : '/api/products'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      router.push(`/${locale}/admin/products`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this product? This cannot be undone.')) return
    setDeleting(true)
    await fetch(`/api/products/${initial.id}`, { method: 'DELETE' })
    router.push(`/${locale}/admin/products`)
    router.refresh()
  }

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="text-xs text-muted-foreground font-mono block mb-1.5">{label}</label>
      {children}
    </div>
  )

  const Input = ({ field, ...props }: { field: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      value={form[field as keyof typeof form] as string}
      onChange={field === 'nameEn' ? handleNameEnChange : set(field)}
      className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
      {...props}
    />
  )

  return (
    <div className="md:pt-0 pt-14 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold">{isEdit ? 'Edit Product' : 'New Product'}</h1>
        {isEdit && (
          <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-destructive border border-destructive/20 hover:bg-destructive/10 transition-all">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        )}
      </div>

      <div className="space-y-5">
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">Basic Info</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Name (FR)"><Input field="name" placeholder="Nom du produit" /></Field>
            <Field label="Name (EN)"><Input field="nameEn" placeholder="Product name" /></Field>
          </div>
          <Field label="Slug">
            <div className="relative">
              <Input field="slug" placeholder="product-slug" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">/{form.slug}</span>
            </div>
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Description (FR)">
              <textarea value={form.description} onChange={set('description')} rows={4} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none" />
            </Field>
            <Field label="Description (EN)">
              <textarea value={form.descriptionEn} onChange={set('descriptionEn')} rows={4} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none" />
            </Field>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">Pricing & Type</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Price (USD)"><Input field="price" type="number" step="0.01" min="0" placeholder="29.99" /></Field>
            <Field label="Type">
              <select value={form.type} onChange={set('type')} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                {PRODUCT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Category">
              <select value={form.categoryId} onChange={set('categoryId')} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="">No category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Tags (comma separated)"><Input field="tags" placeholder="nextjs, react, dashboard" /></Field>
          <Field label="Demo URL"><Input field="demoUrl" type="url" placeholder="https://demo.example.com" /></Field>
          <div className="flex gap-6">
            {[{ field: 'featured', label: 'Featured' }, { field: 'active', label: 'Active' }].map(({ field, label }) => (
              <label key={field} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[field as keyof typeof form] as boolean} onChange={set(field)} className="w-4 h-4 rounded accent-primary" />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">Files</p>

          {/* Image upload */}
          <Field label="Product Image">
            <div className="flex gap-3">
              <Input field="imageUrl" placeholder="https://... or upload below" />
              <label className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border border-border cursor-pointer hover:bg-muted transition-all whitespace-nowrap', uploading === 'image' && 'opacity-50')}>
                {uploading === 'image' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const result = await uploadFile(file, 'image')
                  if (result) setForm((prev) => ({ ...prev, imageUrl: result.url }))
                }} />
              </label>
            </div>
          </Field>

          {/* File upload */}
          <Field label="Product File (ZIP, PDF, etc.)">
            <div className="flex gap-3">
              <Input field="fileUrl" placeholder="https://... or upload below" />
              <label className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border border-border cursor-pointer hover:bg-muted transition-all whitespace-nowrap', uploading === 'file' && 'opacity-50')}>
                {uploading === 'file' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload
                <input type="file" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const result = await uploadFile(file, 'file')
                  if (result) setForm((prev) => ({ ...prev, fileUrl: result.url, filePublicId: result.publicId }))
                }} />
              </label>
            </div>
            {form.fileUrl && (
              <a href={form.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary mt-1 hover:underline">
                <ExternalLink className="w-3 h-3" /> Preview file
              </a>
            )}
          </Field>
        </div>

        {error && (
          <p className="text-destructive text-sm p-3 rounded-xl bg-destructive/10 border border-destructive/20">{error}</p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? 'Save Changes' : 'Create Product'}
        </button>
      </div>
    </div>
  )
}
