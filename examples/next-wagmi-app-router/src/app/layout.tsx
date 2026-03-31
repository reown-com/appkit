import { Metadata } from 'next'
import { headers } from 'next/headers'

import { wagmiAdapter } from '@/config'
import ContextProvider from '@/context'

import './globals.css'

export const metadata: Metadata = {
  title: 'AppKit Next.js Wagmi',
  description: 'AppKit Next.js App Router Wagmi Example',
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookies = (await headers()).get('cookie')

  // Reset SSR state when no cookies to prevent cross-request state leakage
  if (!cookies) {
    wagmiAdapter.resetSSRState()
  }

  return (
    <html lang="en">
      <body>
        <ContextProvider cookies={cookies}>{children}</ContextProvider>
      </body>
    </html>
  )
}
