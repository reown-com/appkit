import { vi } from 'vitest'
import type { SolanaCoinbaseWallet } from '../../providers/CoinbaseWalletProvider.js'
import { TestConstants } from '../util/TestConstants.js'

export function mockCoinbaseWallet(): SolanaCoinbaseWallet {
  return {
    publicKey: TestConstants.accounts[0].publicKey,
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    signMessage: vi.fn().mockResolvedValue({ signature: new Uint8Array() }),
    signTransaction: vi.fn(tx => tx),
    signAllTransactions: vi.fn(tx => tx),
    signAndSendTransaction: vi.fn().mockResolvedValue({ signature: '' }),
    emit: vi.fn()
  }
}
