import { useNetwork } from '../data/useNetwork'

export function useOptionalChainId(chainId?: number) {
  const { chain } = useNetwork()

  return chainId ?? chain?.id
}
