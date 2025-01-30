import type { TemplateResult } from 'lit'

export class CacheUtil<K, V> {
  private cache = new Map<K, V>()

  set(key: K, value: V) {
    this.cache.set(key, value)
  }

  get(key: K): V | undefined {
    return this.cache.get(key)
  }

  has(key: K) {
    return this.cache.has(key)
  }

  delete(key: K) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }
}

export const globalSvgCache = new CacheUtil<string, Promise<TemplateResult<2>>>()
