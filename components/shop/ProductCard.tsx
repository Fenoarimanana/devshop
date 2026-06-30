'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ShoppingCart, ExternalLink, Star } from 'lucide-react'
import { ProductWithCategory } from '@/types'
import { useCart } from '@/components/layout/CartProvider'
import { formatPrice, cn } from '@/lib/utils'

interface ProductCardProps {
  product: ProductWithCategory
  index?: number
}

const TYPE_COLORS: Record<string, string> = {
  TEMPLATE: 'text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10',
  PLUGIN: 'text-neon-purple border-neon-purple/30 bg-neon-purple/10',
  SAAS_ACCESS: 'text-neon-green border-neon-green/30 bg-neon-green/10',
  EBOOK: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  COURSE: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
  OTHER: 'text-muted-foreground border-border bg-muted',
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const locale = useLocale()
  const t = useTranslations('products')
  const { addItem, hasItem } = useCart()
  const alreadyInCart = hasItem(product.id)

  const name = locale === 'fr' ? product.name : product.nameEn

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!alreadyInCart) {
      addItem({
        id: product.id,
        name: product.name,
        nameEn: product.nameEn,
        price: product.price,
        imageUrl: product.imageUrl,
        slug: product.slug,
        quantity: 1,
        type: product.type,
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
    >
      <Link href={`/${locale}/products/${product.slug}`} className="group block">
        <div className="glass-card rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
          {/* Image */}
          <div className="relative aspect-video bg-muted overflow-hidden">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="font-display text-2xl font-bold text-gradient-cyan">
                    {name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              </div>
            )}
            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-1.5">
              {product.featured && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 text-yellow-400 text-[10px] font-medium backdrop-blur-sm">
                  <Star className="w-2.5 h-2.5 fill-yellow-400" />
                  {t('featured')}
                </span>
              )}
              <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium border backdrop-blur-sm', TYPE_COLORS[product.type])}>
                {t(`type.${product.type}`)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-1 group-hover:text-primary transition-colors">
              {name}
            </h3>
            {product.category && (
              <p className="text-[11px] text-muted-foreground font-mono mb-3">{product.category.name}</p>
            )}

            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-lg text-gradient-cyan">
                {formatPrice(product.price)}
              </span>

              <div className="flex gap-1.5" onClick={(e) => e.preventDefault()}>
                {product.demoUrl && (
                  <a
                    href={product.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-muted hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={handleAddToCart}
                  disabled={alreadyInCart}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    alreadyInCart
                      ? 'bg-primary/10 text-primary cursor-default'
                      : 'bg-primary text-primary-foreground hover:opacity-90'
                  )}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  {alreadyInCart ? '✓' : t('addToCart')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
