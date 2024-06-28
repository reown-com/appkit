import type { Connector } from '@web3modal/scaffold'
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'

import type { BaseWalletAdapter } from '@solana/wallet-adapter-base'

export function createWalletAdapters(adapters: BaseWalletAdapter[]) {
  const result = []
  for (const Adapter of adapters) {
    // @ts-expect-error no constructor
    result.push(new Adapter())
  }

  return result
}

export function syncInjectedWallets(
  w3mConnectors: Connector[],
  adapters: BaseWalletAdapter[]
) {
  for (const adapter of adapters) {
    w3mConnectors.push({
      id: adapter.name,
      type: 'ANNOUNCED',
      imageUrl: adapter.icon,
      name: adapter.name,
      provider: adapter
    })
  }

  if (window.backpack) {
    const adapter = new BackpackWalletAdapter()
    w3mConnectors.push({
      id: adapter.name,
      type: 'ANNOUNCED',
      imageUrl: adapter.icon,
      name: adapter.name,
      provider: adapter
    })
  }
}
