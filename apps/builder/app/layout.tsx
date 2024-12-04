import type { Metadata } from 'next'
import { AppKitProvider } from '@/providers/appkit-provider'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'AppKit Builder - WIP',
  description: 'Customize and test your AppKit app'
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
        <body>{children}</body>
      </AppKitProvider>
    </html>
  )
}
