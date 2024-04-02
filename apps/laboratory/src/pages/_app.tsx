import type { AppProps } from 'next/app'
import { bootstrapSentry } from '../utils/SentryUtil'
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'

import { Inter } from 'next/font/google'

import '../../globals.css'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/theme-provider'
import { ModeToggle } from '@/components/theme-toggle'
import { LayoutHeader } from '@/layout/LayoutHeader'

const inter = Inter({ subsets: ['latin'] })

bootstrapSentry()

export default function App({
  Component,
  pageProps
}: AppProps<{
  session: Session
}>) {
  return (
    <SessionProvider session={pageProps.session} refetchInterval={0}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className={cn('w-full p-4', inter.className)}>
          <div className={cn('max-w-4xl mx-auto')}>
            <LayoutHeader />
            <Component {...pageProps} />
          </div>
        </div>
      </ThemeProvider>
    </SessionProvider>
  )
}
