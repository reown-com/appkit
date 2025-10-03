import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type ChainNamespace, ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'

import {
  type AuthConnector,
  type ChainAdapter,
  ChainController,
  ConnectorController,
  EventsController,
  ModalController,
  StorageUtil
} from '../../exports/index.js'
import { ConnectorControllerUtil } from '../../src/utils/ConnectorControllerUtil.js'

describe('checkNamespaceConnectorId', () => {
  it('should return true if the namespace is associated with the specified connector id', () => {
    const namespace: ChainNamespace = 'eip155'
    const connectorId = 'eip155-connector'
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue(connectorId)

    const result = ConnectorControllerUtil.checkNamespaceConnectorId(namespace, connectorId)
    expect(result).toBe(true)
  })

  it('should return false if the namespace is not associated with the specified connector id', () => {
    const namespace: ChainNamespace = 'eip155'
    const connectorId = 'eip155-connector'
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('different-connector')

    const result = ConnectorControllerUtil.checkNamespaceConnectorId(namespace, connectorId)
    expect(result).toBe(false)
  })
})

describe('updateEmail', () => {
  it('should open "UpdateEmailWallet" view', async () => {
    const email = 'test@test.com'

    const openSpy = vi.spyOn(ModalController, 'open')
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({
      id: CommonConstantsUtil.CONNECTOR_ID.AUTH,
      provider: {
        getEmail: () => email
      }
    } as unknown as AuthConnector)
    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValue(
      CommonConstantsUtil.CONNECTOR_ID.AUTH
    )

    ConnectorControllerUtil.updateEmail()

    await vi.waitFor(() =>
      expect(openSpy).toHaveBeenCalledWith({
        view: 'UpdateEmailWallet',
        data: {
          email: email,
          redirectView: undefined
        }
      })
    )
  })
})

describe('connectSocial', () => {
  const mockNamespace: ChainNamespace = 'eip155'
  const mockSocialProvider = 'google' as const
  const mockPopupWindow = {
    close: vi.fn(),
    closed: false,
    location: { href: '' }
  } as unknown as Window

  beforeEach(() => {
    vi.restoreAllMocks()

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: mockNamespace,
      chains: new Map([
        [
          mockNamespace,
          {
            accountState: {
              socialProvider: mockSocialProvider,
              socialWindow: mockPopupWindow
            }
          }
        ]
      ]) as Map<ChainNamespace, ChainAdapter>
    })
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({
      id: CommonConstantsUtil.CONNECTOR_ID.AUTH,
      type: 'AUTH',
      chain: mockNamespace,
      provider: {
        getSocialRedirectUri: vi.fn().mockResolvedValue({ uri: 'https://reown.com' }),
        getFarcasterUri: vi.fn().mockResolvedValue({ url: 'https://reown.com' })
      }
    } as unknown as AuthConnector)
    vi.spyOn(EventsController, 'sendEvent').mockImplementation(vi.fn())
    vi.spyOn(ModalController, 'close').mockImplementation(vi.fn())
    vi.spyOn(window, 'open').mockReturnValue(mockPopupWindow)
  })

  it('should call getSocialRedirectUri from auth provider when calling connectSocial', async () => {
    const mockAuthConnector = ConnectorController.getAuthConnector()
    const getSocialRedirectUriSpy = vi.spyOn(mockAuthConnector!.provider, 'getSocialRedirectUri')

    ConnectorControllerUtil.connectSocial({
      social: mockSocialProvider,
      namespace: mockNamespace
    })

    await vi.waitFor(() => {
      expect(getSocialRedirectUriSpy).toHaveBeenCalledWith({
        provider: mockSocialProvider
      })
    })
  })
})
