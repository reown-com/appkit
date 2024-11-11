import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import AppKitProvider from '@/providers/appkit-provider'
import { AppKitProvider as AppKitContextProvider } from '@/contexts/AppKitContext'
import { Toaster } from 'sonner'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900'
})

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
      <AppKitContextProvider>
        <AppKitProvider>
          <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            {children}
          </body>
        </AppKitProvider>
      </AppKitContextProvider>
    </html>
  )
}
