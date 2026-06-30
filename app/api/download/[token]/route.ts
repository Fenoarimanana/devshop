import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSignedUrl } from '@/lib/cloudinary'

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.redirect(new URL('/en/auth/login', req.url))
  }

  const { token } = params

  const downloadToken = await prisma.downloadToken.findUnique({
    where: { token },
    include: { order: true, product: true },
  })

  if (!downloadToken) {
    return NextResponse.json({ error: 'Invalid download link' }, { status: 404 })
  }

  // Verify the order belongs to the requesting user
  if (downloadToken.order.userId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (new Date() > downloadToken.expiresAt) {
    return NextResponse.json({ error: 'Download link expired' }, { status: 410 })
  }

  if (downloadToken.usedAt) {
    // Allow re-download but log it
    console.log(`Re-download: token ${token} by user ${session.user.id}`)
  }

  // Mark as used
  await prisma.downloadToken.update({
    where: { id: downloadToken.id },
    data: { usedAt: new Date() },
  })

  // Generate signed Cloudinary URL
  if (downloadToken.product.filePublicId) {
    const signedUrl = getSignedUrl(downloadToken.product.filePublicId, 300)
    return NextResponse.redirect(signedUrl)
  }

  // Fallback: direct file URL redirect
  return NextResponse.redirect(downloadToken.product.fileUrl)
}
