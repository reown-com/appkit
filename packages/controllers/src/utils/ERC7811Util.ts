import { formatUnits } from 'viem'

import type { Balance, CaipNetworkId, ChainNamespace } from '@reown/appkit-common'

type Hex = `0x${string}`
interface TokenMetadata {
  name: string
  symbol: string
  decimals: number
  value?: number
  price: number
  iconUrl: string
}

interface Asset {
  address: `0x${string}` | 'native'
  balance: `0x${string}`
  type: 'NATIVE' | 'ERC20'
  metadata: Record<string, unknown>
}

export interface WalletGetAssetsRequest {
  account: Hex
  assetFilter?: Record<Hex, (Hex | 'native')[]>
  assetTypeFilter?: ('NATIVE' | 'ERC20')[]
  chainFilter?: Hex[]
}

export type WalletGetAssetsResponse = Record<Hex, Asset[]>

export const ERC7811Utils = {
  /**
   * Creates a Balance object from an ERC7811 Asset object
   * @param asset - Asset object to convert
   * @param chainId - Chain ID in CAIP-2 format
   * @returns Balance object
   */
  createBalance(asset: Asset, chainId: string): Balance {
    const metadata: TokenMetadata = {
      name: (asset.metadata['name'] || '') as string,
      symbol: (asset.metadata['symbol'] || '') as string,
      decimals: (asset.metadata['decimals'] || 0) as number,
      value: (asset.metadata['value'] || 0) as number,
      price: (asset.metadata['price'] || 0) as number,
      iconUrl: (asset.metadata['iconUrl'] || '') as string
    }

    return {
      name: metadata.name,
      symbol: metadata.symbol,
      chainId,
      address:
        asset.address === 'native'
          ? undefined
          : this.convertAddressToCAIP10Address(asset.address, chainId),
      value: metadata.value,
      price: metadata.price,
      quantity: {
        decimals: metadata.decimals.toString(),
        numeric: this.convertHexToBalance({
          hex: asset.balance,
          decimals: metadata.decimals
        })
      },
      iconUrl: metadata.iconUrl
    }
  },

  /**
   * Converts a hex string to a Balance object
   * @param hex - Hex string to convert
   * @param decimals - Number of decimals to use
   * @returns Balance object
   */
  convertHexToBalance({ hex, decimals }: { hex: `0x${string}`; decimals: number }): string {
    return formatUnits(BigInt(hex), decimals)
  },

  /**
   * Converts an address to a CAIP-10 address
   * @param address - Address to convert
   * @param chainId - Chain ID in CAIP-2 format
   * @returns CAIP-10 address
   */
  convertAddressToCAIP10Address(address: `0x${string}`, chainId: string): string {
    return `${chainId}:${address}`
  },

  /**
   *  Creates a CAIP-2 Chain ID from a chain ID and namespace
   * @param chainId  - Chain ID in hex format
   * @param namespace  - Chain namespace
   * @returns
   */
  createCAIP2ChainId(chainId: `0x${string}`, namespace: ChainNamespace): string {
    return `${namespace}:${parseInt(chainId, 16)}`
  },

  /**
   * Gets the chain ID in hex format from a CAIP-2 Chain ID
   * @param caip2ChainId - CAIP-2 Chain ID
   * @returns Chain ID in hex format
   */
  getChainIdHexFromCAIP2ChainId(caip2ChainId: CaipNetworkId): `0x${string}` {
    const parts = caip2ChainId.split(':')
    if (parts.length < 2 || !parts[1]) {
      return '0x0'
    }
    const chainPart = parts[1]
    const parsed = parseInt(chainPart, 10)

    return isNaN(parsed) ? '0x0' : `0x${parsed.toString(16)}`
  },

  /**
   * Checks if a response is a valid WalletGetAssetsResponse
   * @param response - The response to check
   * @returns True if the response is a valid WalletGetAssetsResponse, false otherwise
   */
  isWalletGetAssetsResponse(
    response: WalletGetAssetsResponse
  ): response is WalletGetAssetsResponse {
    // Check if response is an object and has the expected structure
    if (typeof response !== 'object' || response === null) {
      return false
    }

    // Check if all values are arrays and conform to the expected asset structure
    return Object.values(response).every(
      value => Array.isArray(value) && value.every(asset => this.isValidAsset(asset))
    )
  },

  /**
   * Checks if an asset object is valid.
   * @param asset - The asset object to check.
   * @returns True if the asset is valid, false otherwise.
   */
  isValidAsset(asset: Asset): asset is Asset {
    return (
      typeof asset === 'object' &&
      asset !== null &&
      typeof asset.address === 'string' &&
      typeof asset.balance === 'string' &&
      (asset.type === 'ERC20' || asset.type === 'NATIVE') &&
      typeof asset.metadata === 'object' &&
      asset.metadata !== null &&
      typeof asset.metadata['name'] === 'string' &&
      typeof asset.metadata['symbol'] === 'string' &&
      typeof asset.metadata['decimals'] === 'number' &&
      typeof asset.metadata['price'] === 'number' &&
      typeof asset.metadata['iconUrl'] === 'string'
    )
  }
}
