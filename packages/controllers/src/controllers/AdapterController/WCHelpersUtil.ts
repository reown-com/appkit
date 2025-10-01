import type {
  Namespace,
  NamespaceConfig,
  UniversalProvider
} from '@walletconnect/universal-provider'

import {
  type CaipAddress,
  type CaipNetwork,
  type ChainNamespace,
  ErrorUtil,
  ParseUtil
} from '@reown/appkit-common'
import type { OptionsControllerState } from '@reown/appkit-controllers'

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

export function getMethodsByChainNamespace(chainNamespace: string): string[] {
  return DEFAULT_METHODS[chainNamespace as keyof typeof DEFAULT_METHODS] || []
}

export function createDefaultNamespace(chainNamespace: string): Namespace {
  return {
    methods: getMethodsByChainNamespace(chainNamespace),
    events: ['accountsChanged', 'chainChanged'],
    chains: [],
    rpcMap: {}
  }
}

export function createNamespaces(
  caipNetworks: CaipNetwork[],
  configOverride?: OptionsControllerState['universalProviderConfigOverride']
): NamespaceConfig {
  const defaultNamespaces = caipNetworks.reduce<NamespaceConfig>((acc, chain) => {
    const { id, chainNamespace, rpcUrls } = chain
    const rpcUrl = rpcUrls.default.http[0]

    if (!acc[chainNamespace]) {
      acc[chainNamespace] = createDefaultNamespace(chainNamespace)
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

  return applyNamespaceOverrides(defaultNamespaces, configOverride)
}

export function applyNamespaceOverrides(
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
      result[ns] = createDefaultNamespace(ns)
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
}

export function isUserRejectedRequestError(error: unknown) {
  try {
    if (typeof error === 'object' && error !== null) {
      return ErrorUtil.isUserRejectedRequestError(error)
    }

    return false
  } catch {
    return false
  }
}

export function getWalletConnectAccounts(
  universalProvider: Awaited<ReturnType<(typeof UniversalProvider)['init']>>,
  namespace: ChainNamespace
) {
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
