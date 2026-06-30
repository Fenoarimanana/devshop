'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Sun, Moon, Menu, X, Globe, ChevronDown,
  User, LogOut, Package, LayoutDashboard, Zap
} from 'lucide-react'
import { useCart } from './CartProvider'
import { cn } from '@/lib/utils'

export function Navbar() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const { items } = useCart()
  const pathname = usePathname()
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [themeAnimating, setThemeAnimating] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const toggleTheme = () => {
    setThemeAnimating(true)
    setTheme(theme === 'dark' ? 'light' : 'dark')
    setTimeout(() => setThemeAnimating(false), 500)
  }

  const switchLocale = () => {
    const next = locale === 'en' ? 'fr' : 'en'
    const segments = pathname.split('/')
    const hasLocalePrefix = segments[1] === 'en' || segments[1] === 'fr'
    const rest = hasLocalePrefix ? segments.slice(2) : segments.slice(1)
    const newPath = next === 'en' ? `/${rest.join('/')}` : `/${next}/${rest.join('/')}`
    router.push(newPath.replace(/\/+$/, '') || '/')
  }

  const isAdmin = session?.user?.role === 'ADMIN'
  const cartCount = items.length

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'glass border-b border-border/50 shadow-lg shadow-black/20'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/30 group-hover:glow-cyan transition-all duration-300">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            Dev<span className="text-gradient-cyan">Shop</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href={`/${locale}/products`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t('products')}
          </Link>
          {isAdmin && (
            <Link href={`/${locale}/admin/dashboard`} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              <LayoutDashboard className="w-3.5 h-3.5" />
              {t('admin')}
            </Link>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Lang switch */}
          <button
            onClick={switchLocale}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <Globe className="w-3.5 h-3.5" />
            {locale.toUpperCase()}
          </button>

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              aria-label="Toggle theme"
            >
              <motion.div
                animate={themeAnimating ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 0.5 }}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </motion.div>
            </button>
          )}

          {/* Cart */}
          <Link
            href={`/${locale}/cart`}
            className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* User menu */}
          {session ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm hover:bg-muted transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-3 h-3 text-primary" />
                </div>
                <span className="text-muted-foreground">{session.user.name?.split(' ')[0]}</span>
                <ChevronDown className={cn('w-3 h-3 text-muted-foreground transition-transform', userMenuOpen && 'rotate-180')} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 glass-card rounded-xl p-1 shadow-xl"
                  >
                    <Link
                      href={`/${locale}/orders`}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Package className="w-4 h-4" />
                      {t('orders')}
                    </Link>
                    {isAdmin && (
                      <Link
                        href={`/${locale}/admin/dashboard`}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-primary"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        {t('admin')}
                      </Link>
                    )}
                    <div className="h-px bg-border my-1" />
                    <button
                      onClick={() => signOut({ callbackUrl: `/${locale}` })}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('logout')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href={`/${locale}/auth/login`}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('login')}
              </Link>
              <Link
                href={`/${locale}/auth/register`}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {t('register')}
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border/50"
          >
            <div className="container px-4 py-4 flex flex-col gap-2">
              <Link href={`/${locale}/products`} className="px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>
                {t('products')}
              </Link>
              {session ? (
                <>
                  <Link href={`/${locale}/orders`} className="px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>
                    {t('orders')}
                  </Link>
                  {isAdmin && (
                    <Link href={`/${locale}/admin/dashboard`} className="px-3 py-2.5 text-sm rounded-lg hover:bg-muted text-primary transition-colors" onClick={() => setMobileOpen(false)}>
                      {t('admin')}
                    </Link>
                  )}
                  <button onClick={() => signOut({ callbackUrl: `/${locale}` })} className="text-left px-3 py-2.5 text-sm rounded-lg hover:bg-muted text-destructive transition-colors">
                    {t('logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link href={`/${locale}/auth/login`} className="px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>
                    {t('login')}
                  </Link>
                  <Link href={`/${locale}/auth/register`} className="px-3 py-2.5 text-sm rounded-lg bg-primary text-primary-foreground text-center font-medium" onClick={() => setMobileOpen(false)}>
                    {t('register')}
                  </Link>
                </>
              )}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button onClick={switchLocale} className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-all">
                  <Globe className="w-4 h-4" />{locale === 'en' ? 'FR' : 'EN'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
