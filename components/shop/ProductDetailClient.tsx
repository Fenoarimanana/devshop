'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ShoppingCart, ExternalLink, Tag, Package, ArrowLeft, Check } from 'lucide-react'
import { ProductWithCategory } from '@/types'
import { useCart } from '@/components/layout/CartProvider'
import { formatPrice, cn } from '@/lib/utils'

const TYPE_COLORS: Record<string, string> = {
  TEMPLATE: 'text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10',
  PLUGIN: 'text-neon-purple border-neon-purple/30 bg-neon-purple/10',
  SAAS_ACCESS: 'text-neon-green border-neon-green/30 bg-neon-green/10',
  EBOOK: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  COURSE: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
  OTHER: 'text-muted-foreground border-border bg-muted',
}

export function ProductDetailClient({ product, locale }: { product: ProductWithCategory; locale: string }) {
  const t = useTranslations('products')
  const tCommon = useTranslations('common')
  const { addItem, hasItem } = useCart()
  const inCart = hasItem(product.id)

  const name = locale === 'fr' ? product.name : product.nameEn
  const description = locale === 'fr' ? product.description : product.descriptionEn

  return (
    <div className="container mx-auto px-4 py-12">
      <Link
        href={`/${locale}/products`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {tCommon('back')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative"
        >
          <div className="relative aspect-video rounded-2xl overflow-hidden glass-card">
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt={name} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                <span className="font-display text-6xl font-bold text-gradient-cyan">
                  {name.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          {product.demoUrl && (
            <a
              href={product.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-muted hover:bg-secondary text-sm font-medium transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              {t('demo')}
            </a>
          )}
        </motion.div>

        {/* Right: Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium border', TYPE_COLORS[product.type])}>
              {t(`type.${product.type}`)}
            </span>
            {product.category && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium border border-border bg-muted text-muted-foreground">
                {product.category.name}
              </span>
            )}
            {product.featured && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium border border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
                ⭐ Featured
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4 leading-tight">{name}</h1>

          <p className="text-muted-foreground leading-relaxed mb-8">{description}</p>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {product.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-xs text-muted-foreground">
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Price + actions */}
          <div className="glass-card rounded-2xl p-6 mt-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-muted-foreground font-mono mb-1">{t('price')}</p>
                <p className="font-display text-4xl font-bold text-gradient-cyan">
                  {formatPrice(product.price)}
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p className="flex items-center gap-1 justify-end">
                  <Package className="w-3 h-3" /> {t('downloadAfterPurchase')}
                </p>
              </div>
            </div>

            <button
              onClick={() => !inCart && addItem({
                id: product.id,
                name: product.name,
                nameEn: product.nameEn,
                price: product.price,
                imageUrl: product.imageUrl,
                slug: product.slug,
                quantity: 1,
                type: product.type,
              })}
              disabled={inCart}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all',
                inCart
                  ? 'bg-primary/10 text-primary cursor-default border border-primary/30'
                  : 'bg-primary text-primary-foreground hover:opacity-90 glow-cyan'
              )}
            >
              {inCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              {inCart ? '✓ In cart' : t('addToCart')}
            </button>

            <p className="text-center text-xs text-muted-foreground mt-3">
              🔒 Secure payment via NOWPayments · USDT TRC-20 & 300+ crypto
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
