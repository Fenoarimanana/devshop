import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1),
  nameEn: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  descriptionEn: z.string().min(1),
  price: z.number().min(0),
  type: z.enum(['TEMPLATE', 'PLUGIN', 'SAAS_ACCESS', 'EBOOK', 'COURSE', 'OTHER']),
  categoryId: z.string().nullable().optional(),
  imageUrl: z.string().optional(),
  fileUrl: z.string().min(1),
  filePublicId: z.string().optional(),
  demoUrl: z.string().optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
})

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') return null
  return session
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const body = await req.json()
    const data = productSchema.parse(body)
    const product = await prisma.product.create({ data })
    return NextResponse.json(product, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function GET() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(products)
}
