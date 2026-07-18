import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Space_Mono } from 'next/font/google'
import Script from 'next/script'
import type { ReactNode } from 'react'
import { Providers } from './providers'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ledgr • Personal finance clarity',
  description: 'Track daily spending, plan around your real salary cycle, and see where your money is going before the month ends.',
  applicationName: 'Ledgr.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/app-icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Ledgr.' },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#111111' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{const signedIn=Boolean(localStorage.getItem('ledgr-auth-token')||localStorage.getItem('where-did-my-money-go-auth-token'));const d=signedIn&&localStorage.getItem('app-theme')==='dark';document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light'}catch{}`}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
