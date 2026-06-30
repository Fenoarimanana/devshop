'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Loader2, Zap, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return }

    await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    router.push(`/${locale}`)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-cyber-grid opacity-30" style={{ backgroundSize: '50px 50px' }} />
      <div className="absolute inset-0 bg-hero-glow" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-card rounded-2xl p-8">
          <div className="text-center mb-8">
            <Link href={`/${locale}`} className="inline-flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/30">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span className="font-display font-bold text-lg">Dev<span className="text-gradient-cyan">Shop</span></span>
            </Link>
            <h1 className="font-display text-2xl font-bold">{t('register')}</h1>
            <p className="text-xs text-muted-foreground mt-1">{t('termsAgree')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: t('name'), icon: User, type: 'text', placeholder: 'John Doe' },
              { key: 'email', label: t('email'), icon: Mail, type: 'email', placeholder: 'you@example.com' },
            ].map(({ key, label, icon: Icon, type, placeholder }) => (
              <div key={key}>
                <label className="text-xs text-muted-foreground font-mono block mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={set(key)}
                    required
                    placeholder={placeholder}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
            ))}

            {[
              { key: 'password', label: t('password') },
              { key: 'confirm', label: t('confirmPassword') },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs text-muted-foreground font-mono block mb-1.5">{label}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form[key as keyof typeof form]}
                    onChange={set(key)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                  {key === 'password' && (
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {error && (
              <p className="text-destructive text-sm p-3 rounded-xl bg-destructive/10 border border-destructive/20">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('register')}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t('hasAccount')}{' '}
            <Link href={`/${locale}/auth/login`} className="text-primary hover:underline">{t('signIn')}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
