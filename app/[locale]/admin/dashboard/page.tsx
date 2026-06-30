import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { DashboardClient } from '@/components/admin/DashboardClient'

async function getStats() {
  const [totalRevenue, totalOrders, totalProducts, totalCustomers, recentOrders] =
    await Promise.all([
      prisma.order.aggregate({ where: { status: 'PAID' }, _sum: { total: true } }),
      prisma.order.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: true, items: { include: { product: true } } },
      }),
    ])

  return {
    totalRevenue: totalRevenue._sum.total || 0,
    totalOrders,
    totalProducts,
    totalCustomers,
    recentOrders,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()
  return <DashboardClient stats={stats} />
}
