'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut, Zap, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: 'products', label: 'Products', icon: Package },
  { href: 'orders', label: 'Orders', icon: ShoppingBag },
  { href: 'customers', label: 'Customers', icon: Users },
  { href: 'settings', label: 'Settings', icon: Settings },
]

function SidebarContent({ locale, pathname, onNavigate }: { locale: string; pathname: string; onNavigate: () => void }) {
  return (
    <div className="flex flex-col h-full py-6 px-4">
      <Link href={`/${locale}`} className="flex items-center gap-2 mb-8 px-2">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/30">
          <Zap className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="font-display font-bold">Dev<span className="text-gradient-cyan">Shop</span></span>
        <span className="text-[10px] font-mono text-muted-foreground border border-border rounded px-1">ADMIN</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const full = `/${locale}/admin/${href}`
          const active = pathname === full || pathname.startsWith(full + '/')
          return (
            <Link
              key={href}
              href={full}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </Link>
          )
        })}
      </nav>

      <button
        onClick={() => signOut({ callbackUrl: `/${locale}` })}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all mt-4"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </div>
  )
}

export function AdminSidebar({ locale }: { locale: string }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 glass border-r border-border z-40">
        <SidebarContent locale={locale} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 glass border-b border-border z-40 flex items-center px-4 gap-3">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-muted transition-colors">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <span className="font-display font-bold">Dev<span className="text-gradient-cyan">Shop</span> Admin</span>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 pt-14">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 h-full glass border-r border-border">
            <SidebarContent locale={locale} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  )
}
