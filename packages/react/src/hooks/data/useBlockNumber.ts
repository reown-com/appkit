import { Web3ModalEthereum } from '@web3modal/ethereum'
import { useCallback, useEffect } from 'react'
import { useClientInitialized } from './useClientInitialized'

export function useBlockNumber() {
  const initialized = useClientInitialized()

  const listener = useCallback((data: number) => {
    console.log(data)
  }, [])

  useEffect(() => {
    const unsubscrbe = initialized
      ? Web3ModalEthereum.watchBlockNumber({ listen: true }, listener)
      : undefined
    console.log('SUBSCRIBE', unsubscrbe)

    return () => {
      console.log('UN-SUBSCRIBE', unsubscrbe)
      unsubscrbe?.()
    }
  }, [listener, initialized])
}
