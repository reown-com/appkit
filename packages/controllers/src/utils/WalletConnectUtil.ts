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

import { EnsController } from '../controllers/EnsController.js'
import type { OptionsControllerState } from '../controllers/OptionsController.js'
import { matchNonWildcardPattern, matchWildcardPattern, parseUrl } from './UrlUtils.js'

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
  ton: ['ton_sendMessage', 'ton_signData'],
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
  RPC_ERROR_CODE: {
    USER_REJECTED: 5000,
    USER_REJECTED_METHODS: 5002
  },

  /**
   * Retrieves the array of supported methods for a given chain namespace.
   * @param chainNamespace - The chain namespace.
   * @returns An array of method strings.
   */
  getMethodsByChainNamespace(chainNamespace: ChainNamespace): string[] {
    return DEFAULT_METHODS[chainNamespace as keyof typeof DEFAULT_METHODS] || []
  },

  /**
   * Creates a default WalletConnect namespace configuration for the given chain namespace.
   * @param chainNamespace - The chain namespace.
   * @returns The default Namespace object.
   */
  createDefaultNamespace(chainNamespace: ChainNamespace): Namespace {
    return {
      methods: this.getMethodsByChainNamespace(chainNamespace),
      events: ['accountsChanged', 'chainChanged'],
      chains: [],
      rpcMap: {}
    }
  },

  /**
   * Applies overrides to the base WalletConnect NamespaceConfig.
   * @param baseNamespaces - The base namespace configuration.
   * @param overrides - Optional overrides for methods, chains, events, rpcMap.
   * @returns The resulting NamespaceConfig with overrides applied.
   */
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

  /**
   * Creates WalletConnect namespaces based on CAIP network definitions,
   * optionally applying custom overrides.
   * @param caipNetworks - Array of CaipNetwork definitions.
   * @param configOverride - Optional overrides for namespaces.
   * @returns The resulting NamespaceConfig.
   */
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
        case 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp':
          namespace.chains.push('solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ')
          break
        case 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1':
          namespace.chains.push('solana:8E9rvCKLFQia2Y35HXjjpWzj8weVo44K')
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

  /**
   * Resolves a Reown/ENS name to its first matching address across configured networks.
   * @param name - The ENS or Reown name to resolve.
   * @returns The resolved address as a string, or false if not found.
   */
  resolveReownName: async (name: string) => {
    const wcNameAddress = await EnsController.resolveName(name)
    const networkNameAddresses = wcNameAddress?.addresses
      ? Object.values(wcNameAddress.addresses)
      : []

    return networkNameAddresses[0]?.address || false
  },

  /**
   * Extracts all CAIP network IDs used in given WalletConnect namespaces.
   * @param namespaces - WalletConnect Namespaces object.
   * @returns Array of CAIP network IDs (chainNamespace:chainId).
   */
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

  /**
   * Type guard to check if an object is a WalletConnect session event data.
   * @param data - The data to check.
   * @returns True if data matches SessionEventData structure.
   */
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

  /**
   * Detects if an error object represents a user-rejected WalletConnect request.
   * @param error - The error object to check.
   * @returns True if user rejected request, otherwise false.
   */
  isUserRejectedRequestError(error: unknown) {
    try {
      if (typeof error === 'object' && error !== null) {
        const objErr = error as Record<string, unknown>

        const hasCode = typeof objErr['code'] === 'number'
        const hasUserRejectedMethods =
          hasCode && objErr['code'] === WcHelpersUtil.RPC_ERROR_CODE.USER_REJECTED_METHODS
        const hasUserRejected =
          hasCode && objErr['code'] === WcHelpersUtil.RPC_ERROR_CODE.USER_REJECTED

        return hasUserRejectedMethods || hasUserRejected
      }

      return false
    } catch {
      return false
    }
  },

  /**
   * Checks if a current origin is allowed by configured allowed and default origin patterns.
   * Localhost and 127.0.0.1 are always allowed.
   * @param currentOrigin - The current web origin.
   * @param allowedPatterns - Patterns from project configuration.
   * @param defaultAllowedOrigins - Built-in or default allowed patterns.
   * @returns True if the origin is allowed, false otherwise.
   */
  isOriginAllowed(
    currentOrigin: string,
    allowedPatterns: string[],
    defaultAllowedOrigins: string[]
  ): boolean {
    const patterns = [...allowedPatterns, ...defaultAllowedOrigins]
    // Spec: empty allowlist allows all origins
    if (allowedPatterns.length === 0) {
      return true
    }
    // Parse current origin up-front
    const current = parseUrl(currentOrigin)
    if (!current) {
      // Legacy exact string equality when pattern has no wildcard
      return patterns.some(pattern => !pattern.includes('*') && pattern === currentOrigin)
    }

    // Local development is always permitted
    if (current.hostname === 'localhost' || current.hostname === '127.0.0.1') {
      return true
    }

    for (const pattern of patterns) {
      if (pattern.includes('*')) {
        if (matchWildcardPattern(current, currentOrigin, pattern)) {
          return true
        }
        // Keep checking remaining patterns
      } else if (matchNonWildcardPattern(currentOrigin, pattern)) {
        return true
      }
    }

    return false
  },

  /**
   * Attaches event listeners to a UniversalProvider instance for WalletConnect events.
   * @param params - The listener parameters including handlers for connect, disconnect, etc.
   */
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

  /**
   * Retrieves and parses the unique set of accounts for a given WalletConnect namespace.
   * @param universalProvider - The UniversalProvider instance.
   * @param namespace - The chain namespace to extract accounts for.
   * @returns Array of parsed CaipAddress objects.
   */
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
