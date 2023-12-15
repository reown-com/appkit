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

  getTimeDifferenceMs(deadlineMs: number) {
    return Date.now() - deadlineMs
  }
}
