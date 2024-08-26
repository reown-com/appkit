export function withSolanaNamespace<T = string | undefined>(
  chainId?: T
): T extends string ? `solana:${string}` : undefined {
  if (typeof chainId === 'string') {
    return `solana:${chainId}` as T extends string ? `solana:${string}` : undefined
  }

  return undefined as T extends string ? `solana:${string}` : undefined
}
