import nacl from 'tweetnacl'
import { sha256 } from 'viem'
import { describe, expect, it } from 'vitest'

import type { SIWXSession } from '@reown/appkit-controllers'

import { StellarVerifier } from '../../src/verifiers/StellarVerifier.js'

/*
 * Legacy fixture generated from the deterministic Ed25519 seed [1..32]:
 * the signature covers sha256("StellarMessage" || 0x00 || message).
 */
const LEGACY_SEED = Uint8Array.from({ length: 32 }, (_, i) => i + 1)
const LEGACY_ADDRESS = 'GB43KVROR7TFJ6KAPCYRF2FJROTZAH4FHLTJLPWX4DRZCC5NASLGITR6'
const LEGACY_MESSAGE = 'appkit.reown.com wants you to sign in with your Stellar account'
const LEGACY_SIGNATURE =
  'cmq6ksk26JZzB39TGYN55+Q4SnsGaqZzZqD9hLnUJtYnrjlD0QYr4CbQYloxUeMo3p0blShnOiHnynyrbpA3Bw=='

/*
 * SEP-53 test vectors 1 and 2: the signature covers
 * sha256("Stellar Signed Message:\n" || message).
 */
const SEP53_ADDRESS = 'GBXFXNDLV4LSWA4VB7YIL5GBD7BVNR22SGBTDKMO2SBZZHDXSKZYCP7L'
const SEP53_ASCII_MESSAGE = 'Hello, World!'
const SEP53_ASCII_SIGNATURE =
  'fO5dbYhXUhBMhe6kId/cuVq/AfEnHRHEvsP8vXh03M1uLpi5e46yO2Q8rEBzu3feXQewcQE5GArp88u6ePK6BA=='
const SEP53_JAPANESE_MESSAGE = 'こんにちは、世界！'
const SEP53_JAPANESE_SIGNATURE =
  'CDU265Xs8y3OWbB/56H9jPgUss5G9A0qFuTqH2zs2YDgTm+++dIfmAEceFqB7bhfN3am59lCtDXrCtwH2k1GBA=='

function signWithFixtureSeed(prefix: string, separator: number[], message: string): string {
  const encoder = new TextEncoder()
  const payload = Uint8Array.from([
    ...encoder.encode(prefix),
    ...separator,
    ...encoder.encode(message)
  ])
  const { secretKey } = nacl.sign.keyPair.fromSeed(LEGACY_SEED)
  const signature = nacl.sign.detached(sha256(payload, 'bytes'), secretKey)

  return btoa(String.fromCharCode(...signature))
}

function mockSession(overrides?: {
  message?: string
  signature?: string
  accountAddress?: string
  chainId?: string
}): SIWXSession {
  return {
    data: {
      accountAddress: overrides?.accountAddress ?? LEGACY_ADDRESS,
      chainId: (overrides?.chainId ?? 'stellar:pubnet') as SIWXSession['data']['chainId'],
      domain: 'appkit.reown.com',
      uri: 'https://appkit.reown.com',
      version: '1',
      nonce: '12345678'
    },
    message: overrides?.message ?? LEGACY_MESSAGE,
    signature: overrides?.signature ?? LEGACY_SIGNATURE
  } as SIWXSession
}

describe('StellarVerifier', () => {
  const verifier = new StellarVerifier()

  it('claims stellar sessions only', () => {
    expect(verifier.chainNamespace).toBe('stellar')
    expect(verifier.shouldVerify(mockSession())).toBe(true)
    expect(verifier.shouldVerify(mockSession({ chainId: 'solana:mainnet' }))).toBe(false)
  })

  it('verifies the SEP-53 ASCII test vector', async () => {
    await expect(
      verifier.verify(
        mockSession({
          accountAddress: SEP53_ADDRESS,
          message: SEP53_ASCII_MESSAGE,
          signature: SEP53_ASCII_SIGNATURE
        })
      )
    ).resolves.toBe(true)
  })

  it('verifies the SEP-53 Japanese test vector', async () => {
    await expect(
      verifier.verify(
        mockSession({
          accountAddress: SEP53_ADDRESS,
          message: SEP53_JAPANESE_MESSAGE,
          signature: SEP53_JAPANESE_SIGNATURE
        })
      )
    ).resolves.toBe(true)
  })

  it('verifies a SEP-53 signature made with the account key', async () => {
    const signature = signWithFixtureSeed('Stellar Signed Message:\n', [], LEGACY_MESSAGE)

    await expect(verifier.verify(mockSession({ signature }))).resolves.toBe(true)
  })

  it('still verifies a signature over the legacy payload', async () => {
    await expect(verifier.verify(mockSession())).resolves.toBe(true)
  })

  it('rejects a tampered message under the SEP-53 payload', async () => {
    await expect(
      verifier.verify(
        mockSession({
          accountAddress: SEP53_ADDRESS,
          message: 'Hello, World?',
          signature: SEP53_ASCII_SIGNATURE
        })
      )
    ).resolves.toBe(false)
  })

  it('rejects a tampered message under the legacy payload', async () => {
    await expect(
      verifier.verify(mockSession({ message: `${LEGACY_MESSAGE} (edited)` }))
    ).resolves.toBe(false)
  })

  it('rejects a SEP-53 signature for a different account', async () => {
    await expect(
      verifier.verify(
        mockSession({
          accountAddress: LEGACY_ADDRESS,
          message: SEP53_ASCII_MESSAGE,
          signature: SEP53_ASCII_SIGNATURE
        })
      )
    ).resolves.toBe(false)
  })

  it('rejects a signature over the SEP-53 prefix with a 0x00 inserted', async () => {
    const signature = signWithFixtureSeed('Stellar Signed Message:\n', [0], LEGACY_MESSAGE)

    await expect(verifier.verify(mockSession({ signature }))).resolves.toBe(false)
  })

  it('rejects a signature over the legacy prefix without the 0x00 separator', async () => {
    const signature = signWithFixtureSeed('StellarMessage', [], LEGACY_MESSAGE)

    await expect(verifier.verify(mockSession({ signature }))).resolves.toBe(false)
  })

  it('rejects a signature from a different account', async () => {
    // A different, well-formed account -- so this fails on the signature, not the address
    const otherAddress = 'GAF3YNDKK5THYOABEC6ZY76X4UOSYX675I342L236QC3FRV7N4WXRTM4'

    await expect(verifier.verify(mockSession({ accountAddress: otherAddress }))).resolves.toBe(
      false
    )
  })

  it('rejects a malformed address rather than throwing', async () => {
    await expect(verifier.verify(mockSession({ accountAddress: 'not-an-address' }))).resolves.toBe(
      false
    )
  })

  it('rejects a malformed signature rather than throwing', async () => {
    await expect(verifier.verify(mockSession({ signature: 'not-base64!!' }))).resolves.toBe(false)
  })
})
