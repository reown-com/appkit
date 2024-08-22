import type { Namespace } from '@walletconnect/universal-provider'
import type { NamespaceConfig } from '@walletconnect/universal-provider'
import type { CaipNetwork, ChainNamespace } from '@web3modal/common'

export const WcHelpersUtil = {
  hexStringToNumber(value: string) {
    const string = value.startsWith('0x') ? value.slice(2) : value
    const number = parseInt(string, 16)

    return number
  },

  numberToHexString(value: number) {
    return `0x${value.toString(16)}`
  },

  getMethodsByChainNamespace(chainNamespace: ChainNamespace): string[] {
    switch (chainNamespace) {
      case 'solana':
        return ['solana_signMessage']
      case 'eip155':
        return ['personal_sign']
      default:
        return []
    }
  },

  createNamespaces(caipNetworks: CaipNetwork[]): NamespaceConfig {
    return caipNetworks.reduce<NamespaceConfig>((acc, chain) => {
      const { chainId, chainNamespace, rpcUrl } = chain

      const methods = this.getMethodsByChainNamespace(chainNamespace)

      if (!acc[chainNamespace]) {
        acc[chainNamespace] = {
          methods,
          events: ['accountsChanged', 'chainChanged'],
          chains: [],
          rpcMap: {}
        }
      }

      const fullChainId = `${chainNamespace}:${chainId}`

      const namespace = acc[chainNamespace] as Namespace

      namespace.chains.push(fullChainId)

      if (namespace?.rpcMap) {
        namespace.rpcMap[fullChainId] = rpcUrl
      }

      return acc
    }, {})
  },

  extractDetails(fullIdentifier: string | undefined): {
    chainType: string | undefined
    chainId: string | undefined
    address?: string
  } {
    if (!fullIdentifier) {
      return {
        chainType: undefined,
        chainId: undefined
      }
    }

    const parts = fullIdentifier.split(':')
    if (parts.length < 2 || parts.length > 3) {
      throw new Error(`Invalid format: ${fullIdentifier}`)
    }

    const [chainType, chainId, address] = parts

    return {
      chainType,
      chainId,
      address
    }
  }
}
