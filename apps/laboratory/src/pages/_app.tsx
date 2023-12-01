import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'
import Layout from '../layout'
import { bootstrapSentry } from '../utils/SentryUtil'
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'

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
        <SessionProvider session={pageProps.session} refetchInterval={0}>
          <Component {...pageProps} />
        </SessionProvider>
      </Layout>
    </ChakraProvider>
  )
}
