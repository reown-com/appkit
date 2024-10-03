import type { NamespaceConfig, Namespace } from '@walletconnect/universal-provider'
import type { CaipNetwork, CaipNetworkId, ChainNamespace } from '@reown/appkit-common'
import type { SessionTypes } from '@walletconnect/types'

export const WcHelpersUtil = {
  getMethodsByChainNamespace(chainNamespace: ChainNamespace): string[] {
    switch (chainNamespace) {
      case 'solana':
        return [
          'solana_signMessage',
          'solana_signTransaction',
          'solana_requestAccounts',
          'solana_getAccounts',
          'solana_signAllTransactions',
          'solana_signAndSendTransaction'
        ]
      case 'eip155':
        return [
          'personal_sign',
          'eth_sign',
          'eth_signTransaction',
          'eth_signTypedData',
          'eth_signTypedData_v3',
          'eth_signTypedData_v4',
          'eth_sendRawTransaction',
          'eth_sendTransaction',
          'wallet_getCapabilities',
          'wallet_sendCalls',
          'wallet_showCallsStatus',
          'wallet_getCallsStatus',
          'wallet_switchEthereumChain'
        ]
      default:
        return []
    }
  },

  createNamespaces(caipNetworks: CaipNetwork[]): NamespaceConfig {
    return caipNetworks.reduce<NamespaceConfig>((acc, chain) => {
      const { id, chainNamespace, rpcUrls } = chain
      const rpcUrl = rpcUrls.default.http[0]

      const methods = this.getMethodsByChainNamespace(chainNamespace)

      if (!acc[chainNamespace]) {
        acc[chainNamespace] = {
          methods,
          events: ['accountsChanged', 'chainChanged'],
          chains: [],
          rpcMap: {}
        } satisfies Namespace
      }

      const fullChainId = `${chainNamespace}:${id}`

      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
      const namespace = acc[chainNamespace] as Namespace

      namespace.chains.push(fullChainId)

      if (namespace?.rpcMap && rpcUrl) {
        namespace.rpcMap[id] = rpcUrl
      }

      return acc
    }, {})
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
  }
}
