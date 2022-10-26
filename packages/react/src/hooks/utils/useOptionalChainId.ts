import { useNetwork } from '../data/useNetwork'

export function useOptionalChainId(chainId?: number) {
  const data = useNetwork()

  return 'chain' in data ? chainId ?? data.chain?.id ?? 0 : 0
}
