import { beforeEach, describe, expect, it } from 'vitest'
import { mockConnection } from './mocks/Connection'
import { createSendTransaction } from '../utils/createSendTransaction'
import type { Provider } from '@reown/appkit-utils/solana'
import { PublicKey } from '@solana/web3.js'

const mockProvider = () => {
  return {
    publicKey: new PublicKey('2VqKhjZ766ZN3uBtBpb7Ls3cN4HrocP1rzxzekhVEgoP')
  } as unknown as Provider
}

describe('createSendTransaction', () => {
  let provider = mockProvider()
  let connection = mockConnection()

  beforeEach(() => {
    provider = mockProvider()
    connection = mockConnection()
  })

  it('should create a transaction', async () => {
    const transaction = await createSendTransaction({
      provider,
      connection,
      to: '2VqKhjZ766ZN3uBtBpb7Ls3cN4HrocP1rzxzekhVEgoP',
      value: 10
    })

    expect(transaction).toBeDefined()
  })

  it('should create a correct serialized transaction', async () => {
    const transaction = await createSendTransaction({
      provider,
      connection,
      to: '2VqKhjZ766ZN3uBtBpb7Ls3cN4HrocP1rzxzekhVEgoP',
      value: 10
    })

    // Serializing to base64 only for comparison of the transaction bytes
    const serialized = transaction.serialize({ verifySignatures: false }).toString('base64')
    expect(serialized).toBe(
      'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAIDFj6WhBP/eepC4T4bDgYuJMiSVXNh9IvPWv1ZDUV52gYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMGRm/lIRcy/+ytunLDm+e8jOW7xfcSayxDmzpAAAAAyZpToWInFL+zDFy34fwit57sURE//y+sa4B0X3QA16UDAgAJAwAtMQEAAAAAAgAFAvQBAAABAgAADAIAAAAA5AtUAgAAAA=='
    )
  })
})
