import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Emitter } from '@reown/appkit-common'
import { AccountController, BlockchainApiController, ChainController } from '@reown/appkit-core'

import { AppKit } from '../../src/client/appkit.js'
import { mockEvmAdapter } from '../mocks/Adapter'
import { mainnet, solana, unsupportedNetwork } from '../mocks/Networks'
import { mockOptions } from '../mocks/Options'
import {
  mockBlockchainApiController,
  mockChainControllerStateWithUnsupportedChain,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils'

mockWindowAndDocument()
mockStorageUtil()
mockBlockchainApiController()

describe('Listeners', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should set caip address, profile name and profile image on accountChanged event', async () => {
    const identity = { name: 'vitalik.eth', avatar: null } as const
    const setCaipAddressSpy = vi.spyOn(AccountController, 'setCaipAddress')
    const fetchIdentitySpy = vi
      .spyOn(BlockchainApiController, 'fetchIdentity')
      .mockResolvedValueOnce(identity)

    const mockAccount = {
      address: '0x123',
      chainId: mainnet.id,
      chainNamespace: mainnet.chainNamespace
    }

    const appKit = new AppKit(mockOptions)
    const setProfileNameSpy = vi.spyOn(appKit, 'setProfileName').mockImplementation(() => {})
    const setProfileImageSpy = vi.spyOn(appKit, 'setProfileImage').mockImplementation(() => {})

    await appKit['syncAccount'](mockAccount)
    // @ts-expect-error private event
    mockEvmAdapter.emit('accountChanged', mockAccount)

    expect(setCaipAddressSpy).toHaveBeenCalledWith(
      `${mockAccount.chainNamespace}:${mockAccount.chainId}:${mockAccount.address}`,
      'eip155'
    )
    expect(fetchIdentitySpy).toHaveBeenCalledWith({
      address: mockAccount.address,
      caipNetworkId: `${mockAccount.chainNamespace}:${mockAccount.chainId}`
    })
    expect(setProfileNameSpy).toHaveBeenCalledWith(identity.name, 'eip155')
    expect(setProfileImageSpy).toHaveBeenCalledWith(identity.avatar, 'eip155')
  })

  it('should call syncAccountInfo when namespace is different than active namespace', async () => {
    const emitter = new Emitter()
    const appKit = new AppKit({ ...mockOptions, defaultNetwork: solana })
    const setCaipAddressSpy = vi.spyOn(appKit, 'setCaipAddress')

    const mockAccount = {
      address: '0x123',
      chainId: mainnet.id,
      chainNamespace: mainnet.chainNamespace
    }
    emitter.emit('accountChanged', mockAccount)

    expect(setCaipAddressSpy).toHaveBeenCalledWith(
      `${mockAccount.chainNamespace}:${mockAccount.chainId}:${mockAccount.address}`,
      'eip155'
    )
  })

  it('should show unsupported chain UI when network is unsupported and allowUnsupportedChain is false', async () => {
    const showUnsupportedChainUISpy = vi.spyOn(ChainController, 'showUnsupportedChainUI')

    const appKit = new AppKit({
      ...mockOptions,
      allowUnsupportedChain: false,
      features: { email: false, socials: [] }
    })

    mockChainControllerStateWithUnsupportedChain()

    await appKit['syncAccount']({
      address: '0x123',
      chainId: unsupportedNetwork.id,
      chainNamespace: unsupportedNetwork.chainNamespace
    })

    expect(showUnsupportedChainUISpy).toHaveBeenCalled()
  })
})
