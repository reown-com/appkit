import type { WathBlockNumberArgs } from '@web3modal/ethereum'
import { Web3ModalEthereum } from '@web3modal/ethereum'
import { useEffect, useState } from 'react'

interface UseBlockNumberArguments {
  watch: boolean
}

export function useBlockNumber(
  { listen }: WathBlockNumberArgs[0],
  callback: WathBlockNumberArgs[1]
) {
  const [blockNumber, setBlockNumber] = useState<number | undefined>(undefined)

  useEffect(() => {
    const unsubscribe = Web3ModalEthereum.watchBlockNumber({ listen }, newBlockNumber =>
      setBlockNumber(newBlockNumber)
    )

    return () => unsubscribe()
  }, [listen])

  return {
    data: blockNumber
  }
}
