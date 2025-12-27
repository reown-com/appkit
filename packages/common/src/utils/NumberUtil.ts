import Big from 'big.js'

// -- Types --------------------------------------------- //
interface BigNumberParams {
  safe?: boolean
}

interface FormatNumberParams {
  decimals: number
  round?: number
  safe?: boolean
}

export const NumberUtil = {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  bigNumber(
    value: Big | string | number | undefined,
    params: BigNumberParams = {
      safe: false
    }
  ) {
    try {
      if (!value) {
        return new Big(0)
      }

      return new Big(value)
    } catch (err) {
      if (params.safe) {
        return new Big(0)
      }

      throw err
    }
  },

  formatNumber(value: Big | number | string | undefined, params: FormatNumberParams) {
    const { decimals, round = 8, safe = true } = params

    const bigNumber = NumberUtil.bigNumber(value, { safe })

    return bigNumber.div(new Big(10).pow(decimals)).round(round)
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
   * Format the given number or string to a string with the given number of decimals
   * @example NumberUtil.toFixedNumber('12345.6789', 2) => '12345.68'
   * @param value - The value to format. It could be a number or string. If it's a string, it will be parsed to a float then formatted.
   * @param decimals - number of decimals after dot
   * @returns
   */
  toFixed(value: string | number | undefined, decimals = 2) {
    if (value === undefined || value === '') {
      return new Big(0).toFixed(decimals)
    }

    return new Big(value).toFixed(decimals)
  },
  /**
   * Format the given number or string to human readable numbers with commas with the given number of decimals
   * @example NumberUtil.formatNumberToLocalString('12345.6789', 2) => '12,345.68'
   * @param value - The value to format. It could be a number or string. If it's a string, it will be parsed to a float then formatted.
   * @param decimals - number of decimals after dot
   * @returns
   */
  formatNumberToLocalString(value: string | number | undefined, decimals = 2) {
    if (value === undefined || value === '') {
      return '0.00'
    }

    if (typeof value === 'number') {
      return value.toLocaleString('en-US', {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
        roundingMode: 'floor'
      })
    }

    return parseFloat(value).toLocaleString('en-US', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
      roundingMode: 'floor'
    })
  },
  /**
   * Parse a formatted local string back to a number
   * @param value - The formatted string to parse
   * @returns
   */
  parseLocalStringToNumber(value: string | undefined) {
    if (value === undefined || value === '') {
      return 0
    }

    // Remove commas from the string to handle formatted numbers
    const sanitizedValue = value.replace(/,/gu, '')

    return new Big(sanitizedValue).toNumber()
  }
}
