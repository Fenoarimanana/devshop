import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: 'USER' },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="md:pt-0 pt-14">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold">Customers</h1>
        <p className="text-muted-foreground text-sm">{customers.length} customers</p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Name', 'Email', 'Orders', 'Joined'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-muted-foreground font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((user) => (
                <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-medium">{user.name || '—'}</td>
                  <td className="px-5 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-5 py-3 text-muted-foreground">{user._count.orders}</td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{formatDate(user.createdAt)}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-muted-foreground">No customers yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
