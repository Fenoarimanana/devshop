import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { HeroSection } from '@/components/shop/HeroSection'
import { FeaturedProducts } from '@/components/shop/FeaturedProducts'
import { CategoryGrid } from '@/components/shop/CategoryGrid'
import { StatsBar } from '@/components/shop/StatsBar'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' })
  return { title: t('homeTitle'), description: t('homeDescription') }
}

async function getData() {
  const [featured, categories, stats] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true, active: true },
      include: { category: true },
      take: 6,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({ take: 6 }),
    prisma.$transaction([
      prisma.product.count({ where: { active: true } }),
      prisma.order.count({ where: { status: 'PAID' } }),
      prisma.product.aggregate({ where: { active: true }, _sum: { downloadCount: true } }),
    ]),
  ])
  return { featured, categories, stats }
}

export default async function HomePage() {
  const { featured, categories, stats } = await getData()
  const [productCount, orderCount, downloadAgg] = stats

  return (
    <>
      <HeroSection
        productCount={productCount}
        customerCount={orderCount}
        downloadCount={downloadAgg._sum.downloadCount || 0}
      />
      {orderCount > 0 &&(
        <StatsBar
          productCount={productCount}
          customerCount={orderCount}
          downloadCount={downloadAgg._sum.downloadCount || 0}
        />
      )}
      <FeaturedProducts products={featured} />
      <CategoryGrid categories={categories} />
    </>
  )
}
