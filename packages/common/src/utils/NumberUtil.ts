import Big from 'big.js'

export const NumberUtil = {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  bigNumber(value: Big | string | number | undefined) {
    if (!value) {
      return new Big(0)
    }

    return new Big(value)
  },

  /**
   * Multiply two numbers represented as strings with BigNumber to handle decimals correctly
   * @param a string
   * @param b string
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  multiply(a: Big | number | string | undefined, b: Big | number | string | undefined) {
    if (a === undefined || b === undefined) {
      return new Big(0)
    }

    const aBigNumber = new Big(a)
    const bBigNumber = new Big(b)

    return aBigNumber.times(bBigNumber)
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
      return value.toLocaleString('en-US', {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals
      })
    }

    return parseFloat(value).toLocaleString('en-US', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals
    })
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
    return parseFloat(value.replace(/,/gu, ''))
  }
}
