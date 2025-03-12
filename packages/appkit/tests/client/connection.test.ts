import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { MockInstance } from 'vitest'

import {
  AccountController,
  type Connector,
  ConnectorController,
  type ConnectorType,
  StorageUtil
} from '@reown/appkit-controllers'
import { ConstantsUtil as UtilConstantsUtil } from '@reown/appkit-utils'

import { AppKit } from '../../src/client/appkit.js'
import { ProviderUtil } from '../../src/store'
import { mockEvmAdapter, mockSolanaAdapter } from '../mocks/Adapter.js'
import { mainnet, sepolia } from '../mocks/Networks.js'
import { mockOptions } from '../mocks/Options.js'
import {
  mockBlockchainApiController,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

const MOCKED_CONNECTORS = [
  {
    id: 'evm-connector'
  } as unknown as Connector
]

describe('syncExistingConnection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()
  })

  it('should set status to "connecting" and sync the connection when a connector and namespace are present', async () => {
    const setStatus = vi.spyOn(AccountController, 'setStatus')
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('evm-connector')
    vi.spyOn(ConnectorController, 'getConnectors').mockReturnValue(MOCKED_CONNECTORS)

    const appKit = new AppKit({
      ...mockOptions,
      adapters: [mockEvmAdapter],
      networks: [mainnet, sepolia]
    })
    await appKit['syncExistingConnection']()

    expect(setStatus).toHaveBeenCalledWith('connecting', 'eip155')
    expect(setStatus).toHaveBeenCalledWith('connected', 'eip155')

    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue(undefined)
    vi.spyOn(ConnectorController, 'getConnectors').mockReturnValue([])

    await appKit['syncExistingConnection']()

    expect(setStatus).toHaveBeenCalledWith('connecting', 'eip155')
    expect(setStatus).toHaveBeenCalledWith('disconnected', 'eip155')

    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockClear()
    vi.spyOn(StorageUtil, 'getConnectionStatus').mockClear()
  })

  it('should reconnect to multiple namespaces if previously connected', async () => {
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('evm-connector')
    vi.spyOn(ConnectorController, 'getConnectors').mockReturnValue(MOCKED_CONNECTORS)
    const appKit = new AppKit(mockOptions)
    await appKit['syncExistingConnection']()

    expect(mockEvmAdapter.syncConnection).toHaveBeenCalled()
    expect(mockSolanaAdapter.syncConnection).toHaveBeenCalled()
    expect(mockEvmAdapter.getAccounts).toHaveBeenCalled()
    expect(mockSolanaAdapter.getAccounts).toHaveBeenCalled()
  })
})

describe('syncConnectedWalletInfo', () => {
  let appKit: AppKit
  let setConnectedWalletInfoSpy: MockInstance<AppKit['setConnectedWalletInfo']>

  beforeEach(() => {
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('mock-connector-id')
    vi.spyOn(ConnectorController, 'getConnectors').mockReturnValue([
      {
        id: 'mock-connector-id'
      } as unknown as Connector
    ])
    appKit = new AppKit(mockOptions)
    setConnectedWalletInfoSpy = vi.spyOn(appKit, 'setConnectedWalletInfo')
  })

  it.each([
    UtilConstantsUtil.CONNECTOR_TYPE_ANNOUNCED,
    UtilConstantsUtil.CONNECTOR_TYPE_INJECTED
  ] as ConnectorType[])('should sync the connected wallet info for type $s', async type => {
    vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValue(type)

    vi.spyOn(appKit, 'getConnectors').mockReturnValue([
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
    vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValue(
      UtilConstantsUtil.CONNECTOR_TYPE_WALLET_CONNECT as ConnectorType
    )

    vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue({
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
    vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValue('mock-provider-id' as ConnectorType)
    appKit['syncConnectedWalletInfo']('eip155')

    expect(setConnectedWalletInfoSpy).toHaveBeenCalledWith(
      {
        name: 'mock-connector-id'
      },
      'eip155'
    )
  })
})
