import { GoogleTagManager } from '@next/third-parties/google'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import Script from 'next/script'

import { khTeka } from '@/lib/fonts'
import { googleTagDataLayer, googleTagManagerSource } from '@/lib/gtag'
import { cn } from '@/lib/utils'
import { AppKitProvider } from '@/providers/appkit-provider'

import './globals.css'

const title = 'AppKit Chat'
const description = 'Chat Onchain with AppKit'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    locale: 'en_US',
    type: 'website',
    images: ['/opengraph-image.png']
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/opengraph-image.png']
  },
  creator: 'reown, inc.',
  keywords: [
    'appkit',
    'ai',
    'llms',
    'mcp',
    'modelcontextprotocol',
    'chat',
    'reown',
    'demo',
    'wallet',
    'connect',
    'web3',
    'crypto',
    'blockchain',
    'dapp'
  ],
  icons: {
    icon: [
      { url: '/favicon-dark.png', media: '(prefers-color-scheme: light)' },
      { url: '/favicon.png', media: '(prefers-color-scheme: dark)' }
    ]
  }
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(khTeka.className)}>
        <ThemeProvider attribute="class" forcedTheme="dark" enableSystem={false}>
          <AppKitProvider>{children}</AppKitProvider>
        </ThemeProvider>
        <GoogleTagManager gtmId="G-NZK3WNHHVL" />
        <Script src={googleTagManagerSource} strategy="afterInteractive" />
        <Script id="google-tag-manager" strategy="afterInteractive">
          {googleTagDataLayer()}
        </Script>
      </body>
    </html>
  )
}
