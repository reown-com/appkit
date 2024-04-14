import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'
import { Toaster } from 'sonner'
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'
import Layout from '../layout'
import { bootstrapSentry } from '../utils/SentryUtil'

bootstrapSentry()

export default function App({
  Component,
  pageProps
}: AppProps<{
  session: Session
}>) {
  return (
    <ChakraProvider>
      <Layout>
        <Toaster />
        <SessionProvider session={pageProps.session} refetchInterval={0}>
          <Component {...pageProps} />
        </SessionProvider>
      </Layout>
    </ChakraProvider>
  )
}
