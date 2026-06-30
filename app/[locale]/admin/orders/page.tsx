import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  PAID: 'bg-green-500/10 text-green-400 border-green-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
  REFUNDED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="md:pt-0 pt-14">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground text-sm">{orders.length} orders total</p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['ID', 'Customer', 'Email', 'Items', 'Total', 'Status', 'Date'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-muted-foreground font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{order.id.slice(0, 10)}…</td>
                  <td className="px-5 py-3">{order.user.name || '—'}</td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{order.user.email}</td>
                  <td className="px-5 py-3 text-muted-foreground">{order.items.length}</td>
                  <td className="px-5 py-3 font-medium">{formatPrice(order.total)}</td>
                  <td className="px-5 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium border', STATUS_STYLES[order.status])}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
