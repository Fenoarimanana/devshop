import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const revalidate = 0

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  let products: Array<{ slug: string; updatedAt: Date }> = []

  try {
    products = await prisma.product.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    })
  } catch (error) {
    console.error('Failed to load products for sitemap:', error)
  }

  const staticPages = ['', '/products', '/auth/login', '/auth/register'].flatMap((path) =>
    ['en', 'fr'].map((locale) => ({
      url: `${appUrl}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.8,
    }))
  )

  const productPages = products.flatMap((p) =>
    ['en', 'fr'].map((locale) => ({
      url: `${appUrl}/${locale}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  )

  return [...staticPages, ...productPages]
}
