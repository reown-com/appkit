import { W3mFrameConstants } from './W3mFrameConstants.js'
import { W3mFrameHelpers } from './W3mFrameHelpers.js'

export const W3mFrameStorage = {
  set(key: string, value: string) {
    if (W3mFrameHelpers.isClient) {
      localStorage.setItem(`${W3mFrameConstants.STORAGE_KEY}${key}`, value)
    }
  },

  get(key: string) {
    if (W3mFrameHelpers.isClient) {
      return localStorage.getItem(`${W3mFrameConstants.STORAGE_KEY}${key}`)
    }

    return null
  },

  delete(key: string) {
    if (W3mFrameHelpers.isClient) {
      localStorage.removeItem(`${W3mFrameConstants.STORAGE_KEY}${key}`)
    }
  }
}
