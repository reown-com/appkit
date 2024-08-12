import { beforeEach, describe, expect, it } from 'vitest'
import { mockUniversalProvider } from './mocks/UniversalProvider.mock'
import { WalletConnectProvider } from '../src/providers/WalletConnectProvider'
import { TestConstants } from './util/TestConstants'

describe('WalletConnectProvider specific tests', () => {
  let provider = mockUniversalProvider()
  let sut = new WalletConnectProvider({
    provider,
    chains: TestConstants.chains
  })

  beforeEach(() => {
    provider = mockUniversalProvider()
    sut = new WalletConnectProvider({
      provider,
      chains: TestConstants.chains
    })
  })

  it('should call connect', async () => {
    await sut.connect()

    expect(provider.connect).toHaveBeenCalled()
  })

  it('should call disconnect', async () => {
    await sut.disconnect()

    expect(provider.disconnect).toHaveBeenCalled()
  })

  it('should call signMessage with correct params', async () => {
    await sut.connect()
    const message = new Uint8Array([1, 2, 3, 4, 5])
    await sut.signMessage(message)

    expect(provider.request).toHaveBeenCalledWith({
      method: 'solana_signMessage',
      params: {
        message: '7bWpTW',
        pubkey: TestConstants.accounts[0].address
      }
    })
  })
})
