import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children, params: { locale } }: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect(`/${locale}/auth/login`)
  }

  return (
    <div className="min-h-screen flex">
      <AdminSidebar locale={locale} />
      <main className="flex-1 ml-0 md:ml-64 p-6 pt-8">{children}</main>
    </div>
  )
}
