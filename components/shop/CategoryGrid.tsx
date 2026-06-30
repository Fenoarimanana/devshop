'use client'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { Category } from '@/types'
import { cn } from '@/lib/utils'

const CATEGORY_ICONS = ['⚡', '🧩', '🚀', '📦', '🎨', '🔧']
const CATEGORY_GRADIENTS = [
  'from-cyan-500/20 to-blue-500/20 border-cyan-500/20 hover:border-cyan-500/50',
  'from-purple-500/20 to-pink-500/20 border-purple-500/20 hover:border-purple-500/50',
  'from-green-500/20 to-emerald-500/20 border-green-500/20 hover:border-green-500/50',
  'from-orange-500/20 to-yellow-500/20 border-orange-500/20 hover:border-orange-500/50',
  'from-red-500/20 to-pink-500/20 border-red-500/20 hover:border-red-500/50',
  'from-blue-500/20 to-indigo-500/20 border-blue-500/20 hover:border-blue-500/50',
]

export function CategoryGrid({ categories }: { categories: Category[] }) {
  const locale = useLocale()
  if (categories.length === 0) return null

  return (
    <section className="container mx-auto px-4 pb-20">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-3xl md:text-4xl font-bold mb-10"
      >
        Browse by <span className="text-gradient-cyan">category</span>
      </motion.h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={`/${locale}/products?category=${cat.slug}`}
              className={cn(
                'flex flex-col items-center gap-3 p-5 rounded-2xl border bg-gradient-to-br transition-all duration-300 hover:-translate-y-1 text-center group',
                CATEGORY_GRADIENTS[i % CATEGORY_GRADIENTS.length]
              )}
            >
              <span className="text-3xl">{CATEGORY_ICONS[i % CATEGORY_ICONS.length]}</span>
              <span className="text-sm font-medium leading-tight">
                {locale === 'fr' ? cat.name : cat.nameEn}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
