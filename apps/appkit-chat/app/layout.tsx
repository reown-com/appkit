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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning theme="dark">
      <body className={cn(khTeka.className)}>
        <ThemeProvider
          attribute="class"
          forcedTheme="dark"
          defaultTheme="dark"
          enableSystem={false}
        >
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
