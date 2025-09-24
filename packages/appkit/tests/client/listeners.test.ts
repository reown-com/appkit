import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  type AccountState,
  BlockchainApiController,
  ChainController,
  ConnectorController,
  ModalController,
  ProviderController,
  StorageUtil
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
    const setCaipAddressSpy = vi.spyOn(ChainController, 'setAccountProp')
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
      'caipAddress',
      `${mockAccount.chainNamespace}:${mockAccount.chainId}:${mockAccount.address}`,
      'eip155',
      true
    )
    expect(fetchIdentitySpy).toHaveBeenCalledWith({
      address: mockAccount.address
    })
    expect(setProfileNameSpy).toHaveBeenCalledWith(identity.name, 'eip155')
    expect(setProfileImageSpy).toHaveBeenCalledWith(identity.avatar, 'eip155')
  })

  it('should call syncAccountInfo when namespace is different than active namespace', async () => {
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      caipAddress: `${mainnet.chainNamespace}:${mainnet.id}:0x1234`,
      address: '0x1234'
    } as unknown as AccountState)
    const appKit = new AppKit({ ...mockOptions, defaultNetwork: solana })
    await appKit.ready()
    const setCaipAddressSpy = vi.spyOn(ChainController, 'setAccountProp')

    const mockAccount = {
      address: '0x123',
      chainId: mainnet.id,
      chainNamespace: mainnet.chainNamespace
    }
    emitter.emit('accountChanged', mockAccount)

    expect(setCaipAddressSpy).toHaveBeenCalledWith(
      'caipAddress',
      `${mockAccount.chainNamespace}:${mockAccount.chainId}:${mockAccount.address}`,
      'eip155',
      true
    )
  })

  it('should show unsupported chain UI when network is unsupported and allowUnsupportedChain is false', async () => {
    const showUnsupportedChainUISpy = vi.spyOn(ChainController, 'showUnsupportedChainUI')

    const appKit = new AppKit({
      ...mockOptions,
      allowUnsupportedChain: false
    })

    vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue(mainnet.chainNamespace)
    vi.spyOn(ChainController.state, 'activeCaipNetwork', 'get').mockReturnValue(unsupportedNetwork)

    await appKit['syncAccount']({
      address: '0x123',
      chainId: unsupportedNetwork.id,
      chainNamespace: unsupportedNetwork.chainNamespace
    })

    expect(showUnsupportedChainUISpy).toHaveBeenCalled()
  })

  it('should call all required methods when adapter emits disconnect event', async () => {
    const chainNamespace = mainnet.chainNamespace

    const resetAccountSpy = vi.spyOn(ChainController, 'resetAccount')
    const resetNetworkSpy = vi.spyOn(ChainController, 'resetNetwork')
    const removeConnectorIdSpy = vi.spyOn(ConnectorController, 'removeConnectorId')
    const removeConnectedNamespaceSpy = vi.spyOn(StorageUtil, 'removeConnectedNamespace')
    const resetChainSpy = vi.spyOn(ProviderController, 'resetChain')
    const modalCloseSpy = vi.spyOn(ModalController, 'close')

    const appKit = new AppKit(mockOptions)
    await appKit.ready()

    const setUserSpy = vi.spyOn(appKit, 'setUser')
    const setStatusSpy = vi.spyOn(appKit, 'setStatus')
    const setConnectedWalletInfoSpy = vi.spyOn(appKit, 'setConnectedWalletInfo')

    emitter.emit('disconnect')

    expect(resetAccountSpy).toHaveBeenCalledWith(chainNamespace)
    expect(resetNetworkSpy).toHaveBeenCalledWith(chainNamespace)
    expect(removeConnectorIdSpy).toHaveBeenCalledWith(chainNamespace)
    expect(removeConnectedNamespaceSpy).toHaveBeenCalledWith(chainNamespace)
    expect(resetChainSpy).toHaveBeenCalledWith(chainNamespace)
    expect(setUserSpy).toHaveBeenCalledWith(null, chainNamespace)
    expect(setStatusSpy).toHaveBeenCalledWith('disconnected', chainNamespace)
    expect(setConnectedWalletInfoSpy).toHaveBeenCalledWith(null, chainNamespace)
    expect(modalCloseSpy).toHaveBeenCalled()
  })

  it('should handle disconnect event for different chain namespaces', async () => {
    const resetAccountSpy = vi.spyOn(ChainController, 'resetAccount')
    const resetNetworkSpy = vi.spyOn(ChainController, 'resetNetwork')
    const removeConnectorIdSpy = vi.spyOn(ConnectorController, 'removeConnectorId')

    const appKit = new AppKit({ ...mockOptions, defaultNetwork: solana })
    await appKit.ready()

    solanaEmitter.emit('disconnect')

    expect(resetAccountSpy).toHaveBeenCalledWith(solana.chainNamespace)
    expect(resetNetworkSpy).toHaveBeenCalledWith(solana.chainNamespace)
    expect(removeConnectorIdSpy).toHaveBeenCalledWith(solana.chainNamespace)
  })
})

it('should handle accountChanged event with connector that has provider', async () => {
  const mockConnector = {
    id: 'test-connector',
    type: 'EXTERNAL' as const,
    provider: { request: vi.fn() }
  }

  const mockAccount = {
    address: '0x123',
    chainId: mainnet.id,
    connector: mockConnector
  }

  const appKit = new AppKit(mockOptions)
  await appKit.ready()

  const syncProviderSpy = vi.spyOn(appKit as any, 'syncProvider')
  const syncConnectedWalletInfoSpy = vi.spyOn(appKit as any, 'syncConnectedWalletInfo')

  emitter.emit('accountChanged', mockAccount)

  expect(syncProviderSpy).toHaveBeenCalledWith({
    id: mockConnector.id,
    type: mockConnector.type,
    provider: mockConnector.provider,
    chainNamespace: mainnet.chainNamespace
  })
  expect(syncConnectedWalletInfoSpy).toHaveBeenCalledWith(mainnet.chainNamespace)
})

it('should handle accountChanged event with connector that has no provider', async () => {
  const mockConnector = {
    id: 'test-connector',
    type: 'EXTERNAL' as const,
    provider: undefined
  }

  const mockAccount = {
    address: '0x123',
    chainId: mainnet.id,
    connector: mockConnector
  }

  const appKit = new AppKit(mockOptions)
  await appKit.ready()

  const syncProviderSpy = vi.spyOn(appKit as any, 'syncProvider')

  emitter.emit('accountChanged', mockAccount)

  expect(syncProviderSpy).not.toHaveBeenCalled()
})

it('should add connected namespace when accountChanged event is emitted', async () => {
  const addConnectedNamespaceSpy = vi.spyOn(StorageUtil, 'addConnectedNamespace')

  const mockAccount = {
    address: '0x123',
    chainId: mainnet.id
  }

  const appKit = new AppKit(mockOptions)
  await appKit.ready()

  emitter.emit('accountChanged', mockAccount)

  expect(addConnectedNamespaceSpy).toHaveBeenCalledWith(mainnet.chainNamespace)
})

it('should call syncAccount when accountChanged event is emitted', async () => {
  vi.spyOn(ChainController.state, 'activeCaipNetwork', 'get').mockReturnValue(mainnet)

  const mockAccount = {
    address: '0x123',
    chainId: mainnet.id
  }

  const appKit = new AppKit(mockOptions)
  await appKit.ready()

  const syncAccountSpy = vi.spyOn(appKit as any, 'syncAccount')

  emitter.emit('accountChanged', mockAccount)

  expect(syncAccountSpy).toHaveBeenCalledWith({
    address: mockAccount.address,
    chainId: mockAccount.chainId,
    chainNamespace: mainnet.chainNamespace
  })
})

it('should call syncAccount with activeCaipNetwork id when isActiveChain is true but no chainId provided', async () => {
  vi.spyOn(ChainController.state, 'activeCaipNetwork', 'get').mockReturnValue(mainnet)
  vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue(mainnet.chainNamespace)

  const mockAccount = {
    address: '0x123',
    chainId: undefined
  }

  const appKit = new AppKit(mockOptions)
  await appKit.ready()

  const syncAccountSpy = vi.spyOn(appKit as any, 'syncAccount')

  emitter.emit('accountChanged', mockAccount)

  expect(syncAccountSpy).toHaveBeenCalledWith({
    address: mockAccount.address,
    chainId: mainnet.id,
    chainNamespace: mainnet.chainNamespace
  })
})

it('should call syncAccountInfo when isActiveChain is false and neither activeCaipNetwork nor chainId are provided', async () => {
  vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue(solana.chainNamespace)

  const mockAccount = {
    address: '0x123',
    chainId: mainnet.id
  }

  const appKit = new AppKit(mockOptions)
  await appKit.ready()

  const syncAccountInfoSpy = vi.spyOn(appKit as any, 'syncAccountInfo')

  emitter.emit('accountChanged', mockAccount)

  expect(syncAccountInfoSpy).toHaveBeenCalledWith(
    mockAccount.address,
    mockAccount.chainId,
    mainnet.chainNamespace
  )
})
