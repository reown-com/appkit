import type { AppProps } from 'next/app'
import { bootstrapSentry } from '../utils/SentryUtil'
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'
import { Toaster } from 'sonner'

import { Inter } from 'next/font/google'

import '../../globals.css'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/theme-provider'
import { LayoutHeader } from '@/components/Header'

// eslint-disable-next-line new-cap
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
            <Toaster />
            <LayoutHeader />
            <Component {...pageProps} />
          </div>
        </div>
      </ThemeProvider>
    </SessionProvider>
  )
}
