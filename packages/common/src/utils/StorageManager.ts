export interface Storage {
  getItem(key: string): string | null | undefined | Promise<string | null | undefined>
  setItem(key: string, value: string): void | Promise<void>
  removeItem(key: string): void | Promise<void>
}

export class StorageManager {
  private static instance: StorageManager
  private storage: Storage
  private isAsync: boolean

  private constructor(storage?: Storage) {
    this.storage = storage ?? {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(key)
        } catch {
          return null
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value)
        } catch {
          console.info(`Unable to set item with key: ${key}`)
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key)
        } catch {
          console.info(`Unable to remove item with key: ${key}`)
        }
      }
    }

    // Check if any of the storage methods return a Promise
    this.isAsync = [
      this.storage.getItem('test'),
      this.storage.setItem('test', 'test'),
      this.storage.removeItem('test')
    ].some(result => result instanceof Promise)
  }

  public static getInstance(storage?: Storage): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager(storage)
    } else if (storage) {
      // Update storage if provided
      StorageManager.instance.storage = storage
      StorageManager.instance.isAsync = [
        storage.getItem('test'),
        storage.setItem('test', 'test'),
        storage.removeItem('test')
      ].some(result => result instanceof Promise)
    }
    return StorageManager.instance
  }

  public getStorage(): Storage {
    return this.storage
  }

  public getItem(key: string): string | null | undefined | Promise<string | null | undefined> {
    return this.storage.getItem(key)
  }

  public setItem(key: string, value: string): void | Promise<void> {
    return this.storage.setItem(key, value)
  }

  public removeItem(key: string): void | Promise<void> {
    return this.storage.removeItem(key)
  }

  public isAsyncStorage(): boolean {
    return this.isAsync
  }
}
