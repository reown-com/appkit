export const NAMESPACE = 'eip155'

export function getChainIdReference(chainId: string): number {
  if (typeof chainId === 'string' && chainId.includes(':')) {
    const id = Number(chainId.split(':')[1])

    return id
  }

  throw new Error('Invalid chainId, should be formated as namespace:id')
}

export function formatOpts<T>(opts: T & { chainId: string }): T & { chainId: number } {
  return {
    ...opts,
    chainId: getChainIdReference(opts.chainId)
  }
}
