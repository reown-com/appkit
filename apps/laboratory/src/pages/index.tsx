'use client'

import { Web3Modal } from '@web3modal/wagmi'
import { configureChains, createConfig, mainnet, WagmiConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'

const { publicClient, webSocketPublicClient } = configureChains([mainnet], [publicProvider()])

const wagmiClient = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient
})

const modal = new Web3Modal({ wagmiClient })
console.warn(modal)

export default function Home() {
  return (
    <WagmiConfig config={wagmiClient}>
      <p>Hello Lab</p>
    </WagmiConfig>
  )
}
