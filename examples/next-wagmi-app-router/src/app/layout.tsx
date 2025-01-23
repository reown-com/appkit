import { Metadata } from 'next'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ContextProvider cookies={null}>{children}</ContextProvider>
      </body>
    </html>
  )
}
