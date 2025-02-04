import { describe, expect, it, vi } from 'vitest'

import { type Balance, NetworkUtil } from '@reown/appkit-common'
import { AccountController } from '@reown/appkit-core'

import { AppKit } from '../../src/client'
import { base, mainnet, sepolia } from '../mocks/Networks'
import { mockOptions } from '../mocks/Options'
import { mockBlockchainApiController, mockStorageUtil, mockWindowAndDocument } from '../test-utils'

mockWindowAndDocument()
mockStorageUtil()
mockBlockchainApiController()

describe('Balance sync', () => {
  it('should not sync balance if theres no matching caipNetwork', async () => {
    const getNetworksByNamespaceSpy = vi.spyOn(NetworkUtil, 'getNetworksByNamespace')
    const fetchTokenBalanceSpy = vi.spyOn(AccountController, 'fetchTokenBalance')
    const setBalanceSpy = vi.spyOn(AccountController, 'setBalance')

    const appKit = new AppKit(mockOptions)
    await appKit['syncBalance']({
      address: '0x123',
      chainId: base.id,
      chainNamespace: base.chainNamespace
    })

    expect(getNetworksByNamespaceSpy).toHaveBeenCalled()
    expect(fetchTokenBalanceSpy).not.toHaveBeenCalled()
    expect(setBalanceSpy).not.toHaveBeenCalled()
  })

  it('should fetch native balance on testnet', async () => {
    const getNetworksByNamespaceSpy = vi.spyOn(NetworkUtil, 'getNetworksByNamespace')
    const fetchTokenBalanceSpy = vi.spyOn(AccountController, 'fetchTokenBalance')
    const setBalanceSpy = vi.spyOn(AccountController, 'setBalance')
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      address: '0x123',
      chainId: sepolia.id,
      chainNamespace: sepolia.chainNamespace
    } as any)

    const appKit = new AppKit({ ...mockOptions, networks: [sepolia] })
    await appKit['syncBalance']({
      address: '0x123',
      chainId: sepolia.id,
      chainNamespace: sepolia.chainNamespace
    })

    expect(getNetworksByNamespaceSpy).toHaveBeenCalled()
    expect(fetchTokenBalanceSpy).not.toHaveBeenCalled()
    expect(setBalanceSpy).toHaveBeenCalledWith('1.00', 'ETH', sepolia.chainNamespace)

    vi.spyOn(AccountController, 'state', 'get').mockClear()
  })

  it('should set the correct native token balance', async () => {
    const getNetworksByNamespaceSpy = vi.spyOn(NetworkUtil, 'getNetworksByNamespace')
    const fetchTokenBalanceSpy = vi
      .spyOn(AccountController, 'fetchTokenBalance')
      .mockResolvedValueOnce([
        {
          quantity: { numeric: '1.00', decimals: '18' },
          chainId: 'eip155:1',
          symbol: 'ETH'
        },
        {
          quantity: { numeric: '0.00', decimals: '18' },
          chainId: 'eip155:137',
          symbol: 'POL'
        },
        {
          quantity: { numeric: '0.00', decimals: '18' },
          chainId: 'eip155:1',
          symbol: 'USDC'
        }
      ] as Balance[])
    const setBalanceSpy = vi.spyOn(AccountController, 'setBalance')

    const appKit = new AppKit(mockOptions)
    await appKit['syncBalance']({
      address: '0x123',
      chainId: mainnet.id,
      chainNamespace: mainnet.chainNamespace
    })

    expect(getNetworksByNamespaceSpy).toHaveBeenCalled()
    expect(fetchTokenBalanceSpy).toHaveBeenCalled()
    expect(setBalanceSpy).toHaveBeenCalledWith('1.00', 'ETH', 'eip155')
  })

  it('should not sync balance on testnets', async () => {
    const setBalanceSpy = vi.spyOn(AccountController, 'setBalance')
    const fetchTokenBalanceSpy = vi.spyOn(AccountController, 'fetchTokenBalance')
    const mockAccountData = {
      address: '0x123',
      chainId: sepolia.id,
      chainNamespace: sepolia.chainNamespace
    }
    const appKit = new AppKit({ ...mockOptions, networks: [sepolia] })
    await appKit['syncAccount'](mockAccountData)

    expect(fetchTokenBalanceSpy).not.toHaveBeenCalled()
    expect(setBalanceSpy).toHaveBeenCalledWith('1.00', 'ETH', sepolia.chainNamespace)

    vi.spyOn(AccountController, 'state', 'get').mockClear()
  })
})
