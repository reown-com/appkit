'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

import type { ChainAdapter } from '@reown/appkit'
import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

import DemoContent from '@/src/components/DemoContent'
import { type Adapter, type WagmiConfig, appKitConfigs } from '@/src/constants/appkit-configs'
import { AppKitProvider } from '@/src/context/AppKitContext'

const queryClient = new QueryClient()

const solanaAdapter = new SolanaAdapter()
const ethersAdapter = new EthersAdapter()
const ethers5Adapter = new Ethers5Adapter()
const bitcoinAdapter = new BitcoinAdapter()

type SearchParams = {
  name: string
}

function resolvePathFromName(name: string) {
  return appKitConfigs[name] || null
}

function getAdapters(_adapters: Adapter[] | undefined, wagmiConfig: WagmiConfig | undefined) {
  const adapters: ChainAdapter[] = []

  _adapters?.forEach(adapter => {
    if (adapter === 'wagmi' && wagmiConfig) {
      const wagmiAdapter = new WagmiAdapter(wagmiConfig)

      adapters.push(wagmiAdapter)
    }
    if (adapter === 'ethers') {
      adapters.push(ethersAdapter)
    }
    if (adapter === 'ethers5') {
      adapters.push(ethers5Adapter)
    }
    if (adapter === 'solana') {
      adapters.push(solanaAdapter)
    }
    if (adapter === 'bitcoin') {
      adapters.push(bitcoinAdapter)
    }
  })

  return adapters
}

export default function DemoPage({ searchParams }: { searchParams: SearchParams }) {
  const name = searchParams['name']
  const config = resolvePathFromName(name || '')
  const hasWagmi = config?.adapters?.includes('wagmi')

  if (!config) {
    return null
  }

  if (hasWagmi && config.wagmiConfig) {
    const wagmiAdapter = new WagmiAdapter(config.wagmiConfig)
    const appKitConfig = {
      ...config,
      adapters: getAdapters(config.adapters, config.wagmiConfig)
    }

    return (
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <AppKitProvider config={appKitConfig}>
            <DemoContent hasWagmiAdapter={true} />
          </AppKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    )
  }

  const appKitConfig = {
    ...config,
    adapters: getAdapters(config.adapters, config.wagmiConfig)
  }

  return (
    <AppKitProvider config={appKitConfig}>
      <DemoContent />
    </AppKitProvider>
  )
}
