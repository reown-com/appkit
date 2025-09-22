import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { MockInstance } from 'vitest'

import type { CaipNetwork } from '@reown/appkit-common'
import {
  type AccountType,
  ChainController,
  type Connector,
  ConnectorController,
  type ConnectorType,
  EventsController,
  ProviderController,
  StorageUtil
} from '@reown/appkit-controllers'
import { ConstantsUtil as UtilConstantsUtil } from '@reown/appkit-utils'
import type { W3mFrameProvider } from '@reown/appkit-wallet'

import { AppKit } from '../../src/client/appkit.js'
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

const mockFrameProvider = {
  getUsername: () => 'mock-username',
  getEmail: () => 'mock-email',
  getLoginEmailUsed: () => true,
  onRpcRequest: vi.fn(),
  onRpcSuccess: vi.fn(),
  onRpcError: vi.fn(),
  onNotConnected: vi.fn(),
  onConnect: vi.fn(),
  onSocialConnected: vi.fn(),
  onSetPreferredAccount: vi.fn(),
  isConnected: () => true,
  syncDappData: vi.fn(),
  syncTheme: vi.fn(),
  getSmartAccountEnabledNetworks: vi.fn()
} as unknown as W3mFrameProvider

describe('syncExistingConnection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()
  })

  it('should set status to "connecting" and sync the connection when a connector and namespace are present', async () => {
    const setStatus = vi.spyOn(ChainController, 'setAccountProp')
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('evm-connector')
    vi.spyOn(ConnectorController, 'getConnectors').mockReturnValue(MOCKED_CONNECTORS)

    const appKit = new AppKit({
      ...mockOptions,
      adapters: [mockEvmAdapter],
      networks: [mainnet, sepolia]
    })
    await appKit['syncExistingConnection']()

    expect(setStatus).toHaveBeenCalledWith('status', 'connecting', 'eip155')
    expect(setStatus).toHaveBeenCalledWith('status', 'connected', 'eip155')

    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue(undefined)
    vi.spyOn(ConnectorController, 'getConnectors').mockReturnValue([])

    await appKit['syncExistingConnection']()

    expect(setStatus).toHaveBeenCalledWith('status', 'connecting', 'eip155')
    expect(setStatus).toHaveBeenCalledWith('status', 'disconnected', 'eip155')

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
    vi.spyOn(ProviderController, 'getProviderId').mockReturnValue(type)

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
    vi.spyOn(ProviderController, 'getProviderId').mockReturnValue(
      UtilConstantsUtil.CONNECTOR_TYPE_WALLET_CONNECT as ConnectorType
    )

    vi.spyOn(ProviderController, 'getProvider').mockReturnValue({
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
    vi.spyOn(ProviderController, 'getProviderId').mockReturnValueOnce(
      UtilConstantsUtil.CONNECTOR_TYPE_AUTH as ConnectorType
    )

    appKit['authProvider'] = mockFrameProvider

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
    vi.spyOn(ProviderController, 'getProviderId').mockReturnValueOnce(
      UtilConstantsUtil.CONNECTOR_TYPE_AUTH as ConnectorType
    )

    appKit['authProvider'] = {
      ...mockFrameProvider,
      getEmail: () => null
    } as unknown as W3mFrameProvider

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

  it('should not sync connected wallet info if connector is not found', async () => {
    vi.spyOn(ProviderController, 'getProviderId').mockReturnValue(
      'mock-provider-id' as ConnectorType
    )
    appKit['syncConnectedWalletInfo']('eip155')

    expect(setConnectedWalletInfoSpy).not.toHaveBeenCalled()
  })

  describe('should be called on connection methods', () => {
    let appKit: AppKit
    let syncConnectedWalletInfoSpy: MockInstance<(chainNamespace: string) => void>

    beforeEach(() => {
      vi.clearAllMocks()
      mockWindowAndDocument()
      mockStorageUtil()
      mockBlockchainApiController()
      appKit = new AppKit(mockOptions)
      syncConnectedWalletInfoSpy = vi.spyOn(appKit as any, 'syncConnectedWalletInfo')
    })

    it('should call syncConnectedWalletInfo when using connectExternal', async () => {
      vi.spyOn(mockEvmAdapter, 'connect').mockResolvedValue({
        address: '0x123',
        chainId: '1',
        provider: {} as any,
        id: 'test-connector',
        type: 'INJECTED'
      })
      vi.spyOn(mockEvmAdapter, 'getAccounts').mockResolvedValue({
        accounts: [{ namespace: 'eip155', address: '0x123', type: 'eoa' }]
      })
    })
    it('should call sync connected wallet info when calling connectExternal', async () => {
      vi.spyOn(mockEvmAdapter, 'connect').mockResolvedValue({
        address: '0x123',
        chainId: '1',
        provider: {} as any,
        id: 'test-connector',
        type: 'INJECTED'
      })
      vi.spyOn(mockEvmAdapter, 'getAccounts').mockResolvedValue({
        accounts: [{ namespace: 'eip155', address: '0x123', type: 'eoa' }]
      })

      await (appKit as any).connectionControllerClient.connectExternal({
        id: 'test-connector',
        info: { name: 'Test Connector' },
        type: 'INJECTED',
        provider: {} as any,
        chain: 'eip155'
      })

      expect(syncConnectedWalletInfoSpy).toHaveBeenCalledWith('eip155')
    })

    it('should call sync connected wallet info when calling connectExternal', async () => {
      vi.spyOn(mockEvmAdapter, 'connect').mockResolvedValue({
        address: '0x123',
        chainId: '1',
        provider: {} as any,
        id: 'test-connector',
        type: 'INJECTED'
      })
      vi.spyOn(mockEvmAdapter, 'getAccounts').mockResolvedValue({
        accounts: [{ namespace: 'eip155', address: '0x123', type: 'eoa' }]
      })

      await (appKit as any).connectionControllerClient.connectExternal({
        id: 'test-connector',
        info: { name: 'Test Connector' },
        type: 'INJECTED',
        provider: {} as any,
        chain: 'eip155'
      })

      expect(syncConnectedWalletInfoSpy).toHaveBeenCalledWith('eip155')
    })

    it('should not call adapter.getAccounts() when using connectExternal and accountState.allAccounts has accounts', async () => {
      vi.spyOn(mockEvmAdapter, 'connect').mockResolvedValue({
        address: '0x123',
        chainId: '1',
        provider: {} as any,
        id: 'test-connector',
        type: 'INJECTED'
      })

      const allAccounts = [{ type: 'eoa', address: '0x123', namespace: 'eip155' }] as AccountType[]

      vi.spyOn(mockEvmAdapter, 'getAccounts').mockResolvedValue({
        accounts: allAccounts
      })

      await (appKit as any).connectionControllerClient.connectExternal({
        id: 'test-connector',
        info: { name: 'Test Connector' },
        type: 'INJECTED',
        provider: {} as any,
        chain: 'eip155'
      })

      //@ts-expect-error
      expect(mockEvmAdapter.getAccounts.mock.calls).toHaveLength(0)
      expect(syncConnectedWalletInfoSpy).toHaveBeenCalledWith('eip155')
    })

    it('should call removeDisconnectedConnectorId when using connectExternal', async () => {
      const removeDisconnectedConnectorIdSpy = vi.spyOn(
        StorageUtil,
        'removeDisconnectedConnectorId'
      )
      vi.spyOn(mockEvmAdapter, 'connect').mockResolvedValue({
        address: '0x123',
        chainId: '1',
        provider: {} as any,
        id: 'test-connector',
        type: 'INJECTED'
      })

      await (appKit as any).connectionControllerClient.connectExternal({
        id: 'test-connector',
        info: { name: 'Test Connector' },
        type: 'INJECTED',
        provider: {} as any,
        chain: 'eip155'
      })

      expect(removeDisconnectedConnectorIdSpy).toHaveBeenCalledWith('test-connector', 'eip155')
    })

    it('should call syncConnectedWalletInfo when using reconnectExternal', async () => {
      vi.spyOn(appKit as any, 'getAdapter').mockReturnValueOnce({
        ...mockEvmAdapter,
        reconnect: vi.fn().mockResolvedValue({
          address: '0x123',
          chainId: '1',
          provider: {} as any,
          id: 'test-connector',
          type: 'INJECTED'
        })
      })

      await (appKit as any).connectionControllerClient.reconnectExternal({
        id: 'test-connector',
        info: { name: 'Test Connector' },
        type: 'INJECTED',
        provider: {} as any
      })

      expect(syncConnectedWalletInfoSpy).toHaveBeenCalledWith('eip155')
    })

    it('should call syncConnectedWalletInfo when using connectWalletConnect', async () => {
      vi.spyOn(mockEvmAdapter, 'connectWalletConnect').mockResolvedValue({
        clientId: 'test-client'
      })

      await (appKit as any).connectionControllerClient.connectWalletConnect()

      expect(syncConnectedWalletInfoSpy).toHaveBeenCalledWith('eip155')
    })
  })

  describe('syncAdapterConnection', () => {
    it('should successfully sync adapter connection and account', async () => {
      const appKit = new AppKit(mockOptions)
      vi.spyOn(appKit as any, 'getAdapter').mockReturnValueOnce({
        syncConnection: vi.fn().mockResolvedValue({
          address: '0x123',
          chainId: '1',
          provider: {}
        }),
        getAccounts: vi.fn().mockResolvedValue({
          accounts: [{ address: '0x123', type: 'eoa' }]
        })
      })
      vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('test-connector')
      vi.spyOn(ConnectorController, 'getConnectors').mockReturnValue([
        { id: 'test-connector' } as Connector
      ])
      const getCaipNetwork = vi.spyOn(appKit, 'getCaipNetwork').mockReturnValue({
        id: '1',
        rpcUrls: { default: { http: ['https://test.com'] } }
      } as unknown as CaipNetwork)

      const setStatus = vi.spyOn(appKit, 'setStatus')
      const syncAccount = vi.spyOn(appKit as any, 'syncAccount')

      await appKit['syncAdapterConnection']('eip155')

      expect(setStatus).toHaveBeenCalledWith('connected', 'eip155')
      expect(syncAccount).toHaveBeenCalledWith({
        address: '0x123',
        chainId: '1',
        provider: {},
        chainNamespace: 'eip155'
      })
      expect(getCaipNetwork).toHaveBeenCalledWith('eip155')
    })

    it('should emit CONNECT_SUCCESS event on reconnection', async () => {
      const appKit = new AppKit(mockOptions)
      vi.spyOn(appKit as any, 'getAdapter').mockReturnValueOnce({
        syncConnection: vi.fn().mockResolvedValue({
          address: '0xabc',
          chainId: '1',
          provider: {}
        })
      })
      vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('test-connector')
      vi.spyOn(ConnectorController, 'getConnectors').mockReturnValue([
        { id: 'test-connector', info: { name: 'Test Connector' } } as unknown as Connector
      ])
      vi.spyOn(appKit, 'getCaipNetwork').mockReturnValue({
        id: '1',
        rpcUrls: { default: { http: ['https://test.com'] } }
      } as unknown as CaipNetwork)

      const sendEventSpy = vi.spyOn(EventsController, 'sendEvent')

      await appKit['syncAdapterConnection']('eip155')

      expect(sendEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'track',
          event: 'CONNECT_SUCCESS',
          properties: expect.objectContaining({ reconnect: true })
        })
      )
    })

    it('should handle missing caipNetwork', async () => {
      const appKit = new AppKit(mockOptions)
      vi.spyOn(appKit as any, 'getAdapter').mockReturnValueOnce({
        syncConnection: vi.fn()
      })
      vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('test-connector')
      vi.spyOn(ConnectorController, 'getConnectors').mockReturnValue([
        { id: 'test-connector' } as Connector
      ])
      const getCaipNetwork = vi.spyOn(appKit, 'getCaipNetwork').mockReturnValue(undefined)

      const setStatus = vi.spyOn(appKit, 'setStatus')

      await appKit['syncAdapterConnection']('eip155')

      expect(setStatus).toHaveBeenCalledWith('disconnected', 'eip155')
      expect(getCaipNetwork).toHaveBeenCalledWith('eip155')
    })
  })

  describe('connectExternal', () => {
    it('should throw an error if connection gets declined', async () => {
      const appKit = new AppKit(mockOptions)

      vi.spyOn(mockEvmAdapter, 'connect').mockRejectedValue(new Error('Connection declined'))

      await expect(
        (appKit as any).connectionControllerClient['connectExternal']({
          id: 'test-connector',
          info: { name: 'Test Connector' },
          type: 'injected',
          provider: {},
          chain: 'eip155'
        })
      ).rejects.toThrow('Connection declined')
    })
  })

  describe('setupAuthConnectorListeners', () => {
    it('should call onSocialConnected with the user', () => {
      const userMock = {
        email: 'test@test.com',
        username: 'test',
        smartAccountDeployed: true,
        accounts: ['0x123']
      }

      const cbSpy = vi.fn()

      vi.spyOn(mockFrameProvider, 'onSocialConnected').mockImplementation(() => {
        cbSpy(userMock)
      })

      const appKit = new AppKit(mockOptions)

      appKit['setupAuthConnectorListeners'](mockFrameProvider)

      expect(cbSpy).toHaveBeenCalledWith(userMock)
    })
  })
})
