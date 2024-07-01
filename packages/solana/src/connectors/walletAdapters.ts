import type { Connector } from '@web3modal/scaffold'
import { ConstantsUtil } from '@web3modal/common'

import type { BaseWalletAdapter } from '@solana/wallet-adapter-base'

export function syncInjectedWallets(w3mConnectors: Connector[], adapters: BaseWalletAdapter[]) {
  for (const adapter of adapters) {
    w3mConnectors.push({
      id: adapter.name,
      type: 'EXTERNAL',
      imageUrl: adapter.icon,
      name: adapter.name,
      provider: adapter,
      chain: ConstantsUtil.CHAIN.SOLANA
    })
  }
}
