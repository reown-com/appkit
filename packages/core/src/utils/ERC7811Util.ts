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
  metadata: TokenMetadata
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
    return {
      name: asset.metadata.name,
      symbol: asset.metadata.symbol,
      chainId,
      address:
        asset.address === 'native'
          ? undefined
          : this.convertAddressToCAIP10Address(asset.address, chainId),
      value: asset.metadata.value,
      price: asset.metadata.price,
      quantity: {
        decimals: asset.metadata.decimals.toString(),
        numeric: this.convertHexToBalance({
          hex: asset.balance,
          decimals: asset.metadata.decimals
        })
      },
      iconUrl: asset.metadata.iconUrl
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
    const chainPart = caip2ChainId.split(':')[1] ?? '0'

    return `0x${parseInt(chainPart, 10).toString(16)}`
  }
}
