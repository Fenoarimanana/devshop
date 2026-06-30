import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Admin user (will be upgraded to ADMIN role via ADMIN_EMAIL env)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@devshop.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456'

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existing) {
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, 12),
        role: 'ADMIN',
      },
    })
    console.log('✅ Admin user created:', adminEmail)
  } else {
    // Ensure existing user is admin
    await prisma.user.update({ where: { email: adminEmail }, data: { role: 'ADMIN' } })
    console.log('✅ Admin user updated:', adminEmail)
  }

  // Seed categories
  const categories = [
    { name: 'Tableaux de bord', nameEn: 'Dashboards', slug: 'dashboards' },
    { name: 'E-commerce', nameEn: 'E-commerce', slug: 'ecommerce' },
    { name: 'SaaS', nameEn: 'SaaS', slug: 'saas' },
    { name: 'Marketing', nameEn: 'Marketing', slug: 'marketing' },
    { name: 'Outils', nameEn: 'Tools', slug: 'tools' },
    { name: 'Formation', nameEn: 'Courses', slug: 'courses' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log('✅ Categories seeded')

  // Sample product
  const dashboardCat = await prisma.category.findUnique({ where: { slug: 'dashboards' } })
  await prisma.product.upsert({
    where: { slug: 'nextjs-admin-dashboard' },
    update: {},
    create: {
      name: 'Dashboard Admin Next.js',
      nameEn: 'Next.js Admin Dashboard',
      slug: 'nextjs-admin-dashboard',
      description: 'Dashboard admin complet avec Next.js 14, Tailwind, Prisma et authentification.',
      descriptionEn: 'Full admin dashboard with Next.js 14, Tailwind, Prisma and authentication.',
      price: 49.99,
      type: 'TEMPLATE',
      categoryId: dashboardCat?.id,
      fileUrl: 'https://example.com/placeholder.zip',
      tags: ['nextjs', 'dashboard', 'admin', 'typescript'],
      featured: true,
      active: true,
    },
  })
  console.log('✅ Sample product seeded')

  console.log('🎉 Seed complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
