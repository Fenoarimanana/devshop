'use client'
import { motion } from 'framer-motion'
import { DollarSign, ShoppingBag, Package, Users, TrendingUp } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import { OrderWithItems } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  PAID: 'bg-green-500/10 text-green-400 border-green-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
  REFUNDED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
}

interface DashboardClientProps {
  stats: {
    totalRevenue: number
    totalOrders: number
    totalProducts: number
    totalCustomers: number
    recentOrders: OrderWithItems[]
  }
}

export function DashboardClient({ stats }: DashboardClientProps) {
  const cards = [
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'text-neon-green', bg: 'bg-neon-green/10 border-neon-green/20' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
    { label: 'Products', value: stats.totalProducts, icon: Package, color: 'text-neon-purple', bg: 'bg-neon-purple/10 border-neon-purple/20' },
    { label: 'Customers', value: stats.totalCustomers, icon: Users, color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
  ]

  return (
    <div className="md:pt-0 pt-14">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back, Admin 👋</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border mb-3', bg)}>
              <Icon className={cn('w-5 h-5', color)} />
            </div>
            <p className="text-xs text-muted-foreground font-mono mb-1">{label}</p>
            <p className="font-display text-2xl font-bold">{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Recent Orders
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-muted-foreground font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{order.id.slice(0, 12)}…</td>
                  <td className="px-5 py-3">{order.user.name || order.user.email}</td>
                  <td className="px-5 py-3 text-muted-foreground">{order.items.length} item(s)</td>
                  <td className="px-5 py-3 font-medium">{formatPrice(order.total)}</td>
                  <td className="px-5 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium border', STATUS_STYLES[order.status])}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
