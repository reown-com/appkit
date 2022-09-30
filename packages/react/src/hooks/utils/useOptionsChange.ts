import { useEffect, useState } from 'react'

export function useOptionsChange<TOptions>(callback: () => void, options?: TOptions) {
  const newOptions = typeof options === 'object' ? JSON.stringify(options) : undefined
  const [prevOptions, setPrevOptions] = useState(newOptions)

  useEffect(() => {
    if (newOptions && prevOptions && newOptions !== prevOptions) callback()
    setPrevOptions(newOptions)
  }, [newOptions, prevOptions, callback])
}
