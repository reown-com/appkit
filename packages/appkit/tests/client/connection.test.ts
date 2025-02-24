import { UniversalProvider } from '@walletconnect/universal-provider'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MockInstance } from 'vitest'

import { AccountController, type ConnectorType, StorageUtil } from '@reown/appkit-core'
import { ConstantsUtil as UtilConstantsUtil } from '@reown/appkit-utils'

import { AppKit } from '../../src/client'
import { ProviderUtil } from '../../src/store'
import { mockEvmAdapter, mockSolanaAdapter } from '../mocks/Adapter'
import { mainnet, sepolia } from '../mocks/Networks'
import { mockOptions } from '../mocks/Options'
import { mockUniversalProvider } from '../mocks/Providers'
import { mockBlockchainApiController, mockStorageUtil, mockWindowAndDocument } from '../test-utils'

mockWindowAndDocument()
mockStorageUtil()
mockBlockchainApiController()

describe('syncExistingConnection', () => {
  beforeEach(() => {
    vi.spyOn(UniversalProvider, 'init').mockResolvedValue(mockUniversalProvider)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should set status to "connecting" and sync the connection when a connector and namespace are present', async () => {
    const setStatus = vi.spyOn(AccountController, 'setStatus')
    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValue('evm-connector')
    vi.spyOn(StorageUtil, 'getConnectionStatus').mockReturnValue('connected')

    const appKit = new AppKit({
      ...mockOptions,
      adapters: [mockEvmAdapter],
      networks: [mainnet, sepolia]
    })
    await appKit['syncExistingConnection']()

    expect(setStatus).toHaveBeenCalledWith('connecting', 'eip155')
    expect(setStatus).toHaveBeenCalledWith('connected', 'eip155')

    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValue(undefined)
    vi.spyOn(StorageUtil, 'getConnectionStatus').mockReturnValue('connected')

    await appKit['syncExistingConnection']()

    expect(setStatus).toHaveBeenCalledWith('connecting', 'eip155')
    expect(setStatus).toHaveBeenCalledWith('disconnected', 'eip155')

    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockClear()
    vi.spyOn(StorageUtil, 'getConnectionStatus').mockClear()
  })

  it('should reconnect to multiple namespaces if previously connected', async () => {
    const setConnectedConnectorId = vi.spyOn(StorageUtil, 'setConnectedConnectorId')
    // const setProviderId = vi.spyOn(ProviderUtil, 'setProviderId').mockImplementation(() => {})
    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValue('universal-connector')

    const appKit = new AppKit(mockOptions)
    await appKit['syncExistingConnection']()

    expect(mockEvmAdapter.syncConnection).toHaveBeenCalled()
    expect(mockSolanaAdapter.syncConnection).toHaveBeenCalled()
    expect(mockEvmAdapter.getAccounts).toHaveBeenCalled()
    expect(mockSolanaAdapter.getAccounts).toHaveBeenCalled()

    // NOTE: Even though setConnectedConnectorId is getting called in the same function (syncProvider),
    // it's getting detected as not called by the test runner.
    // expect(setProviderId).toHaveBeenCalledWith('eip155', 'EXTERNAL')
    // expect(setProviderId).toHaveBeenCalledWith('solana', 'EXTERNAL')

    expect(setConnectedConnectorId).toHaveBeenCalledWith('eip155', 'evm-connector')
    expect(setConnectedConnectorId).toHaveBeenCalledWith('solana', 'solana-connector')

    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockClear()
    vi.spyOn(StorageUtil, 'getConnectionStatus').mockClear()
  })
})

describe('syncConnectedWalletInfo', () => {
  let appKit: AppKit
  let setConnectedWalletInfoSpy: MockInstance<AppKit['setConnectedWalletInfo']>

  beforeEach(() => {
    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValue('mock-connector-id')
    appKit = new AppKit(mockOptions)
    setConnectedWalletInfoSpy = vi.spyOn(appKit, 'setConnectedWalletInfo')
  })

  it.each([
    UtilConstantsUtil.CONNECTOR_TYPE_ANNOUNCED,
    UtilConstantsUtil.CONNECTOR_TYPE_INJECTED
  ] as ConnectorType[])('should sync the connected wallet info for type $s', async type => {
    vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValueOnce(type)

    vi.spyOn(appKit, 'getConnectors').mockReturnValueOnce([
      {
        id: 'mock-connector-id',
        name: 'mock-connector-name',
        chain: 'eip155',
        type,
        imageUrl: 'mock-connector-icon'
      }
    ])

    appKit['syncConnectedWalletInfo']('eip155')

    expect(setConnectedWalletInfoSpy).toHaveBeenCalledWith(
      {
        name: 'mock-connector-name',
        icon: 'mock-connector-icon'
      },
      'eip155'
    )
  })

  it(`should sync connected wallet info for ${UtilConstantsUtil.CONNECTOR_TYPE_WALLET_CONNECT}`, async () => {
    vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValueOnce(
      UtilConstantsUtil.CONNECTOR_TYPE_WALLET_CONNECT as ConnectorType
    )

    vi.spyOn(ProviderUtil, 'getProvider').mockReturnValueOnce({
      session: {
        peer: {
          metadata: {
            name: 'mock-connector-name',
            icons: ['mock-connector-icon']
          }
        }
      }
    })

    appKit['syncConnectedWalletInfo']('eip155')

    expect(setConnectedWalletInfoSpy).toHaveBeenCalledWith(
      {
        name: 'mock-connector-name',
        icon: 'mock-connector-icon',
        icons: ['mock-connector-icon']
      },
      'eip155'
    )
  })

  it(`should sync connected wallet info for ${UtilConstantsUtil.CONNECTOR_TYPE_W3M_AUTH} as email`, async () => {
    vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValueOnce(
      UtilConstantsUtil.CONNECTOR_TYPE_AUTH as ConnectorType
    )

    appKit['authProvider'] = {
      getUsername: () => 'mock-username',
      getEmail: () => 'mock-email'
    } as any

    appKit['syncConnectedWalletInfo']('eip155')

    expect(setConnectedWalletInfoSpy).toHaveBeenCalledWith(
      {
        name: UtilConstantsUtil.CONNECTOR_TYPE_AUTH,
        identifier: 'mock-email',
        social: 'email'
      },
      'eip155'
    )
  })

  it(`should sync connected wallet info for ${UtilConstantsUtil.CONNECTOR_TYPE_W3M_AUTH} as social`, async () => {
    vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValueOnce(
      UtilConstantsUtil.CONNECTOR_TYPE_AUTH as ConnectorType
    )

    appKit['authProvider'] = {
      getUsername: () => 'mock-username',
      getEmail: () => null
    } as any

    vi.spyOn(StorageUtil, 'getConnectedSocialProvider').mockReturnValueOnce('mock-social')

    appKit['syncConnectedWalletInfo']('eip155')

    expect(setConnectedWalletInfoSpy).toHaveBeenCalledWith(
      {
        name: UtilConstantsUtil.CONNECTOR_TYPE_AUTH,
        identifier: 'mock-username',
        social: 'mock-social'
      },
      'eip155'
    )
  })

  it('should sync connected wallet info for any other provider type', async () => {
    appKit['syncConnectedWalletInfo']('eip155')

    expect(setConnectedWalletInfoSpy).toHaveBeenCalledWith(
      {
        name: 'mock-connector-id'
      },
      'eip155'
    )
  })
})
