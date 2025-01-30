import Big from 'big.js'

export const NumberUtil = {
  bigNumber(value: string | number) {
    return new Big(value)
  },

  /**
   * Multiply two numbers represented as strings with Big to handle decimals correctly
   * @param a string
   * @param b string
   * @returns
   */
  multiply(a: string | number | undefined, b: string | number | undefined) {
    if (a === undefined || b === undefined) {
      return new Big(0)
    }

    const aBig = new Big(a)
    const bBig = new Big(b)

    return aBig.times(bBig)
  },

  /**
   * Divide two numbers using Big to handle decimals correctly
   * @param a string
   * @param b string
   * @returns
   */
  divide(a: string | number | undefined, b: string | number | undefined) {
    if (a === undefined || b === undefined) {
      return new Big(0)
    }

    const aBig = new Big(a)
    const bBig = new Big(b)

    if (bBig.eq(0)) {
      throw new Error('Division by zero')
    }

    return aBig.div(bBig)
  },

  /**
   * Format the given number or string to human readable numbers with the given number of decimals
   * @param value - The value to format. It could be a number or string. If it's a string, it will be parsed to a float then formatted.
   * @param decimals - number of decimals after dot
   * @returns
   */
  formatNumberToLocalString(value: string | number | undefined, decimals = 2) {
    if (value === undefined) {
      return '0.00'
    }

    if (typeof value === 'number') {
      return value.toFixed(decimals)
    }

    return new Big(value).toFixed(decimals)
  },

  /**
   * Parse a formatted local string back to a number
   * @param value - The formatted string to parse
   * @returns
   */
  parseLocalStringToNumber(value: string | undefined) {
    if (value === undefined) {
      return 0
    }

    // Remove any commas used as thousand separators and parse the float
    return Number(new Big(value.replace(/,/gu, '')))
  }
}
