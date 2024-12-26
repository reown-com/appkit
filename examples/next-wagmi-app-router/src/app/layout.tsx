import ContextProvider from '@/context'
import './globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AppKit Next.js App Router Example',
  description: 'AppKit Next.js App Router Example',
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
