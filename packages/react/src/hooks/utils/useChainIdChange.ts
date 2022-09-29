import { useEffect, useState } from 'react'

export function useChainIdChange(callback: () => void, chainId?: number) {
  const [prevChainId, setPrevChainId] = useState(chainId)

  useEffect(() => {
    if (chainId && prevChainId && chainId !== prevChainId) callback()
    setPrevChainId(chainId)
  }, [chainId, prevChainId, callback])
}
