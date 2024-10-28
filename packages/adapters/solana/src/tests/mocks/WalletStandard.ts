import type { Wallet, WalletAccount } from '@wallet-standard/base'
import type {
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature
} from '@wallet-standard/features'
import { vi } from 'vitest'
import { TestConstants } from '../util/TestConstants.js'
import type {
  SolanaSignAndSendTransactionFeature,
  SolanaSignMessageFeature,
  SolanaSignTransactionFeature
} from '@solana/wallet-standard-features'

export function mockWalletStandard() {
  const accounts = TestConstants.accounts.map(mockAccount)

  return {
    accounts,
    chains: TestConstants.chains.map(chain => `solana:${chain.id}` as const),
    features: {
      'standard:connect': {
        version: '1.0.0',
        connect: vi.fn(() =>
          Promise.resolve({
            accounts
          })
        )
      } satisfies StandardConnectFeature['standard:connect'],

      'standard:disconnect': {
        version: '1.0.0',
        disconnect: vi.fn(() => Promise.resolve())
      } satisfies StandardDisconnectFeature['standard:disconnect'],

      'solana:signMessage': {
        version: '1.0.0',
        signMessage: vi.fn(() =>
          Promise.resolve([{ signedMessage: new Uint8Array(0), signature: new Uint8Array(0) }])
        )
      } satisfies SolanaSignMessageFeature['solana:signMessage'],

      'solana:signTransaction': {
        version: '1.0.0',
        supportedTransactionVersions: [0, 'legacy'],
        signTransaction: vi.fn((...transactions: unknown[]) =>
          Promise.resolve(
            Array.from({ length: transactions.length }, () => ({
              signedTransaction: new Uint8Array([
                1, 195, 86, 227, 117, 63, 116, 76, 21, 3, 236, 37, 188, 235, 178, 151, 68, 192, 248,
                193, 10, 232, 44, 63, 138, 193, 225, 213, 179, 76, 95, 250, 42, 74, 225, 195, 254,
                54, 181, 58, 180, 254, 159, 97, 87, 220, 75, 22, 232, 35, 13, 145, 80, 92, 5, 246,
                108, 246, 45, 237, 87, 8, 153, 134, 3, 1, 0, 2, 4, 22, 62, 150, 132, 19, 255, 121,
                234, 66, 225, 62, 27, 14, 6, 46, 36, 200, 146, 85, 115, 97, 244, 139, 207, 90, 253,
                89, 13, 69, 121, 218, 69, 117, 163, 33, 133, 104, 6, 127, 247, 14, 44, 174, 12, 125,
                42, 138, 162, 30, 211, 204, 233, 91, 171, 238, 30, 3, 233, 117, 104, 74, 10, 196,
                132, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 3, 6, 70, 111, 229, 33, 23, 50, 255, 236, 173, 186, 114, 195, 155,
                231, 188, 140, 229, 187, 197, 247, 18, 107, 44, 67, 155, 58, 64, 0, 0, 0, 94, 139,
                248, 195, 57, 9, 171, 29, 198, 148, 191, 72, 247, 33, 118, 83, 181, 149, 184, 85,
                112, 19, 234, 30, 63, 54, 237, 157, 192, 138, 99, 27, 3, 3, 0, 9, 3, 160, 134, 1, 0,
                0, 0, 0, 0, 3, 0, 5, 2, 64, 13, 3, 0, 2, 2, 0, 1, 12, 2, 0, 0, 0, 128, 150, 152, 0,
                0, 0, 0, 0
              ])
            }))
          )
        )
      } satisfies SolanaSignTransactionFeature['solana:signTransaction'],

      'solana:signAndSendTransaction': {
        version: '1.0.0',
        supportedTransactionVersions: [0, 'legacy'],
        signAndSendTransaction: vi.fn(() => Promise.resolve([{ signature: new Uint8Array(0) }]))
      } satisfies SolanaSignAndSendTransactionFeature['solana:signAndSendTransaction'],

      'standard:events': {
        version: '1.0.0',
        on: vi.fn()
      } satisfies StandardEventsFeature['standard:events']
    },
    icon: 'data:image/png;base64,mocked...',
    name: 'mocked-wallet',
    version: '1.0.0'
  } as const satisfies Wallet
}

function mockAccount(account: TestConstants.Account = TestConstants.accounts[0]): WalletAccount {
  return {
    address: account.address,
    chains: TestConstants.chains.map(chain => `solana:${chain.id}` as const),
    features: [],
    publicKey: account.publicKey.toBytes(),
    icon: 'data:image/png;base64,mocked...',
    label: 'mocked-account'
  }
}
