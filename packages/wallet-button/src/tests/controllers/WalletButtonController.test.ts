import { describe, expect, it } from 'vitest'
import { WalletButtonController } from '../../controllers/WalletButtonController'
import type { ParsedCaipAddress } from '@reown/appkit-common'

// -- Tests --------------------------------------------------------------------
describe('WalletButtonController', () => {
  it('should have valid default state', () => {
    expect(WalletButtonController.state.data).toBeUndefined()
    expect(WalletButtonController.state.error).toBeUndefined()
    expect(WalletButtonController.state.pending).toBe(false)
    expect(WalletButtonController.state.ready).toBe(false)
  })

  it('should update state correctly on setReady()', () => {
    WalletButtonController.setReady(true)
    expect(WalletButtonController.state.ready).toBe(true)
  })

  it('should update state correctly on setPending()', () => {
    WalletButtonController.setPending(true)
    expect(WalletButtonController.state.pending).toBe(true)
  })

  it('should update state correctly on setError()', () => {
    WalletButtonController.setError(new Error('error'))
    expect(WalletButtonController.state.error?.message).toBe('error')
  })

  it('should update state correctly on setData()', () => {
    const data: ParsedCaipAddress = { address: '0x123', chainId: 1, chainNamespace: 'eip155' }
    WalletButtonController.setData(data)
    expect(WalletButtonController.state.data).toStrictEqual(data)
  })
})
