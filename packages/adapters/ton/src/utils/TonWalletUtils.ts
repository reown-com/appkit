// Type guards
import type {
  TonWalletInfo,
  TonWalletInfoInjectable,
  TonWalletInfoRemote
} from '@reown/appkit-utils/ton'

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

export function toUserFriendlyAddress(hexAddress: string, opts: ToUserFriendlyOpts = {}): string {
  const { wc, hex } = parseHexAddress(hexAddress)

  let tag = opts.bounceable ? 0x11 : 0x51
  if (opts.testOnly) {
    tag |= 0x80
  }

  const addr = new Uint8Array(34)
  addr[0] = tag
  addr[1] = wc === -1 ? 0xff : 0x00
  addr.set(hex, 2)

  const out = new Uint8Array(36)
  out.set(addr, 0)
  out.set(crc16(addr), 34)

  const b64 = base64FromBytes(out)

  return b64.replace(/\+/g, '-').replace(/\//g, '_')
}

function parseHexAddress(raw: string): { wc: 0 | -1; hex: Uint8Array } {
  const parts = raw.split(':')
  if (parts.length !== 2) {
    throw new Error(`Invalid address (expected "wc:hex"): ${raw}`)
  }

  const wcNum = parseInt(parts[0]!, 10)
  if (wcNum !== 0 && wcNum !== -1) {
    throw new Error(`Invalid workchain: ${wcNum}`)
  }

  const hex = parts[1]!.toLowerCase()
  if (!/^[0-9a-f]{64}$/.test(hex)) {
    throw new Error(`Hex must be 64 chars (32 bytes): ${hex}`)
  }

  return { wc: wcNum as 0 | -1, hex: hexToBytes(hex) }
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.substr(i * 2, 2), 16)
  }

  return out
}

// CRC16-CCITT (poly 0x1021), initial 0x0000
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

function base64FromBytes(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64')
  }
  let bin = ''
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]!)
  }

  return btoa(bin)
}

// -- Reverse: user-friendly (base64url) -> raw hex address ------------------- //

export function userFriendlyToRawAddress(address: string): string {
  const bytes = base64UrlToBytes(address)
  if (bytes.length !== 36) {
    throw new Error('Invalid address length')
  }

  const addr = bytes.slice(0, 34)
  const checksum = bytes.slice(34, 36)
  const calc = crc16(addr)
  if (checksum[0] !== calc[0] || checksum[1] !== calc[1]) {
    throw new Error('Invalid checksum')
  }

  const wcByte = addr[1]
  const wc = wcByte === 0xff ? -1 : 0

  const hash = addr.slice(2)
  const hex = Array.from(hash)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return `${wc}:${hex}`
}

function base64UrlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=')
  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(padded, 'base64'))
  }
  const bin = atob(padded)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i)
  }

  return out
}
