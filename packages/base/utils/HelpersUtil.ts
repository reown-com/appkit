import type { Chain } from 'viem'
import type { Namespace } from './TypesUtil.js'
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
  createWagmiNamespaces(chains: Chain[]): Namespace {
    return chains.reduce<Namespace>((acc, chain) => {
      const { id, rpcUrls } = chain

      // eslint-disable-next-line @typescript-eslint/no-useless-template-literals

      const methods = this.getMethodsByChainNamespace('eip155')

      if (!acc['eip155']) {
        acc['eip155'] = {
          methods,
          events: ['accountsChanged', 'chainChanged'],
          chains: [],
          rpcMap: {}
        }
      }

      const fullChainId = `eip155:${id}`
      // @ts-ignore
      acc['eip155'].chains.push(fullChainId)
      // @ts-ignore
      acc['eip155'].rpcMap[fullChainId] = rpcUrls[0]?.http
      // typeof rpcUrl === 'function' ? rpcUrl(chainId) : rpcUrl

      return acc
    }, {})
  },
  createNamespaces(caipNetworks: CaipNetwork[]): Namespace {
    return caipNetworks.reduce<Namespace>((acc, chain) => {
      const { chainId, chainNamespace, rpcUrl } = chain

      // eslint-disable-next-line @typescript-eslint/no-useless-template-literals

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
      // @ts-ignore
      acc[chainNamespace].chains.push(fullChainId)
      // @ts-ignore
      acc[chainNamespace].rpcMap[fullChainId] = rpcUrl
      // typeof rpcUrl === 'function' ? rpcUrl(chainId) : rpcUrl

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
