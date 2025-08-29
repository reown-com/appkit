import { elementUpdated, fixture } from '@open-wc/testing'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { html } from 'lit'

import { ParseUtil } from '@reown/appkit-common'
import {
  ChainController,
  type Connector,
  ConnectorController,
  ApiController as ControllersApiController,
  CoreHelperUtil,
  ModalController,
  RouterController,
  type WcWallet
} from '@reown/appkit-controllers'
import { ConnectorControllerUtil } from '@reown/appkit-controllers'

import { ApiController } from '../../controllers/ApiController.js'
import '../../scaffold-ui/appkit-wallet-button/index.js'
import type { AppKitWalletButton } from '../../scaffold-ui/appkit-wallet-button/index.js'
import { ConstantsUtil } from '../../utils/ConstantsUtil.js'
import { HelpersUtil } from '../utils/HelperUtil.js'

// -- Constants --------------------------------------------------- //
const MetaMask = {
  id: ConstantsUtil.WalletButtonsIds.metamask,
  name: 'MetaMask',
  image_id: ''
} as WcWallet

const WALLET_BUTTON_SOCIAL = 'apkt-wallet-button-social'
const WALLET_BUTTON = 'apkt-wallet-button'
const WALLET_BUTTON_EXTERNAL = 'apkt-wallet-button-external'

const NAMESPACES = ['eip155', 'solana', 'bip122'] as const

describe('AppKitWalletButton', () => {
  beforeAll(() => {
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      fetching: true,
      walletButtons: [MetaMask]
    })
    vi.spyOn(ApiController, 'fetchWalletButtons').mockResolvedValue()
    vi.spyOn(ControllersApiController, 'prefetch').mockImplementation(() =>
      Promise.resolve([] as PromiseSettledResult<unknown>[])
    )
  })

  beforeEach(() => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
    ChainController.state.activeCaipAddress = undefined
    ModalController.state.loading = false
  })

  test('should connect with social', async () => {
    const element: AppKitWalletButton = await fixture(
      html`<appkit-wallet-button wallet="google"></appkit-wallet-button>`
    )

    const walletButtonSocial = HelpersUtil.getByTestId(element, WALLET_BUTTON_SOCIAL)

    expect(walletButtonSocial).not.toBeNull()
    expect(walletButtonSocial.getAttribute('name')).toBe('google')
    expect(walletButtonSocial.getAttribute('disabled')).toBeNull()
    expect(walletButtonSocial.getAttribute('loading')).toBeNull()

    vi.spyOn(ConnectorControllerUtil, 'connectSocial').mockRejectedValueOnce('Connection rejected')

    const walletButtonExternalClick = vi.fn()

    walletButtonSocial.addEventListener('click', walletButtonExternalClick)

    await walletButtonSocial.click()

    expect(walletButtonExternalClick).toHaveBeenCalledOnce()

    element.requestUpdate()
    await elementUpdated(element)

    expect(walletButtonSocial.getAttribute('error')).not.toBeNull()
    expect(walletButtonSocial.getAttribute('loading')).toBeNull()
    expect(walletButtonSocial.getAttribute('disabled')).toBeNull()

    vi.spyOn(ConnectorControllerUtil, 'connectSocial').mockImplementationOnce(async () => {
      const chainNamespace = 'eip155'
      const chainId = 1
      const address = 'eip155:1:0x123'

      ChainController.state.activeCaipAddress = `${chainNamespace}:${chainId}:${address}`

      return {
        chainNamespace,
        chainId,
        address
      }
    })

    await walletButtonSocial.click()

    expect(walletButtonExternalClick).toHaveBeenCalledTimes(2)

    element.requestUpdate()
    await elementUpdated(element)

    expect(walletButtonSocial.getAttribute('error')).toBeNull()
    expect(walletButtonSocial.getAttribute('loading')).toBeNull()
    expect(walletButtonSocial.getAttribute('disabled')).not.toBeNull()
  })

  test('should connect with walletConnect', async () => {
    vi.spyOn(ParseUtil, 'parseCaipAddress').mockReturnValue({
      chainNamespace: 'eip155',
      chainId: 1,
      address: '0x123'
    })

    const element: AppKitWalletButton = await fixture(
      html`<appkit-wallet-button wallet="metamask"></appkit-wallet-button>`
    )

    const caipAddress = 'eip155:1:0x123'
    const walletButton = HelpersUtil.getByTestId(element, WALLET_BUTTON)
    const ModalControllerOpenSpy = vi.spyOn(ModalController, 'open')
    const RouterControllerResetSpy = vi.spyOn(RouterController, 'reset')

    expect(walletButton.getAttribute('name')).toBe('MetaMask')
    expect(walletButton.getAttribute('disabled')).toBeNull()
    expect(walletButton.getAttribute('loading')).toBeNull()

    ApiController.state.walletButtons = [MetaMask]

    const walletButtonClick = vi.fn()

    walletButton.addEventListener('click', walletButtonClick)

    await walletButton.click()

    element.requestUpdate()
    await elementUpdated(element)

    expect(walletButton.getAttribute('disabled')).not.toBeNull()
    expect(walletButton.getAttribute('loading')).not.toBeNull()

    expect(walletButtonClick).toHaveBeenCalledOnce()
    expect(ModalControllerOpenSpy).toHaveBeenCalledWith({
      view: 'ConnectingWalletConnect',
      data: { wallet: MetaMask }
    })
    expect(RouterController.state?.data?.wallet).toEqual(MetaMask)

    const modalControllerCloseSpy = vi.spyOn(ModalController, 'close')
    const parseCaipAddressSpy = vi.spyOn(ParseUtil, 'parseCaipAddress')

    ChainController.state.activeCaipAddress = caipAddress

    // Wait until subscribeKey from ChainController has been called
    await HelpersUtil.sleep(100)

    expect(parseCaipAddressSpy).toHaveBeenCalledWith(caipAddress)
    expect(modalControllerCloseSpy).toHaveBeenCalled()
    expect(RouterControllerResetSpy).toHaveBeenCalledWith('Connect')

    element.requestUpdate()
    await elementUpdated(element)

    expect(walletButton.getAttribute('disabled')).not.toBeNull()
    expect(walletButton.getAttribute('loading')).toBeNull()
  })

  test('should redirect to all wallets on mobile if walletConnect is selected', async () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)
    const modalControllerOpenSpy = vi.spyOn(ModalController, 'open')

    const element: AppKitWalletButton = await fixture(
      html`<appkit-wallet-button wallet="walletConnect"></appkit-wallet-button>`
    )

    const walletButton = HelpersUtil.getByTestId(element, WALLET_BUTTON)

    const walletButtonClick = vi.fn()

    walletButton.addEventListener('click', walletButtonClick)

    await walletButton.click()

    expect(walletButtonClick).toHaveBeenCalled()
    expect(modalControllerOpenSpy).toHaveBeenCalledWith({ view: 'AllWallets' })
  })

  test('should connect with external connector', async () => {
    vi.spyOn(ConnectorController, 'getConnector').mockReturnValue({
      id: 'metamask',
      explorerId: MetaMask.id,
      type: 'ANNOUNCED',
      chain: 'eip155',
      name: 'MetaMask'
    })

    vi.spyOn(ConnectorController, 'getConnector').mockReturnValue({
      id: 'metamask',
      explorerId: MetaMask.id,
      name: 'MetaMask',
      imageUrl: 'data:image/png;base64,mocked...',
      type: 'ANNOUNCED',
      chain: 'eip155'
    })

    const element: AppKitWalletButton = await fixture(
      html`<appkit-wallet-button wallet="metamask"></appkit-wallet-button>`
    )

    const walletButtonExternal = HelpersUtil.getByTestId(element, WALLET_BUTTON_EXTERNAL)
    const walletButtonExternalClick = vi.fn()

    expect(walletButtonExternal).not.toBeNull()
    expect(walletButtonExternal.getAttribute('name')).toBe('MetaMask')
    expect(walletButtonExternal.getAttribute('disabled')).toBeNull()
    expect(walletButtonExternal.getAttribute('loading')).toBeNull()
    // @ts-expect-error
    expect(walletButtonExternal.imageSrc).toBe('data:image/png;base64,mocked...')

    vi.spyOn(ConnectorControllerUtil, 'connectExternal').mockRejectedValueOnce(
      'Connection rejected'
    )

    walletButtonExternal.addEventListener('click', walletButtonExternalClick)

    await walletButtonExternal.click()

    expect(walletButtonExternalClick).toHaveBeenCalledOnce()

    element.requestUpdate()
    await elementUpdated(element)

    expect(walletButtonExternal.getAttribute('error')).not.toBeNull()
    expect(walletButtonExternal.getAttribute('loading')).toBeNull()
    expect(walletButtonExternal.getAttribute('disabled')).toBeNull()

    vi.spyOn(ConnectorControllerUtil, 'connectExternal').mockImplementationOnce(async () => {
      const chainNamespace = 'eip155'
      const chainId = 1
      const address = 'eip155:1:0x123'

      ChainController.state.activeCaipAddress = `${chainNamespace}:${chainId}:${address}`

      return {
        chainNamespace,
        chainId,
        address
      }
    })

    await walletButtonExternal.click()

    expect(walletButtonExternalClick).toHaveBeenCalledTimes(2)

    element.requestUpdate()
    await elementUpdated(element)

    expect(walletButtonExternal.getAttribute('error')).toBeNull()
    expect(walletButtonExternal.getAttribute('loading')).toBeNull()
    expect(walletButtonExternal.getAttribute('disabled')).not.toBeNull()
  })

  test('should call connectSocial with correct namespace (eip155, solana and bip122)', async () => {
    for (const namespace of NAMESPACES) {
      const connectSocialSpy = vi
        .spyOn(ConnectorControllerUtil, 'connectSocial')
        .mockResolvedValueOnce({
          chainNamespace: namespace,
          chainId: 1,
          address: 'dummy-address'
        })

      const element: AppKitWalletButton = await fixture(
        html`<appkit-wallet-button wallet="google" namespace="${namespace}"></appkit-wallet-button>`
      )
      const walletButtonSocial = HelpersUtil.getByTestId(element, WALLET_BUTTON_SOCIAL)
      await walletButtonSocial.click()

      expect(connectSocialSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          social: 'google',
          namespace
        })
      )
    }
  })

  test('should call connectExternal with connector having correct namespace (eip155, solana and bip122)', async () => {
    for (const namespace of NAMESPACES) {
      vi.spyOn(ConnectorController, 'getConnector').mockReturnValue({
        id: 'metamask',
        type: 'ANNOUNCED' as const,
        name: 'MetaMask',
        explorerId: MetaMask.id,
        imageUrl: 'data:image/png;base64,mocked...',
        chain: namespace
      })
      const connectExternalSpy = vi
        .spyOn(ConnectorControllerUtil, 'connectExternal')
        .mockResolvedValueOnce({
          chainNamespace: namespace,
          chainId: 1,
          address: 'dummy-address'
        })

      const element: AppKitWalletButton = await fixture(
        html`<appkit-wallet-button
          wallet="metamask"
          namespace="${namespace}"
        ></appkit-wallet-button>`
      )
      const walletButtonExternal = HelpersUtil.getByTestId(element, WALLET_BUTTON_EXTERNAL)
      await walletButtonExternal.click()

      expect(connectExternalSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'metamask',
          chain: namespace
        })
      )
    }
  })

  test('should call connectWalletConnect with connector having correct namespace (eip155, solana and bip122)', async () => {
    for (const namespace of NAMESPACES) {
      const walletConnectConnector = {
        id: 'walletConnect',
        type: 'WALLET_CONNECT' as const,
        name: 'WalletConnect',
        chain: namespace
      } as Connector

      vi.spyOn(ConnectorController, 'getConnector').mockReturnValue(walletConnectConnector)
      vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue([
        walletConnectConnector
      ])
      const connectWalletConnectSpy = vi
        .spyOn(ConnectorControllerUtil, 'connectWalletConnect')
        .mockResolvedValueOnce({
          chainNamespace: namespace,
          chainId: 1,
          address: 'dummy-address'
        })

      const element: AppKitWalletButton = await fixture(
        html`<appkit-wallet-button
          wallet="walletConnect"
          namespace="${namespace}"
        ></appkit-wallet-button>`
      )
      const walletButton = HelpersUtil.getByTestId(element, WALLET_BUTTON)
      await walletButton.click()

      expect(connectWalletConnectSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          connector: expect.objectContaining({
            id: 'walletConnect',
            chain: namespace
          })
        })
      )
    }
  })
})
