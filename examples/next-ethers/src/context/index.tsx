'use client'

import { createWeb3Modal } from '@rerock/appkit/react'
import { EVMEthersClient } from '@rerock/appkit-adapter-ethers'
import { mainnet, arbitrum, avalanche, base, optimism, polygon } from '@rerock/appkit/chains'
import { type ReactNode } from 'react'

const projectId = 'Your project ID'

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
