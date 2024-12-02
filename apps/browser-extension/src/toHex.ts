import { BigNumber } from '@ethersproject/bignumber'
import { hexValue } from '@ethersproject/bytes'

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export function toHex(stringToConvert: string | number | BigNumber) {
  return hexValue(BigNumber.from(stringToConvert).toHexString())
}
