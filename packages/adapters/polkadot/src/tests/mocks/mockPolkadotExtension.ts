import { vi } from 'vitest'

import type { InjectedAccountWithMeta } from '../../../src/providers/PolkadotProvider'

export function installPolkadotExtensionMocks(accounts: InjectedAccountWithMeta[]) {
  const enable = vi.fn().mockResolvedValue({})

  ;(window as any).injectedWeb3 = {
    'polkadot-js': { name: 'polkadot-js', version: '1.0.0', enable },
    talisman: { name: 'talisman', version: '1.2.3', enable },
    'subwallet-js': { name: 'subwallet', version: '0.9.8', enable }
  }

  const web3Enable = vi
    .fn()
    .mockResolvedValue([{ name: 'polkadot-js' }, { name: 'talisman' }, { name: 'subwallet-js' }])

  const web3Accounts = vi.fn().mockResolvedValue(accounts)

  const dummySignature = '0x1234abcd'
  const signer = {
    signRaw: vi.fn().mockResolvedValue({ signature: dummySignature })
  }

  const web3FromAddress = vi.fn().mockImplementation(async () => ({ signer }))

  const web3AccountsSubscribe = vi.fn().mockImplementation((cb: any) => {
    // Return unsubscribe
    return () => {}
  })

  // Expose to adapter via window to avoid module cache side-effects
  ;(window as any).__appkitPolkadotLibs = {
    web3Enable,
    web3Accounts,
    web3AccountsSubscribe,
    web3FromAddress
  }

  return { web3Enable, web3Accounts, web3FromAddress, web3AccountsSubscribe, signer }
}
