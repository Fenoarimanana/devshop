'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Trash2, ArrowRight, Package } from 'lucide-react'
import { useCart } from '@/components/layout/CartProvider'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const t = useTranslations('cart')
  const locale = useLocale()
  const { items, total, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">{t('empty')}</h1>
          <p className="text-muted-foreground mb-8">{t('emptyDesc')}</p>
          <Link
            href={`/${locale}/products`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            {t('continueShopping')} <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold mb-8">{t('title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                className="glass-card rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={locale === 'fr' ? item.name : item.nameEn} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{locale === 'fr' ? item.name : item.nameEn}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{item.type}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold text-gradient-cyan">{formatPrice(item.price)}</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl p-6 sticky top-24">
            <h2 className="font-semibold mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate max-w-[160px]">
                    {locale === 'fr' ? item.name : item.nameEn}
                  </span>
                  <span>{formatPrice(item.price)}</span>
                </div>
              ))}
              <div className="h-px bg-border pt-3 mt-3" />
              <div className="flex justify-between font-bold">
                <span>{t('total')}</span>
                <span className="text-gradient-cyan text-lg">{formatPrice(total)}</span>
              </div>
            </div>

            <Link
              href={`/${locale}/checkout`}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-cyan"
            >
              {t('checkout')} <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={`/${locale}/products`}
              className="block text-center text-sm text-muted-foreground hover:text-foreground mt-4 transition-colors"
            >
              {t('continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
