import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'
import { bootstrapSentry } from '../utils/SentryUtil'
import Layout from '../layout'

bootstrapSentry()

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ChakraProvider>
  )
}
