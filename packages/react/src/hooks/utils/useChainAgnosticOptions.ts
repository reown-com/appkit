import { useEffect, useState } from 'react'
import { useOptionalChainId } from './useOptionalChainId'

type Options<O> = O & {
  chainId?: number
}

export function useChainAgnosticOptions<O>(options?: Options<O>) {
  const [chainOptions, setChainOptions] = useState(options)
  const chainId = useOptionalChainId(options?.chainId)

  useEffect(() => {
    // @ts-expect-error chainId exists
    setChainOptions(prev => ({ ...prev, chainId }))
  }, [chainId])

  return chainOptions
}
