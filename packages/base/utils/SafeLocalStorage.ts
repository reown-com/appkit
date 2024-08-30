export type SafeLocalStorageItems = {
  '@w3m/wallet_id': string
  '@w3m/solana_caip_chain': string
  '@w3m/solana_wallet': string
}

export const SafeLocalStorage = {
  setItem<Key extends keyof SafeLocalStorageItems>(
    key: Key,
    value: SafeLocalStorageItems[Key]
  ): void {
    if (isSafe()) {
      localStorage.setItem(key, JSON.stringify(value))
    }
  },
  getItem<Key extends keyof SafeLocalStorageItems>(key: Key): SafeLocalStorageItems[Key] | null {
    if (isSafe()) {
      const value = localStorage.getItem(key)

      if (value) {
        try {
          return JSON.parse(value)
        } catch {
          return null
        }
      }
    }

    return null
  },
  removeItem<Key extends keyof SafeLocalStorageItems>(key: Key): void {
    if (isSafe()) {
      localStorage.removeItem(key)
    }
  }
}

function isSafe(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}
