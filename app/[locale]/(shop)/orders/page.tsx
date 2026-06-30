import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OrdersClient } from '@/components/shop/OrdersClient'

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: { include: { product: true } },
      downloadTokens: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return <OrdersClient orders={orders} />
}
