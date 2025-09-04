import type { SessionTypes } from '@walletconnect/types'
import type { Namespace, NamespaceConfig } from '@walletconnect/universal-provider'
import type UniversalProvider from '@walletconnect/universal-provider'

import {
  type CaipAddress,
  type CaipNetwork,
  type CaipNetworkId,
  type ChainNamespace,
  ParseUtil,
  type ParsedCaipAddress
} from '@reown/appkit-common'
import { EnsController, type OptionsControllerState } from '@reown/appkit-controllers'

import { solana, solanaDevnet } from '../networks/index.js'

interface ListenWcProviderParams {
  universalProvider: UniversalProvider
  namespace: ChainNamespace
  onConnect?: (parsedData: ParsedCaipAddress[]) => void
  onDisconnect?: () => void
  onAccountsChanged?: (parsedData: ParsedCaipAddress[]) => void
  onChainChanged?: (chainId: number | string) => void
  onDisplayUri?: (uri: string) => void
}

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
    overrides?: OptionsControllerState['universalProviderConfigOverride']
  ): NamespaceConfig {
    if (!overrides) {
      return { ...baseNamespaces }
    }

    const result = { ...baseNamespaces }

    const namespacesToOverride = new Set<ChainNamespace>()

    if (overrides.methods) {
      Object.keys(overrides.methods).forEach(ns => namespacesToOverride.add(ns as ChainNamespace))
    }

    if (overrides.chains) {
      Object.keys(overrides.chains).forEach(ns => namespacesToOverride.add(ns as ChainNamespace))
    }

    if (overrides.events) {
      Object.keys(overrides.events).forEach(ns => namespacesToOverride.add(ns as ChainNamespace))
    }

    if (overrides.rpcMap) {
      Object.keys(overrides.rpcMap).forEach(chainId => {
        const [ns] = chainId.split(':')
        if (ns) {
          namespacesToOverride.add(ns as ChainNamespace)
        }
      })
    }

    namespacesToOverride.forEach(ns => {
      if (!result[ns]) {
        result[ns] = this.createDefaultNamespace(ns)
      }
    })

    if (overrides.methods) {
      Object.entries(overrides.methods).forEach(([ns, methods]) => {
        if (result[ns]) {
          result[ns].methods = methods
        }
      })
    }

    if (overrides.chains) {
      Object.entries(overrides.chains).forEach(([ns, chains]) => {
        if (result[ns]) {
          result[ns].chains = chains
        }
      })
    }

    if (overrides.events) {
      Object.entries(overrides.events).forEach(([ns, events]) => {
        if (result[ns]) {
          result[ns].events = events
        }
      })
    }

    if (overrides.rpcMap) {
      const processedNamespaces = new Set<string>()

      Object.entries(overrides.rpcMap).forEach(([chainId, rpcUrl]) => {
        const [ns, id] = chainId.split(':')
        if (!ns || !id || !result[ns]) {
          return
        }

        if (!result[ns].rpcMap) {
          result[ns].rpcMap = {}
        }

        if (!processedNamespaces.has(ns)) {
          result[ns].rpcMap = {}
          processedNamespaces.add(ns)
        }

        result[ns].rpcMap[id] = rpcUrl
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
  },

  isOriginAllowed(
    currentOrigin: string,
    allowedPatterns: string[],
    defaultAllowedOrigins: string[]
  ): boolean {
    for (const pattern of [...allowedPatterns, ...defaultAllowedOrigins]) {
      if (pattern.includes('*')) {
        // Convert wildcard pattern to regex, escape special chars, replace *, match whole string
        const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
        const regexString = `^${escapedPattern.replace(/\\\*/gu, '.*')}$`
        const regex = new RegExp(regexString, 'u')

        if (regex.test(currentOrigin)) {
          return true
        }
      } else {
        /**
         * There are some cases where pattern is getting just the origin, where using new URL(pattern).origin will throw an error
         * thus we a try catch to handle this case
         */
        try {
          if (new URL(pattern).origin === currentOrigin) {
            return true
          }
        } catch (e) {
          if (pattern === currentOrigin) {
            return true
          }
        }
      }
    }

    // No match found
    return false
  },

  listenWcProvider({
    universalProvider,
    namespace,
    onConnect,
    onDisconnect,
    onAccountsChanged,
    onChainChanged,
    onDisplayUri
  }: ListenWcProviderParams) {
    if (onConnect) {
      universalProvider.on('connect', () => {
        const accounts = WcHelpersUtil.getWalletConnectAccounts(universalProvider, namespace)

        onConnect(accounts)
      })
    }

    if (onDisconnect) {
      universalProvider.on('disconnect', () => {
        onDisconnect()
      })
    }

    if (onAccountsChanged) {
      /*
       * In multichain scenario - every adapter will listen to accountsChanged event
       * so make sure to call `onAccountsChanged` only on the namespace that actually has accounts changed
       */
      universalProvider.on('accountsChanged', (accounts: string[]) => {
        try {
          const allAccounts = universalProvider.session?.namespaces?.[namespace]?.accounts || []
          const defaultChain = universalProvider.rpcProviders?.[namespace]?.getDefaultChain()

          const parsedAccounts = accounts
            .map(account => {
              const caipAccount = allAccounts.find(acc =>
                acc.includes(`${namespace}:${defaultChain}:${account}`)
              )
              if (!caipAccount) {
                return undefined
              }

              const { chainId, chainNamespace } = ParseUtil.parseCaipAddress(
                caipAccount as CaipAddress
              )

              return {
                address: account,
                chainId,
                chainNamespace
              }
            })
            .filter(account => account !== undefined)

          // Emit accountsChanged event only if there are accounts
          if (parsedAccounts.length > 0) {
            onAccountsChanged(parsedAccounts)
          }
        } catch (error) {
          console.warn(
            'Failed to parse accounts for namespace on accountsChanged event',
            namespace,
            accounts,
            error
          )
        }
      })
    }

    if (onChainChanged) {
      universalProvider.on('chainChanged', (chainId: number | string) => {
        onChainChanged(chainId)
      })
    }

    if (onDisplayUri) {
      universalProvider.on('display_uri', (uri: string) => {
        onDisplayUri(uri)
      })
    }
  },

  getWalletConnectAccounts(universalProvider: UniversalProvider, namespace: ChainNamespace) {
    const accountsAdded = new Set<string>()

    const accounts = universalProvider?.session?.namespaces?.[namespace]?.accounts
      ?.map(account => ParseUtil.parseCaipAddress(account as CaipAddress))
      .filter(({ address }) => {
        if (accountsAdded.has(address.toLowerCase())) {
          return false
        }

        accountsAdded.add(address.toLowerCase())

        return true
      })

    if (accounts && accounts.length > 0) {
      return accounts
    }

    return []
  }
}

export namespace WcHelpersUtil {
  export type SessionEventData = {
    id: string
    topic: string
    params: { chainId: string; event: { data: unknown; name: string } }
  }
}
