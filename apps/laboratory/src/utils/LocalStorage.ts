import { bigIntReplacer } from './CommonUtils'

export const PASSKEY_LOCALSTORAGE_KEY = 'passkeyId'
export const LAST_USED_ADDRESS_KEY = 'lastUsedAddress'
export const LOCAL_SIGNER_KEY = 'ecdsa-key'
export const SMART_SESSION_KEY = 'smart-session'
/**
 * Sets an item in the local storage.
 * @param key - The key to set the item with.
 * @param value - The value to be stored. It will be converted to a string using JSON.stringify.
 * @template T - The type of the value being stored.
 */
function setLocalStorageItem<T>(key: string, value: T) {
  if (typeof window !== 'undefined') {
    // To prevent silly mistakes with double stringifying
    if (typeof value === 'string') {
      window.localStorage.setItem(key, value)
    } else {
      window.localStorage.setItem(key, JSON.stringify(value, bigIntReplacer))
    }
  }
}

/**
 * Retrieves the value associated with the specified key from the local storage.
 *
 * @param key - The key of the item to retrieve.
 * @returns The value associated with the key, or null if the key does not exist.
 */
function getLocalStorageItem(key: string): string | null {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(key)
  }

  return null
}

function removeLocalStorageItem(key: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(key)
  }
}

export type PasskeyLocalStorageFormat = {
  rawId: string
  pubkeyCoordinates: {
    x: string
    y: string
  }
}
export { setLocalStorageItem, getLocalStorageItem, removeLocalStorageItem }
