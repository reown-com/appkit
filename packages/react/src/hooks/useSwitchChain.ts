import { ClientCtrl } from '@web3modal/core'
import { useState } from 'react'

export function useSwitchChain() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)

  async function switchChain(chainId: string) {
    try {
      setIsLoading(true)
      setError(null)
      const chain = await ClientCtrl.ethereum().switchChain(chainId)

      return chain
    } catch (err: unknown) {
      return setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    switchChain,
    isLoading,
    error
  }
}
