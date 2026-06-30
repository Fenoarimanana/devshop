import type { Metadata } from 'next'
import { Inter, Syne, JetBrains_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { SessionProvider } from '@/components/layout/SessionProvider'
import { CartProvider } from '@/components/layout/CartProvider'
import { Toaster } from '@/components/ui/Toaster'
import '../globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const syne = Syne({ subsets: ['latin'], variable: '--font-syne' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'DevShop — Premium Digital Products for Developers',
    template: '%s | DevShop',
  },
  description:
    'Buy professional templates, plugins, and tools. Pay with crypto. Instant download after purchase.',
  keywords: ['templates', 'plugins', 'developers', 'digital products', 'crypto payment', 'USDT'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'DevShop',
    title: 'DevShop — Premium Digital Products for Developers',
    description: 'Buy professional templates, plugins, and tools. Pay with crypto.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevShop — Premium Digital Products for Developers',
    description: 'Buy professional templates, plugins, and tools. Pay with crypto.',
  },
  robots: { index: true, follow: true },
}

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const messages = await getMessages()
  const session = await getServerSession(authOptions)

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} ${syne.variable} ${jetbrains.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
          <SessionProvider session={session}>
            <NextIntlClientProvider messages={messages} locale={locale}>
              <CartProvider>
                {children}
                <Toaster />
              </CartProvider>
            </NextIntlClientProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
