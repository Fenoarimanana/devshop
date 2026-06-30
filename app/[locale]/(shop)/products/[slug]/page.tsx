import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { ProductDetailClient } from '@/components/shop/ProductDetailClient'

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug, active: true },
    include: { category: true },
  })
}

export async function generateMetadata({
  params: { slug, locale },
}: {
  params: { slug: string; locale: string }
}): Promise<Metadata> {
  const product = await getProduct(slug)
  if (!product) return {}
  const name = locale === 'fr' ? product.name : product.nameEn
  const description = locale === 'fr' ? product.description : product.descriptionEn
  return {
    title: name,
    description,
    openGraph: {
      title: name,
      description,
      images: product.imageUrl ? [product.imageUrl] : [],
    },
  }
}

export default async function ProductPage({
  params: { slug, locale },
}: {
  params: { slug: string; locale: string }
}) {
  const product = await getProduct(slug)
  if (!product) notFound()

  return <ProductDetailClient product={product} locale={locale} />
}
