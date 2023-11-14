import localforage from 'localforage'

export function createW3mFrameStorage(name: string, storeName: string) {
  return localforage.createInstance({
    driver: localforage.INDEXEDDB,
    name,
    storeName
  })
}
