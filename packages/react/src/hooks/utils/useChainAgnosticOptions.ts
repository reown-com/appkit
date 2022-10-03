import { useOptionalChainId } from './useOptionalChainId'

type Options<TOptions> = TOptions & {
  chainId?: number
}

export function useChainAgnosticOptions<TOptions>(options: Options<TOptions>) {
  const chainId = useOptionalChainId(options.chainId)

  return { ...options, chainId }
}
