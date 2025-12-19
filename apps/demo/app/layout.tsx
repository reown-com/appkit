import { GoogleTagManager } from '@next/third-parties/google'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import Script from 'next/script'

import { khTeka } from '@/lib/fonts'
import { googleTagDataLayer, googleTagManagerSource } from '@/lib/gtag'
import { cn } from '@/lib/utils'
import { ContextProvider } from '@/providers/appkit-context-provider'
import { AppKitProvider } from '@/providers/appkit-provider'

import './globals.css'

const title = 'Reown Demo'
const description = 'The full stack toolkit to build onchain app UX'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/appkit-demo-open-graph.png',
        width: 1200,
        height: 630
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: '/appkit-demo-open-graph.png',
        width: 1200,
        height: 630
      }
    ]
  },
  creator: 'reown, inc.',
  keywords: [
    'appkit',
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
      {
        url: '/favicon-dark.png',
        media: '(prefers-color-scheme: light)'
      },
      {
        url: '/favicon.png',
        media: '(prefers-color-scheme: dark)'
      }
    ]
  }
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(khTeka.className)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AppKitProvider>
            <ContextProvider>{children}</ContextProvider>
          </AppKitProvider>
        </ThemeProvider>
        <GoogleTagManager gtmId="G-38H3M597C1" />
        <Script src={googleTagManagerSource} strategy="afterInteractive" />
        <Script id="google-tag-manager" strategy="afterInteractive">
          {googleTagDataLayer()}
        </Script>
      </body>
    </html>
  )
}
