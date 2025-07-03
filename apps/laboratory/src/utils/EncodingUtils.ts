import bs58 from 'bs58'

import type { Address } from '@reown/appkit-common'

const PUBLIC_KEY_PREFIX = 0x04
const PUBLIC_KEY_LENGTH = 65

// eslint-disable-next-line no-shadow
export enum KeyTypes {
  secp256k1 = 'secp256k1',
  secp256r1 = 'secp256r1'
}

export function encodePublicKeyToDID(publicKey: string, keyType: string): string {
  // Define the key type to DID prefix mapping
  const keyTypeToDIDPrefix: Record<string, string> = {
    secp256k1: 'did:key:zQ3s',
    secp256r1: 'did:key:zDn'
  }

  // Check if the key type is supported
  if (!(keyType in keyTypeToDIDPrefix)) {
    throw new Error('Unsupported key type.')
  }

  // Remove '0x' prefix if present
  const modifiedPublicKey = publicKey.startsWith('0x') ? publicKey.slice(2) : publicKey

  // Convert publicKey to Buffer
  const publicKeyBuffer = Buffer.from(modifiedPublicKey, 'hex')

  // Base58 encode the public key
  const encodedPublicKey = bs58.encode(publicKeyBuffer)

  // Get the DID prefix for the key type
  const didPrefix = keyTypeToDIDPrefix[keyType]

  // Construct the did:key
  return `${didPrefix}${encodedPublicKey}`
}

export function decodeDIDToPublicKey(did: string): {
  key: `0x${string}`
  keyType: KeyTypes
} {
  // Define the DID prefix to key type mapping
  const didPrefixToKeyType: Record<string, KeyTypes> = {
    'did:key:zQ3s': KeyTypes.secp256k1,
    'did:key:zDn': KeyTypes.secp256r1
  }

  // Find the matching key type prefix
  const matchingPrefix = Object.keys(didPrefixToKeyType).find(prefix => did.startsWith(prefix))

  if (!matchingPrefix) {
    throw new Error('Invalid DID format. Unsupported key type.')
  }

  // Extract the Base58 encoded part
  const encodedPart = did.slice(matchingPrefix.length)

  // Decode the Base58 string
  const decodedBuffer = bs58.decode(encodedPart)

  // Convert the Buffer to a hex string
  const publicKey = Buffer.from(decodedBuffer).toString('hex')

  // Add the '0x' prefix
  const formattedPublicKey = `0x${publicKey}`

  const keyType = didPrefixToKeyType[matchingPrefix]

  return {
    key: formattedPublicKey as Address,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    keyType: keyType!
  }
}
export function decodeUncompressedPublicKey(uncompressedPublicKey: string): `0x${string}` {
  const uncompressedPublicKeyBuffer = Buffer.from(uncompressedPublicKey, 'base64')

  if (uncompressedPublicKeyBuffer.length !== PUBLIC_KEY_LENGTH) {
    throw new Error('Invalid uncompressed public key length')
  }

  const header = uncompressedPublicKeyBuffer[0]
  if (header !== PUBLIC_KEY_PREFIX) {
    throw new Error('Invalid uncompressed public key header')
  }

  const publicKey = uncompressedPublicKeyBuffer.toString('hex')

  return `0x${publicKey}`
}

export function hexStringToBase64(hexString: string): string {
  // Remove the `0x` prefix if it exists
  const cleanedHexString = hexString.replace(/^0x/u, '')

  // Convert the hex string to a Buffer
  const buffer = Buffer.from(cleanedHexString, 'hex')

  // Convert the Buffer to a base64 string
  return buffer.toString('base64')
}
