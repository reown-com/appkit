import { describe, expect, it } from 'vitest'

import type { SIWXSession } from '@reown/appkit-controllers'

import { StellarVerifier } from '../../src/verifiers/StellarVerifier.js'

/*
 * Fixture generated from the deterministic Ed25519 seed [1..32]:
 * the signature covers sha256("StellarMessage" || 0x00 || message) per SEP-53.
 */
const ADDRESS = 'GB43KVROR7TFJ6KAPCYRF2FJROTZAH4FHLTJLPWX4DRZCC5NASLGITR6'
const MESSAGE = 'appkit.reown.com wants you to sign in with your Stellar account'
const SIGNATURE =
  'cmq6ksk26JZzB39TGYN55+Q4SnsGaqZzZqD9hLnUJtYnrjlD0QYr4CbQYloxUeMo3p0blShnOiHnynyrbpA3Bw=='

function mockSession(overrides?: {
  message?: string
  signature?: string
  accountAddress?: string
  chainId?: string
}): SIWXSession {
  return {
    data: {
      accountAddress: overrides?.accountAddress ?? ADDRESS,
      chainId: (overrides?.chainId ?? 'stellar:pubnet') as SIWXSession['data']['chainId'],
      domain: 'appkit.reown.com',
      uri: 'https://appkit.reown.com',
      version: '1',
      nonce: '12345678'
    },
    message: overrides?.message ?? MESSAGE,
    signature: overrides?.signature ?? SIGNATURE
  } as SIWXSession
}

describe('StellarVerifier', () => {
  const verifier = new StellarVerifier()

  it('claims stellar sessions only', () => {
    expect(verifier.chainNamespace).toBe('stellar')
    expect(verifier.shouldVerify(mockSession())).toBe(true)
    expect(verifier.shouldVerify(mockSession({ chainId: 'solana:mainnet' }))).toBe(false)
  })

  it('verifies a valid SEP-53 signature', async () => {
    await expect(verifier.verify(mockSession())).resolves.toBe(true)
  })

  it('rejects a tampered message', async () => {
    await expect(verifier.verify(mockSession({ message: `${MESSAGE} (edited)` }))).resolves.toBe(
      false
    )
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
