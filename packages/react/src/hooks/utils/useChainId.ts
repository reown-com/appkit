import { useProvider } from '../data/useProvider'

export function useChainId() {
  const provider = useProvider()

  return provider.network.chainId
}
