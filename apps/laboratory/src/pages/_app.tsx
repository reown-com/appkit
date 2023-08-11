import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'
import { bootstrapSentry } from '../utils/SentryUtil'

bootstrapSentry()

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}
