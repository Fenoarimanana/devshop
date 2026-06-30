import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { ProductsClient } from '@/components/shop/ProductsClient'
import { ProductType } from '@prisma/client'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' })
  return { title: t('productsTitle') }
}

async function getData(searchParams: Record<string, string>) {
  const { q, type, category, sort } = searchParams

  const orderBy = sort === 'priceAsc'
    ? { price: 'asc' as const }
    : sort === 'priceDesc'
    ? { price: 'desc' as const }
    : sort === 'oldest'
    ? { createdAt: 'asc' as const }
    : { createdAt: 'desc' as const }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        active: true,
        ...(q && {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { nameEn: { contains: q, mode: 'insensitive' } },
            { tags: { has: q } },
          ],
        }),
        ...(type && { type: type as ProductType }),
        ...(category && { category: { slug: category } }),
      },
      include: { category: true },
      orderBy,
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  return { products, categories }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string>
}) {
  const { products, categories } = await getData(searchParams)
  return <ProductsClient products={products} categories={categories} />
}
