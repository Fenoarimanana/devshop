'use client'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Package, Users, Download } from 'lucide-react'

export function StatsBar({ productCount, customerCount, downloadCount }: {
  productCount: number
  customerCount: number
  downloadCount: number
}) {
  const t = useTranslations('hero')

  const stats = [
    { icon: Package, value: productCount, label: t('stat1') },
    { icon: Users, value: customerCount, label: t('stat2') },
    { icon: Download, value: downloadCount, label: t('stat3') },
  ]

  return (
    <div className="border-y border-border bg-muted/30">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-3 divide-x divide-border">
          {stats.map(({ icon: Icon, value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center gap-1 px-4"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-primary" />
                <span className="font-display font-bold text-2xl md:text-3xl">{value}+</span>
              </div>
              <span className="text-xs text-muted-foreground">{label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
