'use client'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Download, Package, ShoppingBag, Clock } from 'lucide-react'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import { Order, OrderItem, Product, DownloadToken } from '@/types'

type OrderWithDetails = Order & {
  items: (OrderItem & { product: Product })[]
  downloadTokens: DownloadToken[]
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  PAID: 'bg-green-500/10 text-green-400 border-green-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
  REFUNDED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
}

export function OrdersClient({ orders }: { orders: OrderWithDetails[] }) {
  const t = useTranslations('orders')
  const tProducts = useTranslations('products')
  const locale = useLocale()

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">{t('empty')}</h1>
        <p className="text-muted-foreground mb-8">{t('emptyDesc')}</p>
        <Link href={`/${locale}/products`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90">
          {tProducts('title')}
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold mb-8">{t('title')}</h1>

      <div className="space-y-4">
        {orders.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-mono text-xs text-muted-foreground mb-1">{t('orderId')}</p>
                <p className="font-mono text-sm">{order.id.slice(0, 20)}…</p>
              </div>
              <div className="text-right">
                <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium border', STATUS_STYLES[order.status])}>
                  {t(`statusOptions.${order.status}`)}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {order.items.map((item) => {
                const token = order.downloadTokens.find((dt) => dt.productId === item.productId)
                const expired = token && new Date() > new Date(token.expiresAt)

                return (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{locale === 'fr' ? item.product.name : item.product.nameEn}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{formatPrice(item.price)}</span>
                      {order.status === 'PAID' && token && (
                        expired ? (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {t('downloadExpired')}
                          </span>
                        ) : (
                          <a
                            href={`/api/download/${token.token}`}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                          >
                            <Download className="w-3 h-3" /> {t('download')}
                          </a>
                        )
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground text-xs">{formatDate(order.createdAt, locale)}</span>
              <span className="font-bold text-gradient-cyan">{formatPrice(order.total)}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
