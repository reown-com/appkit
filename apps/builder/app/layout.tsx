import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { ThemeProvider } from 'next-themes'

import { khTeka } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { ContextProvider } from '@/providers/appkit-context-provider'
import { AppKitProvider } from '@/providers/appkit-provider'
import { headers } from 'next/headers'
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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookies = headers().get('cookie')

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(khTeka.className)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AppKitProvider cookies={cookies}>
            <ContextProvider>{children}</ContextProvider>
          </AppKitProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
