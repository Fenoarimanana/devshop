'use client'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Zap, ArrowLeft } from 'lucide-react'

export default function LocaleNotFound() {
  const locale = useLocale()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/30 mx-auto mb-6">
          <Zap className="w-7 h-7 text-primary" />
        </div>
        <h1 className="font-display text-6xl font-bold mb-2 text-gradient-cyan">404</h1>
        <p className="text-muted-foreground mb-8">This page doesn&apos;t exist.</p>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Back home
        </Link>
      </div>
    </div>
  )
}
