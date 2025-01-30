import type { TemplateResult } from 'lit'

export class CacheUtil<K, V> {
  private cache = new Map<K, V>()

  set(key: K, value: V): void {
    this.cache.set(key, value)
  }

  get(key: K): V | undefined {
    return this.cache.get(key)
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  delete(key: K): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
}

export const globalSvgCache = new CacheUtil<string, Promise<TemplateResult<2>>>()
