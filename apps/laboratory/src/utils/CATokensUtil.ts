export const usdcTokenAddresses: Record<number, `0x${string}`> = {
  42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  10: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
}
export const usdtTokenAddresses: Record<number, `0x${string}`> = {
  42161: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  10: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58'
  // 8453: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", // Base - No liqiduty
}

export const tokenAddresses: Record<string, Record<string, `0x${string}`>> = {
  USDC: usdcTokenAddresses,
  USDT: usdtTokenAddresses
}

export function getSupportedNetworks(token: string): number[] {
  const tokenNetworks = tokenAddresses[token]
  if (!tokenNetworks) {
    throw new Error(`Token ${token} not found`)
  }

  return Object.keys(tokenNetworks).map(Number)
}
