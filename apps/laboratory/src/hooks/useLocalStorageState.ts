import { useEffect, useState } from 'react'
import { getItem, setItem } from '../utils/LocalStorage'

/**
 * Custom hook that manages state in local storage.
 *
 * @template T - The type of the state value.
 * @param {string} key - The key used to store the state value in local storage.
 * @param {T} initialValue - The initial value of the state.
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>]} - An array containing the current state value and a function to update the state.
 */
function useLocalStorageState<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(initialValue)

  useEffect(() => {
    const storedValue = getItem(key)

    // This naive hook might write 'undefined' or 'null' to local storage as a string
    if (storedValue && storedValue !== 'undefined' && storedValue !== 'null') {
      try {
        setState(JSON.parse(storedValue) as T)
      } catch {
        setState(storedValue as T)
      }
    }
  }, [key])

  useEffect(() => {
    if (state) {
      setItem(key, state)
    }
  }, [key, state])

  return [state, setState]
}

export { useLocalStorageState }
