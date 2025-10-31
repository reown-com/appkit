import type { Namespace, NamespaceConfig } from '@walletconnect/universal-provider'

import type { CaipNetwork } from '@reown/appkit-common'

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
const solanaChainIds = {
  mainnet: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  deprecatedMainnet: '4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ',
  devnet: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  deprecatedDevnet: '8E9rvCKLFQia2Y35HXjjpWzj8weVo44K'
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

export function createNamespaces(caipNetworks: CaipNetwork[]): NamespaceConfig {
  return caipNetworks.reduce<NamespaceConfig>((acc, chain) => {
    const { id, chainNamespace, rpcUrls } = chain
    const rpcUrl = rpcUrls.default.http[0]

    if (!acc[chainNamespace]) {
      acc[chainNamespace] = createDefaultNamespace(chainNamespace)
    }

    const caipNetworkId = `${chainNamespace}:${id}`

    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const namespace = acc[chainNamespace]

    namespace?.chains.push(caipNetworkId)

    // Workaround for wallets that only support deprecated Solana network ID
    switch (caipNetworkId) {
      case solanaChainIds.mainnet:
        namespace.chains.push(solanaChainIds.deprecatedMainnet)
        break
      case solanaChainIds.devnet:
        namespace.chains.push(solanaChainIds.deprecatedDevnet)
        break
      default:
    }

    if (namespace?.rpcMap && rpcUrl) {
      namespace.rpcMap[id] = rpcUrl
    }

    return acc
  }, {})
}
