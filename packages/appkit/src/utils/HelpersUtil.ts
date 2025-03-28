import type { SessionTypes } from '@walletconnect/types'
import type { Namespace, NamespaceConfig } from '@walletconnect/universal-provider'

import type { CaipNetwork, CaipNetworkId, ChainNamespace } from '@reown/appkit-common'
import { EnsController, type OptionsControllerState } from '@reown/appkit-controllers'

import { solana, solanaDevnet } from '../networks/index.js'

export const DEFAULT_METHODS = {
  solana: [
    'solana_signMessage',
    'solana_signTransaction',
    'solana_requestAccounts',
    'solana_getAccounts',
    'solana_signAllTransactions',
    'solana_signAndSendTransaction'
  ],
  eip155: [
    'eth_accounts',
    'eth_requestAccounts',
    'eth_sendRawTransaction',
    'eth_sign',
    'eth_signTransaction',
    'eth_signTypedData',
    'eth_signTypedData_v3',
    'eth_signTypedData_v4',
    'eth_sendTransaction',
    'personal_sign',
    'wallet_switchEthereumChain',
    'wallet_addEthereumChain',
    'wallet_getPermissions',
    'wallet_requestPermissions',
    'wallet_registerOnboarding',
    'wallet_watchAsset',
    'wallet_scanQRCode',
    // EIP-5792
    'wallet_getCallsStatus',
    'wallet_showCallsStatus',
    'wallet_sendCalls',
    'wallet_getCapabilities',
    // EIP-7715
    'wallet_grantPermissions',
    'wallet_revokePermissions',
    //EIP-7811
    'wallet_getAssets'
  ],
  bip122: ['sendTransfer', 'signMessage', 'signPsbt', 'getAccountAddresses']
}

export const WcHelpersUtil = {
  getMethodsByChainNamespace(chainNamespace: ChainNamespace): string[] {
    return DEFAULT_METHODS[chainNamespace as keyof typeof DEFAULT_METHODS] || []
  },
  createDefaultNamespace(chainNamespace: ChainNamespace): Namespace {
    return {
      methods: this.getMethodsByChainNamespace(chainNamespace),
      events: ['accountsChanged', 'chainChanged'],
      chains: [],
      rpcMap: {}
    }
  },

  applyNamespaceOverrides(
    baseNamespaces: NamespaceConfig,
    overrides: OptionsControllerState['universalProviderConfigOverride']
  ): NamespaceConfig {
    const result = { ...baseNamespaces }
    if (!overrides) {
      return baseNamespaces
    }

    // Apply complete namespace overrides
    if (overrides.namespaces) {
      Object.entries(overrides.namespaces).forEach(([key, namespace]) => {
        result[key] = namespace
      })
    }

    // Apply method overrides
    if (overrides.methods) {
      Object.entries(overrides.methods).forEach(([namespace, methods]) => {
        if (!result[namespace]) {
          result[namespace] = this.createDefaultNamespace(namespace as ChainNamespace)
        }
        result[namespace].methods = methods
      })
    }

    // Apply chain overrides
    if (overrides.chains) {
      Object.entries(overrides.chains).forEach(([namespace, chains]) => {
        if (!result[namespace]) {
          result[namespace] = this.createDefaultNamespace(namespace as ChainNamespace)
        }
        result[namespace].chains = chains
      })
    }

    // Apply event overrides
    if (overrides.events) {
      Object.entries(overrides.events).forEach(([namespace, events]) => {
        if (!result[namespace]) {
          result[namespace] = this.createDefaultNamespace(namespace as ChainNamespace)
        }
        result[namespace].events = events
      })
    }

    // Apply RPC map overrides
    if (overrides.rpcMap) {
      // First, group RPC map overrides by namespace
      const rpcMapByNamespace: Record<string, Record<string, string>> = {}

      Object.entries(overrides.rpcMap).forEach(([chainId, rpcUrl]) => {
        const [namespace, id] = chainId.split(':')
        if (!namespace || !id) {
          return
        }

        if (!rpcMapByNamespace[namespace]) {
          rpcMapByNamespace[namespace] = {}
        }

        rpcMapByNamespace[namespace][id] = rpcUrl
      })

      // Then apply the grouped overrides, replacing the entire rpcMap for each namespace
      Object.entries(rpcMapByNamespace).forEach(([namespace, rpcMap]) => {
        if (!result[namespace]) {
          result[namespace] = this.createDefaultNamespace(namespace as ChainNamespace)
        }

        // Replace the entire rpcMap instead of merging
        result[namespace].rpcMap = rpcMap
      })
    }

    return result
  },

  createNamespaces(
    caipNetworks: CaipNetwork[],
    configOverride?: OptionsControllerState['universalProviderConfigOverride']
  ): NamespaceConfig {
    const defaultNamespaces = caipNetworks.reduce<NamespaceConfig>((acc, chain) => {
      const { id, chainNamespace, rpcUrls } = chain
      const rpcUrl = rpcUrls.default.http[0]

      if (!acc[chainNamespace]) {
        acc[chainNamespace] = this.createDefaultNamespace(chainNamespace)
      }

      const caipNetworkId = `${chainNamespace}:${id}`

      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
      const namespace = acc[chainNamespace]

      namespace.chains.push(caipNetworkId)

      // Workaround for wallets that only support deprecated Solana network ID
      switch (caipNetworkId) {
        case solana.caipNetworkId:
          namespace.chains.push(solana.deprecatedCaipNetworkId)
          break
        case solanaDevnet.caipNetworkId:
          namespace.chains.push(solanaDevnet.deprecatedCaipNetworkId)
          break
        default:
      }

      if (namespace?.rpcMap && rpcUrl) {
        namespace.rpcMap[id] = rpcUrl
      }

      return acc
    }, {})

    return this.applyNamespaceOverrides(defaultNamespaces, configOverride)
  },

  resolveReownName: async (name: string) => {
    const wcNameAddress = await EnsController.resolveName(name)
    const networkNameAddresses = Object.values(wcNameAddress?.addresses) || []

    return networkNameAddresses[0]?.address || false
  },

  getChainsFromNamespaces(namespaces: SessionTypes.Namespaces = {}): CaipNetworkId[] {
    return Object.values(namespaces).flatMap<CaipNetworkId>(namespace => {
      const chains = (namespace.chains || []) as CaipNetworkId[]
      const accountsChains = namespace.accounts.map(account => {
        const [chainNamespace, chainId] = account.split(':')

        return `${chainNamespace}:${chainId}` as CaipNetworkId
      })

      return Array.from(new Set([...chains, ...accountsChains]))
    })
  },

  isSessionEventData(data: unknown): data is WcHelpersUtil.SessionEventData {
    return (
      typeof data === 'object' &&
      data !== null &&
      'id' in data &&
      'topic' in data &&
      'params' in data &&
      typeof data.params === 'object' &&
      data.params !== null &&
      'chainId' in data.params &&
      'event' in data.params &&
      typeof data.params.event === 'object' &&
      data.params.event !== null
    )
  }
}

export namespace WcHelpersUtil {
  export type SessionEventData = {
    id: string
    topic: string
    params: { chainId: string; event: { data: unknown; name: string } }
  }
}
