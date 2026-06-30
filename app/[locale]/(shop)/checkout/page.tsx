'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ShieldCheck, Loader2, Bitcoin } from 'lucide-react'
import { useCart } from '@/components/layout/CartProvider'
import { formatPrice } from '@/lib/utils'

export default function CheckoutPage() {
  const t = useTranslations('checkout')
  const locale = useLocale()
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (items.length === 0) router.push(`/${locale}/cart`)
  }, [items.length, locale, router])

  async function handleCheckout() {
    if (items.length === 0) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map((i) => ({ productId: i.id, quantity: 1 })) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create order')

      if (data.paymentUrl) {
        clearCart()
        window.location.href = data.paymentUrl
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="font-display text-3xl font-bold mb-8">{t('title')}</h1>

      <div className="glass-card rounded-2xl p-6 mb-6">
        <h2 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">{t('summary')}</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{locale === 'fr' ? item.name : item.nameEn}</span>
              <span className="font-medium">{formatPrice(item.price)}</span>
            </div>
          ))}
          <div className="h-px bg-border my-3" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-gradient-cyan">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4 mb-6 flex items-start gap-3">
        <Bitcoin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-sm text-muted-foreground">{t('cryptoInfo')}</p>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-destructive text-sm mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20"
        >
          {error}
        </motion.p>
      )}

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-all glow-cyan disabled:opacity-50"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> {t('processing')}</>
        ) : (
          <><ShieldCheck className="w-5 h-5" /> {t('payAmount', { amount: formatPrice(total) })}</>
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground mt-4">
        🔒 You&apos;ll be redirected to a secure NOWPayments page
      </p>
    </div>
  )
}
