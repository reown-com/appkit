import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  AccountController,
  BlockchainApiController,
  ChainController
} from '@reown/appkit-controllers'

import { AppKit } from '../../src/client/appkit.js'
import { emitter, mockEvmAdapter, solanaEmitter } from '../mocks/Adapter'
import { mainnet, solana, unsupportedNetwork } from '../mocks/Networks'
import { mockOptions } from '../mocks/Options'
import {
  mockBlockchainApiController,
  mockRemoteFeatures,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

describe('Listeners', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    emitter.clearAll()
    solanaEmitter.clearAll()
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()
    mockRemoteFeatures()
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
    // @ts-expect-error syncAllAccounts is protected method on AppKitBaseClient
    const syncAllAccountsSpy = vi.spyOn(appKit, 'syncAllAccounts').mockImplementation(() => {})

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
    expect(syncAllAccountsSpy).toHaveBeenCalledWith('eip155')
  })

  it('should call syncAccountInfo when namespace is different than active namespace', async () => {
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      address: '0x1234'
    })
    const appKit = new AppKit({ ...mockOptions, defaultNetwork: solana })
    await appKit.ready()
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

  it('should reset profile info if switched namespace is not EVM', async () => {
    const appKit = new AppKit({ ...mockOptions, defaultNetwork: mainnet })
    await appKit.ready()
    const setProfileNameSpy = vi.spyOn(appKit, 'setProfileName')
    const setProfileImageSpy = vi.spyOn(appKit, 'setProfileImage')

    const mockAccount = {
      address: 'C3k5AvYqoXjsfrkXdFBkUhqHHApeC8amP7y85LkLHL5X',
      chainId: solana.id,
      chainNamespace: solana.chainNamespace
    }
    solanaEmitter.emit('accountChanged', mockAccount)

    expect(setProfileNameSpy).toHaveBeenCalledWith(null, solana.chainNamespace)
    expect(setProfileImageSpy).toHaveBeenCalledWith(null, solana.chainNamespace)
  })

  it('should show unsupported chain UI when network is unsupported and allowUnsupportedChain is false', async () => {
    const showUnsupportedChainUISpy = vi.spyOn(ChainController, 'showUnsupportedChainUI')

    const appKit = new AppKit({
      ...mockOptions,
      allowUnsupportedChain: false
    })

    ChainController.state.activeChain = mainnet.chainNamespace
    ChainController.state.activeCaipNetwork = unsupportedNetwork

    await appKit['syncAccount']({
      address: '0x123',
      chainId: unsupportedNetwork.id,
      chainNamespace: unsupportedNetwork.chainNamespace
    })

    expect(showUnsupportedChainUISpy).toHaveBeenCalled()
  })
})
