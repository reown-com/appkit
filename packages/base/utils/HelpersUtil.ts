import type { Chain, Namespace } from './TypesUtil.js'

export const WcHelpersUtil = {
  hexStringToNumber(value: string) {
    const string = value.startsWith('0x') ? value.slice(2) : value
    const number = parseInt(string, 16)

    return number
  },
  numberToHexString(value: number) {
    return `0x${value.toString(16)}`
  },
  getMethodsByChainType(chainType: string): string[] {
    switch (chainType) {
      case 'solana':
        return []
      case 'evm':
        return []
      case 'polkadot':
        return []
      case 'cosmos':
        return []
      default:
        return []
    }
  },
  createNamespaces(chains: Chain[]): Namespace {
    return chains.reduce<Namespace>((acc, chain) => {
      const { chainId, chain: chainType, rpcUrl } = chain
      // eslint-disable-next-line @typescript-eslint/no-useless-template-literals
      const namespaceKey = `${chainType === 'evm' ? 'eip155' : chainType}`
      const methods = this.getMethodsByChainType(chainType)

      if (!acc[namespaceKey]) {
        acc[namespaceKey] = {
          methods,
          events: ['accountsChanged', 'chainChanged'],
          chains: [],
          rpcMap: {}
        }
      }

      const fullChainId = `${namespaceKey}:${chainId}`
      acc[namespaceKey].chains.push(fullChainId)
      acc[namespaceKey].rpcMap[fullChainId] =
        typeof rpcUrl === 'function' ? rpcUrl(chainId) : rpcUrl

      return acc
    }, {})
  },
  extractDetails(fullIdentifier: string): {
    chainType: string
    chainId: string
    address?: string
  } {
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
