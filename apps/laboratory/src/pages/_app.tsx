import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'
import Layout from '../layout'
import { bootstrapSentry } from '../utils/SentryUtil'
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'
import Head from 'next/head'

bootstrapSentry()

export default function App({
  Component,
  pageProps
}: AppProps<{
  session: Session
}>) {
  return (
    <ChakraProvider>
      <Head>
        <title>AppKit Lab</title>
        <meta
          property="og:description"
          content="Explore the AppKit Lab to test the latest AppKit features."
        />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <Layout>
        <SessionProvider session={pageProps.session} refetchInterval={0}>
          <Component {...pageProps} />
        </SessionProvider>
      </Layout>
    </ChakraProvider>
  )
}
