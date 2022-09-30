import { useOptionalChainId } from './useOptionalChainId'

type Options<O> = O & {
  chainId?: number
}

export function useChainAgnosticOptions<O>(options?: Options<O>) {
  const chainId = useOptionalChainId(options?.chainId)

  return { ...options, chainId }
}
