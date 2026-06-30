import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Zap, Heart } from 'lucide-react'

export function Footer() {
  const t = useTranslations('footer')
  const locale = useLocale()

  return (
    <footer className="border-t border-border mt-24">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href={`/${locale}`} className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/30">
                <Zap className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-display font-bold">Dev<span className="text-gradient-cyan">Shop</span></span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">{t('tagline')}</p>
          </div>

          <div>
            <p className="text-sm font-semibold mb-3">{t('products')}</p>
            <div className="flex flex-col gap-2">
              <Link href={`/${locale}/products`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Templates</Link>
              <Link href={`/${locale}/products?type=PLUGIN`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Plugins</Link>
              <Link href={`/${locale}/products?type=SAAS_ACCESS`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">SaaS Access</Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-3">{t('legal')}</p>
            <div className="flex flex-col gap-2">
              <Link href={`/${locale}/terms`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('terms')}</Link>
              <Link href={`/${locale}/privacy`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('privacy')}</Link>
              <Link href={`/${locale}/refund`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('refund')}</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DevShop. {t('allRights')}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {t('madeWith')} <Heart className="w-3 h-3 text-destructive fill-destructive" />
          </p>
        </div>
      </div>
    </footer>
  )
}
