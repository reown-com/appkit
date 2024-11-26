import type { BaseNetwork } from '@reown/appkit-common'
import { createPublicClient, http } from 'viem'
import { type Address } from 'viem/accounts'
import { type Chain } from 'viem/chains'

export interface ProviderWrapper {
  getBalance: (address: Address) => Promise<bigint>
  lookupAddress: (address: Address) => Promise<string | null>
  getAvatar: (name: string | null) => Promise<string | null>
}

export function createProviderWrapper(rpcUrl: string, chain: BaseNetwork): ProviderWrapper {
  const client = createPublicClient({
    transport: http(rpcUrl),
    chain: chain as Chain
  })

  return {
    async getBalance(address: Address) {
      return await client.getBalance({ address })
    },

    async lookupAddress(address: Address) {
      return await client.getEnsName({ address })
    },

    async getAvatar(name: string | null) {
      return await client.getEnsAvatar({ name: name || '' })
    }
  }
}
