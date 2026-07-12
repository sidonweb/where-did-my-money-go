import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Providers } from './providers'
import { ServiceWorkerRegistration } from './service-worker'
import './globals.css'

export const metadata: Metadata = {
  title: 'Where did my money go?',
  description: 'A mobile-first personal finance tracker for daily expenses, budgets, and weekly analysis.',
  applicationName: 'Where did my money go?',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/favicon.svg', apple: '/app-icon.svg' },
  appleWebApp: { capable: true, title: 'Money Go?' },
}

export const viewport: Viewport = {
  themeColor: '#111827',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
