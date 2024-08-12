import { beforeEach, describe, expect, it } from 'vitest'
import { mockWallet } from './mocks/Wallet.mock'
import { WalletStandardProvider } from '../src/providers/WalletStandardProvider'
import { StandardConnect, StandardDisconnect } from '@wallet-standard/features'
import { SolanaSignMessage } from '@solana/wallet-standard-features'

describe('WalletStandardProvider specific tests', () => {
  let wallet = mockWallet()
  let sut = new WalletStandardProvider({
    wallet
  })

  beforeEach(() => {
    wallet = mockWallet()
    sut = new WalletStandardProvider({
      wallet
    })
  })

  it('should call connect', async () => {
    await sut.connect()

    expect(wallet.features[StandardConnect].connect).toHaveBeenCalled()
  })

  it('should call disconnect', async () => {
    await sut.disconnect()

    expect(wallet.features[StandardDisconnect].disconnect).toHaveBeenCalled()
  })

  it('should call signMessage with correct params', async () => {
    const message = new Uint8Array([1, 2, 3, 4, 5])
    await sut.signMessage(message)

    expect(wallet.features[SolanaSignMessage].signMessage).toHaveBeenCalledWith({
      message,
      account: wallet.accounts[0]
    })
  })
})
