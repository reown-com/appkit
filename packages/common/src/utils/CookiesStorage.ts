import Cookies from 'js-cookie'
import { SafeLocalStorageKeys, type SafeLocalStorageItems } from './SafeLocalStorage.js'

export const CookiesStorage = {
  setItem<Key extends keyof SafeLocalStorageItems>(
    key: Key,
    value: SafeLocalStorageItems[Key]
  ): void {
    const cookieKey = key.replace('@', '').replace('/', '.')
    Cookies.set(cookieKey, value)
  },

  getItem<Key extends keyof SafeLocalStorageItems>(
    key: Key
  ): SafeLocalStorageItems[Key] | undefined {
    const cookieKey = key.replace('@', '').replace('/', '.')

    return Cookies.get(cookieKey) as SafeLocalStorageItems[Key]
  },

  removeItem<Key extends keyof SafeLocalStorageItems>(key: Key): void {
    const cookieKey = key.replace('@', '').replace('/', '.')
    Cookies.remove(cookieKey)
  },

  clear(): void {
    Object.values(SafeLocalStorageKeys).forEach(key => {
      const cookieKey = key.replace('@', '').replace('/', '.')
      Cookies.remove(cookieKey)
    })
  }
}
