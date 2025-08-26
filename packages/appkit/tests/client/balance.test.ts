import { beforeEach, describe, expect, it, vi } from 'vitest'

import { NetworkUtil } from '@reown/appkit-common'
import { ChainController } from '@reown/appkit-controllers'

import { AppKit } from '../../src/client/appkit.js'
import { mockEvmAdapter } from '../mocks/Adapter.js'
import { base, mainnet, sepolia } from '../mocks/Networks.js'
import { mockOptions } from '../mocks/Options.js'
import {
  mockBlockchainApiController,
  mockRemoteFeatures,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

describe('Balance sync', () => {
  beforeEach(() => {
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()
    mockRemoteFeatures()
  })

  it.sequential('should not sync balance if theres no matching caipNetwork', async () => {
    const getNetworksByNamespaceSpy = vi.spyOn(NetworkUtil, 'getNetworksByNamespace')
    const setBalanceSpy = vi.spyOn(ChainController, 'setAccountProp')

    const appKit = new AppKit(mockOptions)

    await appKit['syncBalance']({
      address: '0x123',
      chainId: base.id,
      chainNamespace: base.chainNamespace
    })

    expect(getNetworksByNamespaceSpy).toHaveBeenCalled()
    expect(mockEvmAdapter.getBalance).not.toHaveBeenCalled()
    expect(setBalanceSpy).not.toHaveBeenCalledWith(
      'balance',
      expect.any(String),
      expect.any(String)
    )
  })

  it.sequential('should fetch native balance on testnet', async () => {
    const getNetworksByNamespaceSpy = vi.spyOn(NetworkUtil, 'getNetworksByNamespace')
    const setAccountPropSpy = vi.spyOn(ChainController, 'setAccountProp')
    const mockAccount = {
      address: '0x123',
      chainId: sepolia.id,
      chainNamespace: sepolia.chainNamespace
    }

    const appKit = new AppKit({ ...mockOptions, networks: [sepolia] })
    await appKit['syncAccount'](mockAccount)

    expect(getNetworksByNamespaceSpy).toHaveBeenCalled()
    expect(mockEvmAdapter.getBalance).toHaveBeenCalled()
    expect(setAccountPropSpy).toHaveBeenCalledWith('balance', '1.00', sepolia.chainNamespace)
  })

  it.sequential('should set the correct native token balance', async () => {
    const getNetworksByNamespaceSpy = vi.spyOn(NetworkUtil, 'getNetworksByNamespace')
    const setAccountPropSpy = vi.spyOn(ChainController, 'setAccountProp')

    const appKit = new AppKit(mockOptions)
    await appKit.ready()

    await appKit['syncBalance']({
      address: '0x123',
      chainId: mainnet.id,
      chainNamespace: mainnet.chainNamespace
    })

    expect(getNetworksByNamespaceSpy).toHaveBeenCalled()
    expect(mockEvmAdapter.getBalance).toHaveBeenCalled()
    expect(setAccountPropSpy).toHaveBeenCalledWith('balance', '1.00', 'eip155')
  })
})
