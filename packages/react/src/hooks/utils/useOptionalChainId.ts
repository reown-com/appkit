import { useNetwork } from '../data/useNetwork'

export function useOptionalChainId(chainId?: number) {
  const { network } = useNetwork()

  return chainId ?? network?.chain?.id ?? 0
}
