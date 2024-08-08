import bs58 from 'bs58'

export function parseJSON(str: string) {
  try {
    return JSON.parse(str)
  } catch (error) {
    return { error: `Invalid JSON: ${error}` }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function bigIntReplacer(_key: string, value: any) {
  if (typeof value === 'bigint') {
    return value.toString()
  }

  return value
}

export function encodeSecp256k1PublicKeyToDID(publicKey: string) {
  // Remove '0x' prefix if present
  const modifiedPublicKey = publicKey.startsWith('0x') ? publicKey.slice(2) : publicKey

  // Convert publicKey to Buffer
  const publicKeyBuffer = Buffer.from(modifiedPublicKey, 'hex')

  // Base58 encode the address
  const encodedPublicKey = bs58.encode(publicKeyBuffer)

  // Construct the did:key
  return `did:key:zQ3s${encodedPublicKey}`
}
