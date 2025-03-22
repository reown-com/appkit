import type { CaipAddress } from '@reown/appkit-common'

/**
 * Extract plain address from CAIP address format
 * @param caipAddress - The CAIP formatted address (e.g. 'eip155:1:0x123...')
 * @returns Plain address without the network prefix
 */
export function getPlainAddress(caipAddress: CaipAddress): string {
  return caipAddress.split(':').pop() || ''
}

/**
 * Get the chain ID from a CAIP address
 * @param caipAddress - The CAIP formatted address (e.g. 'eip155:1:0x123...')
 * @returns The chain ID (e.g. '1')
 */
export function getChainIdFromCaipAddress(caipAddress: CaipAddress): string | undefined {
  const parts = caipAddress.split(':')
  return parts.length >= 2 ? parts[1] : undefined
}

/**
 * Format a CAIP address from address and chain ID
 * @param address - The plain address (e.g. '0x123...')
 * @param chainId - The chain ID (e.g. '1')
 * @returns The CAIP formatted address (e.g. 'eip155:1:0x123...')
 */
export function formatCaipAddress(
  address: string,
  chainNamespace: string,
  chainId: string
): CaipAddress {
  return `${chainNamespace}:${chainId}:${address}` as CaipAddress
}

/**
 * Check if URL is HTTP or HTTPS
 * @param url - The URL to check
 * @returns True if the URL is HTTP or HTTPS
 */
export function isHttpUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://')
}

/**
 * Delay execution for a specified time
 * @param ms - Time to delay in milliseconds
 * @returns Promise that resolves after specified time
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Format an address for display (truncate middle)
 * @param address - The address to format
 * @param prefixLength - Number of characters to show at start (default: 6)
 * @param suffixLength - Number of characters to show at end (default: 4)
 * @returns Formatted address with ellipsis in middle
 */
export function formatAddress(address: string, prefixLength = 6, suffixLength = 4): string {
  if (address.length < prefixLength + suffixLength) {
    return address
  }

  return `${address.substring(0, prefixLength)}...${address.substring(
    address.length - suffixLength
  )}`
}
