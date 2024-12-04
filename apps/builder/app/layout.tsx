import type { Metadata } from 'next'
import { AppKitProvider } from '@/providers/appkit-provider'
import { Toaster } from 'sonner'
import { khTeka } from '@/lib/fonts'
import './globals.css'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'AppKit | Builder',
  description: 'The full stack toolkit to build onchain app UX'
}

export default function RootLayout({
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
