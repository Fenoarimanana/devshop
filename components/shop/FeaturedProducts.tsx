'use client'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { ProductCard } from './ProductCard'
import { ProductWithCategory } from '@/types'

export function FeaturedProducts({ products }: { products: ProductWithCategory[] }) {
  const t = useTranslations('products')
  const tCommon = useTranslations('common')
  const locale = useLocale()

  if (products.length === 0) return null

  return (
    <section className="container mx-auto px-4 py-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 text-primary text-xs font-mono mb-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t('featured')}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold"
          >
            Top <span className="text-gradient-cyan">picks</span>
          </motion.h2>
        </div>
        <Link
          href={`/${locale}/products`}
          className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
        >
          {tCommon('seeAll')}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>

      <div className="mt-8 text-center md:hidden">
        <Link
          href={`/${locale}/products`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {tCommon('seeAll')} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  )
}
