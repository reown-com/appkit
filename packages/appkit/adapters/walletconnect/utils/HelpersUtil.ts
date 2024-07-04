export const WalletConnectHelpersUtil = {
  hexStringToNumber(value: string) {
    const string = value.startsWith('0x') ? value.slice(2) : value
    const number = parseInt(string, 16)

    return number
  },
  numberToHexString(value: number) {
    return `0x${value.toString(16)}`
  }
}
