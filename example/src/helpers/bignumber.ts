import BigNumber from 'bignumber.js'

export function isNaN(value: string | number): boolean {
  return new BigNumber(`${value}`).isNaN()
}

export function isNumber(value: string | number): boolean {
  const isNaNResult = isNaN(value)
  return !isNaNResult
}

export function isInteger(value: string | number): boolean {
  return new BigNumber(`${value}`).isInteger()
}

export function isPositive(value: string | number): boolean {
  return new BigNumber(`${value}`).isPositive()
}

export function isNegative(value: string | number): boolean {
  return new BigNumber(`${value}`).isNegative()
}

export function isZero(value: string | number): boolean {
  return new BigNumber(`${value}`).isZero()
}

export function countDecimalPlaces(value: string | number): number {
  return new BigNumber(`${value}`).dp()
}

export function convertNumberToString(value: string | number): string {
  return new BigNumber(`${value}`).toString()
}

export function convertStringToNumber(value: string | number): number {
  return new BigNumber(`${value}`).toNumber()
}

export function convertHexToString(hex: string): string {
  return new BigNumber(`${hex}`).toString()
}

export function convertStringToHex(value: string | number): string {
  return new BigNumber(`${value}`).toString(16)
}

export function greaterThan(
  numberOne: number | string,
  numberTwo: number | string
): boolean {
  return (
    new BigNumber(`${numberOne}`).comparedTo(new BigNumber(`${numberTwo}`)) ===
    1
  )
}

export function greaterThanOrEqual(
  numberOne: number,
  numberTwo: number
): boolean {
  return (
    new BigNumber(`${numberOne}`).comparedTo(new BigNumber(`${numberTwo}`)) >= 0
  )
}

export function smallerThan(
  numberOne: number | string,
  numberTwo: number | string
): boolean {
  return (
    new BigNumber(`${numberOne}`).comparedTo(new BigNumber(`${numberTwo}`)) ===
    -1
  )
}

export function smallerThanOrEqual(
  numberOne: number,
  numberTwo: number
): boolean {
  return (
    new BigNumber(`${numberOne}`).comparedTo(new BigNumber(`${numberTwo}`)) <= 0
  )
}

export function multiply(
  numberOne: number | string,
  numberTwo: number | string
): string {
  return new BigNumber(`${numberOne}`)
    .times(new BigNumber(`${numberTwo}`))
    .toString()
}

export function divide(
  numberOne: number | string,
  numberTwo: number | string
): string {
  return new BigNumber(`${numberOne}`)
    .dividedBy(new BigNumber(`${numberTwo}`))
    .toString()
}

export function floorDivide(
  numberOne: number | string,
  numberTwo: number | string
): string {
  return new BigNumber(`${numberOne}`)
    .dividedToIntegerBy(new BigNumber(`${numberTwo}`))
    .toString()
}

export function mod(
  numberOne: number | string,
  numberTwo: number | string
): string {
  return new BigNumber(`${numberOne}`)
    .mod(new BigNumber(`${numberTwo}`))
    .toString()
}

export function add(
  numberOne: number | string,
  numberTwo: number | string
): string {
  return new BigNumber(`${numberOne}`)
    .plus(new BigNumber(`${numberTwo}`))
    .toString()
}

export function subtract(
  numberOne: number | string,
  numberTwo: number | string
): string {
  return new BigNumber(`${numberOne}`)
    .minus(new BigNumber(`${numberTwo}`))
    .toString()
}

export function convertAmountToRawNumber(
  value: string | number,
  decimals: number = 18
): string {
  return new BigNumber(`${value}`)
    .times(new BigNumber('10').pow(decimals))
    .toString()
}

export function convertAmountFromRawNumber(
  value: string | number,
  decimals: number = 18
): string {
  return new BigNumber(`${value}`)
    .dividedBy(new BigNumber('10').pow(decimals))
    .toString()
}

export function handleSignificantDecimals(
  value: string,
  decimals: number,
  buffer?: number
): string | null {
  if (
    !new BigNumber(`${decimals}`).isInteger() ||
    (buffer && !new BigNumber(`${buffer}`).isInteger())
  ) {
    return null
  }
  buffer = buffer ? convertStringToNumber(buffer) : 3
  decimals = convertStringToNumber(decimals)
  const absolute = new BigNumber(`${value}`).abs().toNumber()
  if (smallerThan(absolute, 1)) {
    decimals = value.slice(2).search(/[^0]/g) + buffer
    decimals = decimals < 8 ? decimals : 8
  } else {
    decimals = decimals < buffer ? decimals : buffer
  }
  let result = new BigNumber(`${value}`).toFixed(decimals)
  result = new BigNumber(`${result}`).toString()
  return new BigNumber(`${result}`).dp() <= 2
    ? new BigNumber(`${result}`).toFormat(2)
    : new BigNumber(`${result}`).toFormat()
}

export function formatFixedDecimals(value: string, decimals: number): string {
  const _value = convertNumberToString(value)
  const _decimals = convertStringToNumber(decimals)
  const result = new BigNumber(
    new BigNumber(_value).toFixed(_decimals)
  ).toString()
  return result
}

export function formatInputDecimals(
  inputOne: string,
  inputTwo: string
): string {
  const _nativeAmountDecimalPlaces = countDecimalPlaces(inputTwo)
  const decimals =
    _nativeAmountDecimalPlaces > 8 ? _nativeAmountDecimalPlaces : 8
  const result = new BigNumber(formatFixedDecimals(inputOne, decimals))
    .toFormat()
    .replace(/,/g, '')
  return result
}
