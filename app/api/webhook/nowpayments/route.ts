import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyIpnSignature, PAID_STATUSES } from '@/lib/nowpayments'
import { sendOrderConfirmation } from '@/lib/email'
import { addHours } from 'date-fns'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-nowpayments-sig') || ''

  if (!verifyIpnSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: any
  try {
    payload = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { order_id, payment_status, payment_id } = payload

  if (!order_id || !payment_status) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id: order_id },
    include: {
      items: { include: { product: true } },
      user: true,
    },
  })

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  // Already processed
  if (order.status === 'PAID') return NextResponse.json({ ok: true })

  if (PAID_STATUSES.includes(payment_status)) {
    const expiryHours = Number(process.env.DOWNLOAD_TOKEN_EXPIRY_HOURS || 48)

    // Mark as paid and create download tokens
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'PAID', nowpaymentsId: String(payment_id) },
      })

      for (const item of order.items) {
        await tx.downloadToken.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            expiresAt: addHours(new Date(), expiryHours),
          },
        })
        await tx.product.update({
          where: { id: item.productId },
          data: { downloadCount: { increment: 1 } },
        })
      }
    })

    // Send confirmation email
    try {
      const tokens = await prisma.downloadToken.findMany({
        where: { orderId: order.id },
      })
      const appUrl = process.env.NEXT_PUBLIC_APP_URL

      // Load products for each token (relation not present in generated types)
      const tokensWithProducts = await Promise.all(
        tokens.map(async (t) => ({
          token: t,
          product: await prisma.product.findUnique({ where: { id: t.productId } }),
        }))
      )

      await sendOrderConfirmation(
        order.user.email,
        order.user.name || 'Customer',
        order.id,
        tokensWithProducts.map(({ token: t, product }) => ({
          name: order.locale === 'fr' ? product?.name || '' : product?.nameEn || '',
          downloadUrl: `${appUrl}/api/download/${t.token}`,
        })),
        order.total,
        order.locale
      )
    } catch (emailErr) {
      console.error('Email send failed:', emailErr)
    }
  } else if (payment_status === 'failed' || payment_status === 'expired') {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' },
    })
  }

  return NextResponse.json({ ok: true })
}
