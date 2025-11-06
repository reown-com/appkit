import type {
  TonWalletInfo,
  TonWalletInfoInjectable,
  TonWalletInfoRemote
} from '@reown/appkit-utils/ton'

import { Base64 } from './Base64.js'

export function isWalletInfoInjectable(value: TonWalletInfo): value is TonWalletInfoInjectable {
  return 'jsBridgeKey' in value
}

export function isWalletInfoRemote(value: TonWalletInfo): value is TonWalletInfoRemote {
  return 'bridgeUrl' in value && typeof value.bridgeUrl === 'string'
}

export type TonWalletInfoCurrentlyInjected = TonWalletInfoInjectable & { injected: true }
export type TonWalletInfoCurrentlyEmbedded = TonWalletInfoCurrentlyInjected & { embedded: true }

export function isWalletInfoCurrentlyInjected(
  value: TonWalletInfo
): value is TonWalletInfoCurrentlyInjected {
  return isWalletInfoInjectable(value) && value.injected
}

export function isWalletInfoCurrentlyEmbedded(
  value: TonWalletInfo
): value is TonWalletInfoCurrentlyEmbedded {
  return isWalletInfoCurrentlyInjected(value) && value.embedded
}

export type ToUserFriendlyOpts = {
  testOnly?: boolean
  bounceable?: boolean
}

const bounceableTag = 0x11
const noBounceableTag = 0x51
const testOnlyTag = 0x80

export function toUserFriendlyAddress(hexAddress: string, testOnly = false): string {
  const { wc, hex } = parseHexAddress(hexAddress)

  let tag = noBounceableTag
  if (testOnly) {
    tag |= testOnlyTag
  }

  const addr = new Int8Array(34)
  addr[0] = tag
  addr[1] = wc
  addr.set(hex, 2)

  const addressWithChecksum = new Uint8Array(36)
  addressWithChecksum.set(addr)
  addressWithChecksum.set(crc16(Uint8Array.from(addr)), 34)

  const addressBase64 = Base64.encode(addressWithChecksum)

  return addressBase64.replace(/\+/gu, '-').replace(/\//gu, '_')
}

function parseHexAddress(raw: string): { wc: 0 | -1; hex: Uint8Array } {
  const parts = raw.split(':')
  if (parts.length !== 2) {
    throw new Error(`Invalid address (expected "wc:hex"): ${raw}`)
  }

  const wcPart = parts[0]
  if (!wcPart) {
    throw new Error('Missing workchain')
  }

  const wcNum = parseInt(wcPart, 10)
  if (wcNum !== 0 && wcNum !== -1) {
    throw new Error(`Invalid workchain: ${wcNum}`)
  }

  const hexPart = parts[1]
  if (!hexPart) {
    throw new Error('Missing hex part')
  }

  const hex = hexPart.toLowerCase()
  if (!/^[0-9a-f]{64}$/u.test(hex)) {
    throw new Error(`Hex must be 64 chars (32 bytes): ${hex}`)
  }

  return { wc: wcNum as 0 | -1, hex: hexToBytes(hex) }
}

const toByteMap: Record<string, number> = {}

for (let ord = 0; ord <= 0xff; ord += 1) {
  let s = ord.toString(16)
  if (s.length < 2) {
    s = `0${s}`
  }
  toByteMap[s] = ord
}

export function hexToBytes(hex: string): Uint8Array {
  const lowerHex = hex.toLowerCase()
  const length2 = lowerHex.length

  if (length2 % 2 !== 0) {
    throw new Error(`Hex string must have length a multiple of 2: ${lowerHex}`)
  }

  const length = length2 / 2
  const result = new Uint8Array(length)

  for (let i = 0; i < length; i += 1) {
    const doubled = i * 2
    const hexSubstring = lowerHex.substring(doubled, doubled + 2)

    if (!Object.hasOwn(toByteMap, hexSubstring)) {
      throw new Error(`Invalid hex character: ${hexSubstring}`)
    }

    const byteValue = toByteMap[hexSubstring]
    if (byteValue === undefined) {
      throw new Error(`Invalid hex character: ${hexSubstring}`)
    }
    result[i] = byteValue
  }

  return result
}

function crc16(data: Uint8Array): Uint8Array {
  const poly = 0x1021
  let reg = 0
  const msg = new Uint8Array(data.length + 2)
  msg.set(data)
  for (const byte of msg) {
    let mask = 0x80
    while (mask) {
      reg <<= 1
      if (byte & mask) {
        reg += 1
      }
      mask >>= 1
      if (reg > 0xffff) {
        reg &= 0xffff
        reg ^= poly
      }
    }
  }

  return new Uint8Array([Math.floor(reg / 256), reg % 256])
}

// -- Reverse: user-friendly (base64url) -> raw hex address ------------------- //
/**
 * Parses user-friendly address and returns its components.
 * @param address user-friendly address
 * @returns parsed address components
 */
export function parseUserFriendlyAddress(address: string): {
  wc: 0 | -1
  hex: string
  testOnly: boolean
  isBounceable: boolean
} {
  const base64 = address.replace(/-/gu, '+').replace(/_/gu, '/')

  let decoded: Uint8Array | undefined = undefined
  try {
    decoded = Base64.decode(base64).toUint8Array()
  } catch {
    throw new Error(`Invalid base64 encoding in address: ${address}`)
  }

  if (decoded.length !== 36) {
    throw new Error(`Invalid address length: ${address}`)
  }

  const addr = decoded.slice(0, 34)
  const checksum = decoded.slice(34, 36)

  const calculatedChecksum = crc16(addr)
  if (!checksum.every((byte, i) => byte === calculatedChecksum[i])) {
    throw new Error(`Invalid checksum in address: ${address}`)
  }

  const tagValue = addr[0]
  if (tagValue === undefined) {
    throw new Error(`Invalid address: missing tag byte`)
  }
  let tag = tagValue
  let isTestOnly = false
  let isBounceable = false
  if (tag & testOnlyTag) {
    isTestOnly = true
    tag ^= testOnlyTag
  }
  if (tag !== bounceableTag && tag !== noBounceableTag) {
    throw new Error(`Unknown address tag: ${tag}`)
  }

  isBounceable = tag === bounceableTag
  let wc = null
  if (addr[1] === 0xff) {
    // Note: This is a simplified check for workchain -1 (0xff as unsigned byte)
    wc = -1
  } else {
    wc = addr[1] as 0 | -1
  }
  const hex = addr.slice(2)

  if (wc !== 0 && wc !== -1) {
    throw new Error(`Invalid workchain: ${wc}`)
  }

  return {
    wc,
    hex: Array.from(hex)
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''),
    testOnly: isTestOnly,
    isBounceable
  }
}
