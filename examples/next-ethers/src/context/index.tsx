'use client'

import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet, arbitrum, avalanche, base, optimism, polygon } from '@reown/appkit/networks'
import { type ReactNode } from 'react'

const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
}

const ethersAdapter = new EthersAdapter()

createAppKit({
  adapters: [ethersAdapter],
  projectId,
  networks: [mainnet, arbitrum, avalanche, base, optimism, polygon],
  metadata: {
    name: 'AppKit Next.js Ethers Example',
    description: 'Example Next.js application implementing AppKit with Ethers adapter',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  },
  enableEIP6963: true,
  enableCoinbase: true
})

function ContextProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export default ContextProvider
