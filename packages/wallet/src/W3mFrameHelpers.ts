import { W3mFrameStorage } from './W3mFrameStorage.js'
import { W3mFrameConstants } from './W3mFrameConstants.js'

const RESTRICTED_TIMEZONES = [
  'ASIA/SHANGHAI',
  'ASIA/URUMQI',
  'ASIA/CHONGQING',
  'ASIA/HARBIN',
  'ASIA/KASHGAR',
  'ASIA/MACAU',
  'ASIA/HONG_KONG',
  'ASIA/MACAO',
  'ASIA/BEIJING',
  'ASIA/HARBIN'
]

export const W3mFrameHelpers = {
  getBlockchainApiUrl() {
    try {
      const { timeZone } = new Intl.DateTimeFormat().resolvedOptions()
      const capTimeZone = timeZone.toUpperCase()

      return RESTRICTED_TIMEZONES.includes(capTimeZone)
        ? 'https://rpc.walletconnect.org'
        : 'https://rpc.walletconnect.com'
    } catch {
      return false
    }
  },

  checkIfAllowedToTriggerEmail() {
    const lastEmailLoginTime = W3mFrameStorage.get(W3mFrameConstants.LAST_EMAIL_LOGIN_TIME)
    if (lastEmailLoginTime) {
      const difference = Date.now() - Number(lastEmailLoginTime)
      if (difference < 30_000) {
        const cooldownSec = Math.ceil((30_000 - difference) / 1000)
        throw new Error(`Please try again after ${cooldownSec} seconds`)
      }
    }
  }
}
