import type { ChainNamespace } from '@reown/appkit-common'
import type { AdapterBlueprint } from './chain-adapters/ChainAdapterBlueprint.js'
import type UnviersalProvider from '@walletconnect/universal-provider'
import { UniversalAdapter } from './chain-adapters/UniversalAdapter.js'

type Adapters = Record<ChainNamespace, AdapterBlueprint>

export class AppKit {
  private adapters: Adapters

  private activeChainNamespace?: ChainNamespace

  private universalProvider?: UniversalProvider

  constructor({ adapters = [] }: AppKitOptions = {}) {
    this.adapters = adapters
  }

  private getAdapter(namespace: ChainNamespace) {
    return this.adapters.find(adapter => adapter.namespace === namespace)
  }

  private createAdapters(blueprints: AdapterBlueprint[]): Adapters {
    const universalAdapter = new UniversalAdapter({ universalProvider: this.universalProvider })

    return (['eip155', 'solana', 'polkadot'] as const).reduce((adapters, namespace) => {
      const blueprint = blueprints.find(b => b.namespace === namespace)
      if (blueprint) {
        adapters[namespace] = blueprint
      } else {
        adapters[namespace] = universalAdapter
      }

      return adapters
    }, {} as Adapters)
  }
}

export const AppKitController = new AppKit()

type AppKitOptions = {
  adapters?: AdapterBlueprint[]
}
