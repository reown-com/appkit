export function formatBalance(balance: bigint, decimals: number): string {
  const value = Number(balance) / 10 ** decimals
  if (value >= 0.01) {
    return value.toFixed(2)
  }
  const significantDecimals = Math.min(6, decimals)

  return value.toFixed(significantDecimals).replace(/\.?0+$/u, '')
}

export function convertChainIdToHex(chainIdNumber: number): `0x${string}` {
  return `0x${chainIdNumber.toString(16)}`
}
