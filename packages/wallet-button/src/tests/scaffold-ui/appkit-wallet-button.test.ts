import { elementUpdated, fixture } from '@open-wc/testing'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { html } from 'lit'

import { ParseUtil } from '@reown/appkit-common'
import {
  ChainController,
  ConnectorController,
  ModalController,
  RouterController,
  type WcWallet
} from '@reown/appkit-core'

import { ApiController } from '../../controllers/ApiController.js'
import '../../scaffold-ui/appkit-wallet-button/index.js'
import type { AppKitWalletButton } from '../../scaffold-ui/appkit-wallet-button/index.js'
import { ConnectorUtil } from '../../utils/ConnectorUtil.js'
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

describe('AppKitWalletButton', () => {
  beforeAll(() => {
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      fetching: true,
      walletButtons: [MetaMask]
    })
    vi.spyOn(ApiController, 'fetchWalletButtons').mockResolvedValue()
  })

  beforeEach(() => {
    ChainController.state.activeCaipAddress = undefined
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

    vi.spyOn(ConnectorUtil, 'connectSocial').mockRejectedValueOnce('Connection rejected')

    const walletButtonExternalClick = vi.fn()

    walletButtonSocial.addEventListener('click', walletButtonExternalClick)

    await walletButtonSocial.click()

    expect(walletButtonExternalClick).toHaveBeenCalledOnce()

    element.requestUpdate()
    await elementUpdated(element)

    expect(walletButtonSocial.getAttribute('error')).not.toBeNull()
    expect(walletButtonSocial.getAttribute('loading')).toBeNull()
    expect(walletButtonSocial.getAttribute('disabled')).toBeNull()

    vi.spyOn(ConnectorUtil, 'connectSocial').mockImplementationOnce(async () => {
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
    const element: AppKitWalletButton = await fixture(
      html`<appkit-wallet-button wallet="metamask"></appkit-wallet-button>`
    )

    const walletButton = HelpersUtil.getByTestId(element, WALLET_BUTTON)

    expect(walletButton.getAttribute('name')).toBe('MetaMask')
    expect(walletButton.getAttribute('disabled')).toBeNull()
    expect(walletButton.getAttribute('loading')).toBeNull()

    ApiController.state.walletButtons = [MetaMask]

    const ModalControllerOpenSpy = vi
      .spyOn(ModalController, 'open')
      .mockImplementation(async () => {
        ModalController.state.open = true
      })

    const RouterControllerPushSpy = vi.spyOn(RouterController, 'push')

    const walletButtonClick = vi.fn()

    walletButton.addEventListener('click', walletButtonClick)

    walletButton.click()

    element.requestUpdate()
    await elementUpdated(element)

    expect(walletButton.getAttribute('disabled')).not.toBeNull()
    expect(walletButton.getAttribute('loading')).not.toBeNull()

    expect(walletButtonClick).toHaveBeenCalledOnce()
    expect(ModalControllerOpenSpy).toHaveBeenCalled()
    expect(RouterControllerPushSpy).toHaveBeenCalledWith('ConnectingWalletConnect', {
      wallet: MetaMask
    })

    expect(RouterController.state?.data?.wallet).toEqual(MetaMask)

    const ModalControllerCloseSpy = vi.spyOn(ModalController, 'close').mockImplementation(() => {
      ModalController.state.open = false
    })

    const parseCaipAddressSpy = vi.spyOn(ParseUtil, 'parseCaipAddress')

    const caipAddress = 'eip155:1:0x123'
    ChainController.state.activeCaipAddress = caipAddress

    // Wait until subscribeKey from ChainController has been called
    await HelpersUtil.sleep(100)

    expect(parseCaipAddressSpy).toHaveBeenCalledWith(caipAddress)
    expect(ModalControllerCloseSpy).toHaveBeenCalled()
    expect(RouterControllerPushSpy).toHaveBeenCalledWith('Connect')

    element.requestUpdate()
    await elementUpdated(element)

    expect(walletButton.getAttribute('disabled')).not.toBeNull()
    expect(walletButton.getAttribute('loading')).toBeNull()
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

    expect(walletButtonExternal).not.toBeNull()
    expect(walletButtonExternal.getAttribute('name')).toBe('MetaMask')
    expect(walletButtonExternal.getAttribute('disabled')).toBeNull()
    expect(walletButtonExternal.getAttribute('loading')).toBeNull()
    // @ts-expect-error
    expect(walletButtonExternal.imageSrc).toBe('data:image/png;base64,mocked...')

    vi.spyOn(ConnectorUtil, 'connectExternal').mockRejectedValueOnce('Connection rejected')

    const walletButtonExternalClick = vi.fn()

    walletButtonExternal.addEventListener('click', walletButtonExternalClick)

    await walletButtonExternal.click()

    expect(walletButtonExternalClick).toHaveBeenCalledOnce()

    element.requestUpdate()
    await elementUpdated(element)

    expect(walletButtonExternal.getAttribute('error')).not.toBeNull()
    expect(walletButtonExternal.getAttribute('loading')).toBeNull()
    expect(walletButtonExternal.getAttribute('disabled')).toBeNull()

    vi.spyOn(ConnectorUtil, 'connectExternal').mockImplementationOnce(async () => {
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
})
