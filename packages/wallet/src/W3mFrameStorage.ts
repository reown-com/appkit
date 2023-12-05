import { W3mFrameConstants } from './W3mFrameConstants.js'

export const W3mFrameStorage = {
  set(key: string, value: string) {
    localStorage.setItem(`${W3mFrameConstants.STORAGE_KEY}${key}`, value)
  },

  get(key: string) {
    return localStorage.getItem(`${W3mFrameConstants.STORAGE_KEY}${key}`)
  },

  delete(key: string) {
    localStorage.removeItem(`${W3mFrameConstants.STORAGE_KEY}${key}`)
  }
}
