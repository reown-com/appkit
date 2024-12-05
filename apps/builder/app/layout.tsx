import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { khTeka } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { AppKitProvider } from '@/providers/appkit-provider'
import './globals.css'

const title = 'AppKit | Builder'
const description = 'The full stack toolkit to build onchain app UX'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    locale: 'en_US',
    type: 'website'
  },
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

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <Toaster />
      <AppKitProvider>
        <body className={cn(khTeka.className, 'tracking-wide')}>{children}</body>
      </AppKitProvider>
    </html>
  )
}
