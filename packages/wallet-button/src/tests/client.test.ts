import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'

import type { ParsedCaipAddress } from '@reown/appkit-common'
import {
  type Connector,
  ConnectorController,
  ConnectorControllerUtil,
  FetchUtil,
  type WcWallet
} from '@reown/appkit-controllers'

import { AppKitWalletButton } from '../client'
import { ApiController } from '../controllers/ApiController'
import { WalletButtonController } from '../controllers/WalletButtonController'
import { WalletUtil } from '../utils/WalletUtil'

// -- Constants ------------------------------------------------------------
const METAMASK_CONNECTOR = {
  id: 'metamask',
  name: 'MetaMask'
} as Connector

const WC_CONNECTOR = {
  id: 'walletConnect',
  name: 'WalletConnect'
} as Connector

const PARSED_CAIP_ADDRESS = {
  address: '0x123',
  chainId: 1,
  chainNamespace: 'eip155'
} as ParsedCaipAddress

describe('AppKitWalletButton', () => {
  beforeAll(() => {
    vi.spyOn(ConnectorControllerUtil, 'connectSocial').mockImplementation(
      async () => PARSED_CAIP_ADDRESS
    )
    vi.spyOn(ConnectorControllerUtil, 'connectExternal').mockImplementation(
      async () => PARSED_CAIP_ADDRESS
    )
    vi.spyOn(ConnectorControllerUtil, 'connectWalletConnect').mockImplementation(
      async () => PARSED_CAIP_ADDRESS
    )
    vi.spyOn(FetchUtil.prototype, 'get').mockResolvedValue({
      data: []
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('it should fetch wallet buttons if not ready', () => {
    vi.spyOn(ApiController, 'fetchWalletButtons')
    vi.spyOn(WalletButtonController, 'state', 'get').mockReturnValue({
      ...WalletButtonController.state,
      ready: false
    })

    // Initialize wallet button
    new AppKitWalletButton()

    expect(ApiController.fetchWalletButtons).toHaveBeenCalled()
  })

  test('it should subscribe to ready event', async () => {
    const subscribeIsReady = vi.fn()

    // Initialize wallet button
    const appKitWalletButton = new AppKitWalletButton()

    appKitWalletButton.subscribeIsReady(subscribeIsReady)

    ApiController.state.walletButtons = [{ id: 'metamask' } as WcWallet]

    // Wait for state to update
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(subscribeIsReady).toHaveBeenCalled()
  })

  test('it should connect to google (social) and not call provider methods', () => {
    const mockProvider = {
      connectSocial: vi.fn()
    }

    const mockAuthConnector = {
      id: 'auth',
      type: 'AUTH',
      chain: 'eip155',
      provider: mockProvider
    }

    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(mockAuthConnector as any)
    // Initialize wallet button
    const appKitWalletButton = new AppKitWalletButton()

    appKitWalletButton.connect('google')
    expect(ConnectorControllerUtil.connectSocial).toHaveBeenCalledWith({
      social: 'google',
      onConnect: expect.any(Function),
      onOpenFarcaster: expect.any(Function)
    })

    expect(mockProvider.connectSocial).not.toHaveBeenCalled()
  })

  test('it should connect to metamask (external)', () => {
    vi.spyOn(WalletUtil, 'getWalletButton').mockReturnValue({
      id: 'metamask',
      rdns: 'metamask.io'
    } as unknown as WcWallet)
    vi.spyOn(ConnectorController, 'getConnector').mockReturnValue(METAMASK_CONNECTOR)

    // Initialize wallet button
    const appKitWalletButton = new AppKitWalletButton()

    appKitWalletButton.connect('metamask')
    expect(ConnectorControllerUtil.connectExternal).toHaveBeenCalledWith(METAMASK_CONNECTOR)
  })

  test('it should connect to walletConnect (QR Code)', () => {
    vi.spyOn(WalletUtil, 'getWalletButton').mockReturnValue({
      id: 'walletConnect'
    } as unknown as WcWallet)
    vi.spyOn(ConnectorController, 'getConnector').mockReturnValue(undefined)
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [WC_CONNECTOR] as Connector[]
    })

    // Initialize wallet button
    const appKitWalletButton = new AppKitWalletButton()

    appKitWalletButton.connect('walletConnect')
    expect(ConnectorControllerUtil.connectWalletConnect).toHaveBeenCalledWith({
      walletConnect: true,
      connector: WC_CONNECTOR,
      onConnect: expect.any(Function),
      onOpen: expect.any(Function)
    })
  })
})
