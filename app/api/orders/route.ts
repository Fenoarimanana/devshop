import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPaymentInvoice } from '@/lib/nowpayments'
import { generateOrderId } from '@/lib/utils'
import { z } from 'zod'

const schema = z.object({
  items: z.array(
    z.object({ productId: z.string(), quantity: z.number().min(1).default(1) })
  ).min(1),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { items } = schema.parse(body)

    // Detect locale from referer header (checkout page calling this API), fallback to 'en'
    const referer = req.headers.get('referer') || ''
    const localeMatch = referer.match(/\/(en|fr)(\/|$)/)
    const locale = localeMatch ? localeMatch[1] : 'en'

    // Fetch products and validate
    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) }, active: true },
    })

    if (products.length !== items.length) {
      return NextResponse.json({ error: 'One or more products not found' }, { status: 400 })
    }

    const total = products.reduce((sum, p) => sum + p.price, 0)
    const orderId = generateOrderId()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    // Create order in DB
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        total,
        status: 'PENDING',
        locale,
        items: {
          create: products.map((p) => ({
            productId: p.id,
            price: p.price,
            quantity: 1,
          })),
        },
      },
    })

    // Create NOWPayments invoice
    let invoice
    try {
      invoice = await createPaymentInvoice({
        price_amount: total,
        price_currency: 'usd',
        pay_currency: process.env.NOWPAYMENTS_CURRENCY || 'usdttrc20',
        order_id: order.id,
        order_description: `DevShop order ${orderId} — ${products.length} item(s)`,
        success_url: `${appUrl}/${locale}/orders/${order.id}?status=success`,
        cancel_url: `${appUrl}/${locale}/cart`,
        ipn_callback_url: `${appUrl}/api/webhook/nowpayments`,
      })
    } catch (paymentErr) {
      // Clean up the orphaned order if payment invoice creation fails
      await prisma.order.delete({ where: { id: order.id } }).catch((cleanupErr) => {
        console.error('Failed to clean up orphaned order:', cleanupErr)
      })
      console.error('NOWPayments invoice creation failed:', paymentErr)
      return NextResponse.json({ error: 'Payment provider unavailable, please try again' }, { status: 502 })
    }

    // Save payment URL
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentId: invoice.id, paymentUrl: invoice.invoice_url },
    })

    return NextResponse.json({ orderId: order.id, paymentUrl: invoice.invoice_url })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(orders)
}
