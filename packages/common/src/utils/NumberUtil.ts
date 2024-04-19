import BigNumber from 'bignumber.js'

export const NumberUtil = {
  bigNumber(value: BigNumber.Value) {
    return new BigNumber(value)
  },

  /**
   * Multiply two numbers represented as strings with BigNumber to handle decimals correctly
   * @param a string
   * @param b string
   * @returns
   */
  multiply(a: BigNumber.Value | undefined, b: BigNumber.Value | undefined) {
    if (a === undefined || b === undefined) {
      // eslint-disable-next-line new-cap
      return BigNumber(0)
    }

    const aBigNumber = new BigNumber(a)
    const bBigNumber = new BigNumber(b)

    return aBigNumber.multipliedBy(bBigNumber)
  }
}
