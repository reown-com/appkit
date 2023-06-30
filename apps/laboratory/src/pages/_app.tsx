import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import { Web3Modal } from '@web3modal/wagmi'

const modal = new Web3Modal()
console.info(modal)

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}
