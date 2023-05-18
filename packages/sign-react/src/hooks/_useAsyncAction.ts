import { useState } from 'react'

export function useAsyncAction<T>() {
  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState<unknown | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  return { data, error, loading, setData, setError, setLoading }
}
