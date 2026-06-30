'use client'
import { useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { ProductCard } from './ProductCard'
import { ProductWithCategory, Category } from '@/types'
import { cn } from '@/lib/utils'

const PRODUCT_TYPES = ['TEMPLATE', 'PLUGIN', 'SAAS_ACCESS', 'EBOOK', 'COURSE', 'OTHER']

export function ProductsClient({
  products,
  categories,
}: {
  products: ProductWithCategory[]
  categories: Category[]
}) {
  const t = useTranslations('products')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [showFilters, setShowFilters] = useState(false)

  const currentType = searchParams.get('type') || ''
  const currentCategory = searchParams.get('category') || ''
  const currentSort = searchParams.get('sort') || 'newest'
  const currentQ = searchParams.get('q') || ''

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  const hasFilters = currentType || currentCategory || currentQ

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground text-sm">{products.length} products</p>
      </div>

      {/* Search + controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('search')}
            defaultValue={currentQ}
            onChange={(e) => updateParam('q', e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
              showFilters ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-muted border-border hover:border-primary/30'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t('filter')}
          </button>

          <select
            value={currentSort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          >
            {Object.entries({
              newest: t('sortOptions.newest'),
              oldest: t('sortOptions.oldest'),
              priceAsc: t('sortOptions.priceAsc'),
              priceDesc: t('sortOptions.priceDesc'),
            }).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass-card rounded-xl p-4 mb-6"
        >
          <div className="flex flex-wrap gap-4">
            {/* Type filter */}
            <div>
              <p className="text-xs text-muted-foreground font-mono mb-2">Type</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => updateParam('type', '')}
                  className={cn('px-3 py-1 rounded-lg text-xs font-medium border transition-all', !currentType ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-border hover:border-primary/40')}
                >
                  All
                </button>
                {PRODUCT_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => updateParam('type', currentType === type ? '' : type)}
                    className={cn('px-3 py-1 rounded-lg text-xs font-medium border transition-all', currentType === type ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-border hover:border-primary/40')}
                  >
                    {t(`type.${type}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter */}
            {categories.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground font-mono mb-2">Category</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => updateParam('category', '')}
                    className={cn('px-3 py-1 rounded-lg text-xs font-medium border transition-all', !currentCategory ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-border hover:border-primary/40')}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateParam('category', currentCategory === cat.slug ? '' : cat.slug)}
                      className={cn('px-3 py-1 rounded-lg text-xs font-medium border transition-all', currentCategory === cat.slug ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-border hover:border-primary/40')}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {hasFilters && (
            <button
              onClick={() => { updateParam('type', ''); updateParam('category', ''); updateParam('q', '') }}
              className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </motion.div>
      )}

      {/* Grid */}
      {isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl aspect-[4/5] animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <p className="text-4xl mb-4">🔍</p>
          <p className="font-display text-xl font-semibold mb-2">{t('noProducts')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
