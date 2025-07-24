import type { Metadata } from 'next'

import { ThemeProvider } from '@/components/theme-provider'
import { khTeka } from '@/lib/fonts'
import { cn } from '@/lib/utils'

import './globals.css'

export const metadata: Metadata = {
  title: 'AppKit Pay Test Exchange',
  description: 'AppKit Pay Test Exchange',
  icons: [
    {
      url: '/favicon.png',
      media: '(prefers-color-scheme: light)'
    },
    {
      url: '/favicon-dark.png',
      media: '(prefers-color-scheme: dark)'
    }
  ]
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(khTeka.className)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
