/* eslint-disable newline-before-return */
import { baseSepolia, optimismSepolia, sepolia } from '@reown/appkit/networks'

/**
 * Token symbol to address mapping for each supported chain
 */
export const TOKEN_CONFIG: Record<number, Record<string, string>> = {
  // Base Sepolia tokens
  [baseSepolia.id]: {
    USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
  },
  // Sepolia tokens
  [sepolia.id]: {
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
  },
  // Optimism Sepolia tokens
  [optimismSepolia.id]: {
    USDC: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7'
  }
}

/**
 * Get token address by chain ID and symbol
 */
export function getTokenAddress(chainId: number, symbol: string): string | undefined {
  return TOKEN_CONFIG[chainId]?.[symbol]
}

/**
 * Get token symbol by chain ID and address
 */
export function getTokenSymbol(chainId: number, address: string): string | undefined {
  const tokenMap = TOKEN_CONFIG[chainId]
  if (!tokenMap) {
    return undefined
  }

  const entry = Object.entries(tokenMap).find(
    ([_, tokenAddress]) => tokenAddress.toLowerCase() === address.toLowerCase()
  )

  return entry?.[0]
}

/**
 * Get token symbol from a CAIP-19 asset identifier
 * Example formats:
 * - 'eip155:11155111/erc20:0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' (ERC20 token)
 * - 'eip155:11155111/slip44:60' (Native ETH)
 */
export function getTokenSymbolFromAsset(asset?: string): string {
  // Handle undefined or empty asset
  if (!asset) {
    return 'Unknown'
  }

  // Extract parts from the asset identifier
  const parts = asset.split('/')
  const chainPart = parts[0]?.split(':') || []
  const chainId = Number(chainPart[1] || '0')

  // Handle only known token types

  // Case 1: Native ETH (slip44:60) - this is standard for Ethereum
  if (parts[1]?.startsWith('slip44:60')) {
    return 'ETH'
  }

  // Case 2: ERC20 tokens - check if we know this specific token
  if (parts[1]?.startsWith('erc20:')) {
    const tokenAddress = parts[1].split(':')[1]
    if (tokenAddress) {
      // Look up symbol in our config
      const symbol = getTokenSymbol(chainId, tokenAddress)
      if (symbol) {
        return symbol
      }

      // For unknown ERC20, display a shortened address
      return `0x${tokenAddress.substring(0, 4)}..${tokenAddress.substring(tokenAddress.length - 4)}`
    }
  }

  // For all other cases, return "Unknown" with chainId if available for some context
  return chainId ? `Unknown (Chain ${chainId})` : 'Unknown Asset'
}
