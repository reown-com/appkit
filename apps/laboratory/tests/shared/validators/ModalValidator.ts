import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

import type { CaipNetworkId } from '@reown/appkit'

import { ConstantsUtil } from '../../../src/utils/ConstantsUtil'
import { verifySignature } from '../../../src/utils/SignatureUtil'
import { getMaximumWaitConnections } from '../utils/timeouts'

const MAX_WAIT = getMaximumWaitConnections()

export class ModalValidator {
  public readonly page: Page
  constructor(page: Page) {
    this.page = page
  }

  async getLocator(selector: string, timeout = 5000, interval = 500): Promise<Locator> {
    const start = Date.now()
    while (Date.now() - start < timeout) {
      const element = this.page.locator(selector)
      if (element) {
        return element
      }
      // eslint-disable-next-line no-await-in-loop
      await this.page.waitForTimeout(interval)
    }
    throw new Error(`Element ${selector} was not found within ${timeout}ms`)
  }

  async getByTestId(testId: string | RegExp, timeout = 5000, interval = 500): Promise<Locator> {
    const start = Date.now()
    while (Date.now() - start < timeout) {
      const element = this.page.getByTestId(testId)
      if (element) {
        return element
      }
      // eslint-disable-next-line no-await-in-loop
      await this.page.waitForTimeout(interval)
    }
    throw new Error(
      `Element with data-testid="${testId}" was not found within ${timeout}ms`
    )
  }

  async expectConnected() {
    const accountButton = (await this.getLocator('appkit-account-button')).first()
    await expect(accountButton, 'Account button should be present').toBeAttached({
      timeout: MAX_WAIT
    })
    await expect(
      await this.getByTestId('connect-button'),
      'Connect button should not be present'
    ).toBeHidden({
      timeout: MAX_WAIT
    })
    await this.page.waitForTimeout(500)
  }

  async expectLoading() {
    const accountButton = await this.getLocator('appkit-connect-button')
    await expect(accountButton, 'Account button should be present').toBeAttached({
      timeout: MAX_WAIT
    })
    await expect(
      await this.getByTestId('connect-button'),
      'Connect button should show connecting state'
    ).toHaveText('Connecting...', {
      timeout: MAX_WAIT
    })
  }

  async expectBalanceFetched(currency: 'SOL' | 'ETH' | 'BTC' | 'POL') {
    const accountButton = (await this.getLocator('appkit-account-button')).first()
    await expect(accountButton, `Account button should show balance as ${currency}`).toContainText(
      `0.000 ${currency}`
    )
  }

  async expectAuthenticated() {
    await expect(
      await this.getByTestId('w3m-authentication-status'),
      'Authentication status should be: authenticated'
    ).toContainText('authenticated', { timeout: 10000 })
  }

  async expectOnSignInEventCalled(toBe: boolean) {
    await expect(await this.getByTestId('siwe-event-onSignIn')).toContainText(`${toBe}`)
  }

  async expectUnauthenticated() {
    await expect(
      await this.getByTestId('w3m-authentication-status'),
      'Authentication status should be: unauthenticated'
    ).toContainText('unauthenticated', { timeout: 20000 })
  }

  async expectOnSignOutEventCalled(toBe: boolean) {
    await expect(await this.getByTestId('siwe-event-onSignOut')).toContainText(`${toBe}`)
  }

  async expectSignatureDeclined() {
    await expect(
      this.page.getByText('Signature declined'),
      'Signature declined should be visible'
    ).toBeVisible()
  }

  async expectDisconnected(namespace?: string) {
    const connectButton = await this.getByTestId(
      `connect-button${namespace ? `-${namespace}` : ''}`
    )
    await expect(connectButton, 'Connect button should be present').toBeVisible({
      timeout: MAX_WAIT
    })

    await expect(connectButton, 'Connect button should be enabled').toBeEnabled({
      timeout: MAX_WAIT
    })

    await expect(connectButton, 'Connect button should contain text Connect').toHaveText(
      'Connect Wallet',
      {
        timeout: MAX_WAIT
      }
    )
  }

  async expectSingleAccount() {
    await expect(
      await this.getByTestId('single-account-avatar'),
      'Single account widget should be present'
    ).toBeVisible({
      timeout: MAX_WAIT
    })
  }

  async expectConnectScreen() {
    await expect(this.page.getByText('Connect Wallet')).toBeVisible({
      timeout: MAX_WAIT
    })
  }

  async expectAddress(expectedAddress: string) {
    const address = await this.getByTestId('w3m-address')

    await expect(address, 'Correct address should be present').toHaveText(expectedAddress)
  }

  async expectCaipAddressHaveCorrectNetworkId(caipNetworkId: CaipNetworkId) {
    const address = await this.getByTestId('w3m-caip-address')
    await expect(address, 'Correct CAIP address should be present').toContainText(
      caipNetworkId.toString()
    )
  }

  async expectNetwork(network: string) {
    const networkButton = await this.getByTestId('w3m-account-select-network')
    await expect(networkButton, `Network button should contain text ${network}`).toHaveText(
      network,
      {
        timeout: 5000
      }
    )
  }

  async expectWalletButtonHook(id: string, disabled: boolean) {
    const walletButtonHook = await this.getByTestId(`wallet-button-hook-${id}`)
    await expect(walletButtonHook).toBeVisible({ timeout: 20_000 })

    if (disabled) {
      await expect(walletButtonHook).toBeDisabled({ timeout: 20_000 })
    } else {
      await expect(walletButtonHook).toBeEnabled({ timeout: 20_000 })
    }
  }

  async expectAcceptedSign() {
    // We use Chakra Toast and it's not quite straightforward to set the `data-testid` attribute on the toast element.
    await expect(this.page.getByText(ConstantsUtil.SigningSucceededToastTitle)).toBeVisible({
      timeout: 30 * 1000
    })
    const closeButton = await this.getLocator('#toast-close-button')

    await expect(closeButton).toBeVisible()
    await closeButton.click()
  }

  async expectAcceptedSignTypedData() {
    await expect(this.page.getByText('Success')).toBeVisible({
      timeout: MAX_WAIT
    })
    const closeButton = await this.getLocator('#toast-close-button')
    await expect(closeButton).toBeVisible({ timeout: MAX_WAIT })
    await closeButton.click()
  }

  async expectRejectedSign() {
    // We use Chakra Toast and it's not quite straightforward to set the `data-testid` attribute on the toast element.
    await expect(this.page.getByText(ConstantsUtil.SigningFailedToastTitle)).toBeVisible()
    const closeButton = await this.getLocator('#toast-close-button')

    await expect(closeButton).toBeVisible()
    await closeButton.click()
  }

  async expectSwitchedNetwork(network: string) {
    const switchNetworkButton = await this.getByTestId(`w3m-network-switch-${network}`)
    await expect(switchNetworkButton).toBeVisible()
  }

  async expectNetworkButton(network: string) {
    const alertBarText = await this.getByTestId('w3m-network-button')
    await expect(alertBarText).toHaveText(network)
  }

  async expectSwitchChainView(chainName: string) {
    const title = await this.getByTestId(`w3m-switch-active-chain-to-${chainName}`)
    await expect(title).toBeVisible()
  }

  async expectSwitchChainWithNetworkButton(chainName: string) {
    const switchNetworkViewLocator = await this.getLocator('wui-network-button')
    await expect(switchNetworkViewLocator).toHaveText(chainName)
  }

  async expectSwitchedNetworkWithNetworkView() {
    const switchNetworkViewLocator = await this.getLocator('w3m-network-switch-view')
    await expect(switchNetworkViewLocator).toBeVisible()
    await expect(switchNetworkViewLocator).not.toBeVisible({
      timeout: 20_000
    })
  }

  async expectSwitchedNetworkOnNetworksView(name: string) {
    const networkOptions = await this.getByTestId(`w3m-network-switch-${name}`)
    await expect(networkOptions.locator('wui-icon')).toBeVisible()
  }

  expectSecureSiteFrameNotInjected() {
    const secureSiteIframe = this.page.frame({ name: 'w3m-secure-iframe' })
    expect(secureSiteIframe).toBeNull()
  }

  expectQueryParameterFromUrl({ url, key, value }: { url: string; key: string; value: string }) {
    const _url = new URL(url)
    const queryParameters = Object.fromEntries(_url.searchParams.entries())
    expect(queryParameters[key]).toBe(value)
  }

  async expectAllWalletsListSearchItem(id: string) {
    const allWalletsListSearchItem = await this.getByTestId(`wallet-search-item-${id}`)
    await expect(allWalletsListSearchItem).toBeVisible()
  }

  async expectNoSocials() {
    const socialList = await this.getByTestId('wui-list-social')
    await expect(socialList).toBeHidden()
  }

  async expectAllWallets() {
    const allWallets = await this.getByTestId('all-wallets')
    await expect(allWallets).toBeVisible()
  }

  async expectNoTryAgainButton() {
    const secondaryButton = await this.getByTestId('w3m-connecting-widget-secondary-button')
    await expect(secondaryButton).toBeHidden()
  }

  async expectTryAgainButton() {
    const secondaryButton = await this.getByTestId('w3m-connecting-widget-secondary-button')
    await expect(secondaryButton).toBeVisible()
  }

  async expectAlertBarText(text: string) {
    const alertBarText = await this.getByTestId('wui-alertbar-text')
    await expect(alertBarText).toHaveText(text)
  }

  async expectEmailLogin() {
    const emailInput = await this.getByTestId('wui-email-input')
    await expect(emailInput).toBeVisible()
  }

  async expectEmailLineSeparator() {
    const emailInput = await this.getByTestId('w3m-email-login-or-separator')
    await expect(emailInput).toBeVisible()
  }

  async expectValidSignature(signature: `0x${string}`, address: `0x${string}`, chainId: number) {
    const isVerified = await verifySignature({
      address,
      message: 'Hello AppKit!',
      signature,
      chainId
    })

    expect(isVerified).toBe(true)
  }

  async expectExternalVisible() {
    const externalConnector = await this.getByTestId(
      /^wallet-selector-external-externalTestConnector/u
    )
    await expect(externalConnector).toBeVisible()
  }

  async expectCoinbaseNotVisible() {
    const coinbaseConnector = await this.getByTestId(/^wallet-selector-external-coinbaseWalletSDK/u)
    await expect(coinbaseConnector).not.toBeVisible()
  }

  async expectCoinbaseVisible() {
    const coinbaseConnector = this.page.getByTestId(
      /^wallet-selector-featured-fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa/u
    )
    await expect(coinbaseConnector).toBeVisible({ timeout: 10_000 })
  }

  async expectMultipleAccounts() {
    await this.page.waitForTimeout(500)
    await expect(this.page.getByText('Switch Address')).toBeVisible({
      timeout: MAX_WAIT
    })

    expect((await this.getByTestId('switch-address-item')).first()).toBeVisible()
    const accounts = await (await this.getByTestId('switch-address-item')).all()

    expect(accounts.length).toBeGreaterThan(1)
  }

  async expectNetworkNotSupportedVisible() {
    const networkNotSupportedMessage = this.page.getByText(
      'This app doesn’t support your current network. Switch to an available option to continue.'
    )
    await expect(
      networkNotSupportedMessage,
      'Network not supported message should be visible'
    ).toBeVisible()
  }

  async expectAccountPageVisible() {
    const switchNetworkButton = await this.getByTestId('w3m-account-select-network')
    await expect(switchNetworkButton).toBeVisible()
  }

  async expectOnrampButton(visible: boolean) {
    const onrampButton = await this.getByTestId('w3m-account-default-onramp-button')
    if (visible) {
      await expect(onrampButton).toBeVisible()
    } else {
      await expect(onrampButton).not.toBeVisible()
    }
  }

  async expectWalletGuide(_library: string, guide: 'get-started' | 'explore') {
    const walletGuide = await this.getByTestId(
      guide === 'explore' ? 'w3m-wallet-guide-explore' : 'w3m-wallet-guide-get-started'
    )
    await expect(walletGuide).toBeVisible()
  }

  async expectAccountNameFound(name: string) {
    const suggestion = (await this.getByTestId('account-name-suggestion')).getByText(name)
    await expect(suggestion).toBeVisible()
  }

  async expectHeaderText(text: string) {
    const headerText = await this.getByTestId('w3m-header-text')
    await expect(headerText).toHaveText(text)
  }

  async expectSignatureRequestFrameByText(headerText: string) {
    await expect(
      this.page.frameLocator('#w3m-iframe').getByText(headerText),
      'AppKit iframe should be visible'
    ).toBeVisible({
      timeout: 10000
    })
    await this.page.waitForTimeout(500)
  }

  async expectAccountNameApproveTransaction(name: string) {
    await this.expectSignatureRequestFrameByText('requests a signature')
    const iframe = this.page.frameLocator('#w3m-iframe')
    const textContent = await iframe.locator('.textContent').textContent()
    expect(textContent).toContain(`{"name":"${name}","attributes":{},"timestamp":`)
  }

  async expectCallStatusSuccessOrRetry(sendCallsId: string, allowedRetry: boolean) {
    const callStatusReceipt = this.page.getByText('"status": "CONFIRMED"')
    const isConfirmed = await callStatusReceipt.isVisible({
      timeout: 10 * 1000
    })
    if (isConfirmed) {
      const closeButton = await this.getLocator('#toast-close-button')

      await expect(closeButton).toBeVisible()
      await closeButton.click()
    } else if (allowedRetry) {
      const callStatusButton = await this.getByTestId('get-calls-status-button')
      await expect(callStatusButton).toBeVisible()
      await callStatusButton.click()
      this.expectCallStatusSuccessOrRetry(sendCallsId, false)
    }

    throw new Error('Call status not confirmed')
  }

  async expectNetworkVisible(name: string) {
    const network = await this.getByTestId(`w3m-network-switch-${name}`)
    await expect(network).toBeVisible()
    await expect(network).toBeDisabled()
  }

  async expectNetworksDisabled(name: string) {
    const disabledNetwork = await this.getByTestId(`w3m-network-switch-${name}`)
    await expect(disabledNetwork.locator('button')).toBeDisabled()
  }

  async expectToBeConnectedInstantly() {
    // Wait for the page to be loaded
    const initializeBoundary = await this.getByTestId('w3m-page-loading')
    await expect(initializeBoundary).toBeHidden()
    const accountButton = await this.getLocator('appkit-account-button')
    await expect(accountButton, 'Account button should be present').toBeAttached({
      timeout: 1000
    })
  }

  async expectConnectButtonLoading() {
    const connectButton = await this.getByTestId('connect-button')
    await expect(connectButton).toContainText('Connecting...')
  }

  async expectAccountButtonReady(namespace?: string) {
    const accountButton = await this.getByTestId(
      `account-button${namespace ? `-${namespace}` : ''}`
    )
    await expect(accountButton).toBeVisible({ timeout: MAX_WAIT })
  }

  async expectAccountSwitched(oldAddress: string) {
    const address = await this.getByTestId('w3m-address')
    await expect(address).not.toHaveText(oldAddress)
  }

  async expectSocialsVisible() {
    const socials = await this.getByTestId('w3m-social-login-widget')
    await expect(socials).toBeVisible()
  }

  async expectModalNotVisible() {
    const modal = await this.getByTestId('w3m-modal')
    await expect(modal).toBeHidden()
  }

  async expectSnackbar(message: string) {
    await expect(await this.getByTestId('wui-snackbar-message')).toHaveText(message, {
      timeout: MAX_WAIT
    })
  }

  async expectEmail() {
    const email = await this.getByTestId('w3m-email')
    await expect(email).toBeVisible({ timeout: MAX_WAIT })
  }

  async expectAccountType() {
    const authAccountType = await this.getByTestId('w3m-account-type')
    await expect(authAccountType).toBeVisible({ timeout: MAX_WAIT })
  }

  async expectSmartAccountStatus() {
    const smartAccountStatus = await this.getByTestId('w3m-sa-account-status')
    await expect(smartAccountStatus).toBeVisible({ timeout: MAX_WAIT })
  }

  async checkConnectionStatus(status: 'connected' | 'disconnected' | 'loading', network?: string) {
    if (status === 'connected') {
      await this.expectConnected()
    } else if (status === 'disconnected') {
      await this.expectDisconnected()
    } else if (status === 'loading') {
      await this.expectLoading()
    }

    if (network) {
      await this.expectNetworkButton(network)
    }
  }
}
