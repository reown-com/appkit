type BigIntValue = string | number | bigint

export const NumberUtil = {
  bigNumber(value: BigIntValue) {
    if (typeof value === 'bigint') {
      return value
    }

    return toBigInt(value)
  },

  multiply(a: BigIntValue | undefined, b: BigIntValue | undefined) {
    if (a === undefined || b === undefined) {
      return 0n
    }
    const aBig = typeof a === 'bigint' ? a : toBigInt(a)
    const bBig = typeof b === 'bigint' ? b : toBigInt(b)

    return aBig * bBig
  },

  divide(a: BigIntValue | undefined, b: BigIntValue | undefined) {
    if (a === undefined || b === undefined) {
      return 0n
    }
    const aBig = typeof a === 'bigint' ? a : toBigInt(a)
    const bBig = typeof b === 'bigint' ? b : toBigInt(b)

    /*
     * When dividing with decimals, we need to scale up the numerator
     * to maintain precision
     */
    if (bBig === 0n) {
      throw new Error('Division by zero')
    }

    // Scale up by additional 18 decimals for division precision
    const scale = 18
    const scaledA = aBig * 10n ** BigInt(scale)

    return scaledA / bBig
  },

  formatNumberToLocalString(value: string | number | undefined, decimals = 2) {
    if (value === undefined) {
      return '0.00'
    }
    const num = typeof value === 'number' ? value : parseFloat(value)

    return num.toFixed(decimals)
  },

  parseLocalStringToNumber(value: string | undefined) {
    if (value === undefined) {
      return 0
    }

    return parseFloat(value)
  }
}

function toBigInt(value: string | number, decimals = 18): bigint {
  const str = value.toString().replace(/,/gu, '')
  const [whole, fraction = ''] = str.split('.')
  const paddedFraction = fraction.padEnd(decimals, '0')

  return BigInt(whole + paddedFraction)
}
