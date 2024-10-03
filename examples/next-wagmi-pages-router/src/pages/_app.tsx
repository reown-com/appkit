import Web3ModalProvider from '@/context'
import type { AppProps } from 'next/app'

import '@/globals.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Web3ModalProvider>
      <Component {...pageProps} />
    </Web3ModalProvider>
  )
}
