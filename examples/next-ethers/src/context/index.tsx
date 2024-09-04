'use client'

import { projectId } from '@/config'
import { createWeb3Modal } from '@rerock/base/react'
import { EVMEthersClient } from '@rerock/adapter-ethers'
import { mainnet, arbitrum, avalanche, base, optimism, polygon } from '@rerock/base/chains'
import { type ReactNode } from 'react'

if (!projectId) {
  throw new Error('Project ID is not defined')
}

const ethersAdapter = new EVMEthersClient()

createWeb3Modal({
  adapters: [ethersAdapter],
  projectId,
  caipNetworks: [mainnet, arbitrum, avalanche, base, optimism, polygon],
  metadata: {
    name: 'My App',
    description: 'My app description',
    url: 'https://myapp.com',
    icons: ['https://myapp.com/favicon.ico']
  },
  enableEIP6963: true,
  enableCoinbase: true
})

function ContextProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export default ContextProvider
