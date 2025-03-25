/* eslint-disable no-await-in-loop */
import { type Locator, type Page, expect } from '@playwright/test'

import { WALLET_URL } from '../constants'
import type { SessionParams } from '../types'

export class WalletPage {
  private readonly baseURL = WALLET_URL

  private gotoHome: Locator
  private vercelPreview: Locator

  public connectToSingleAccount = false
  public page: Page
  public isPageLoaded = false

  constructor(page: Page) {
    this.page = page
    this.gotoHome = this.page.getByTestId('wc-connect')
    this.vercelPreview = this.page.locator('css=vercel-live-feedback')
  }

  async load() {
    await this.page.goto(this.baseURL)
    this.isPageLoaded = true
  }

  loadNewPage(page: Page) {
    this.page = page
    this.gotoHome = this.page.getByTestId('wc-connect')
    this.vercelPreview = this.page.locator('css=vercel-live-feedback')
  }

  /**
   * Connect by inserting provided URI into the input element
   */

  async connectWithUri(uri: string) {
    await this.page.waitForLoadState()
    const isVercelPreview = (await this.vercelPreview.count()) > 0
    if (isVercelPreview) {
      await this.vercelPreview.evaluate((iframe: HTMLIFrameElement) => iframe.remove())
    }
    /*
     * If connecting to a single account manually navigate.
     * Otherwise click the home button.
     */
    if (this.connectToSingleAccount) {
      await this.page.goto(`${this.baseURL}/walletconnect?addressesToApprove=1`)
    } else {
      await this.gotoHome.click()
    }
    const input = this.page.getByTestId('uri-input')
    await input.waitFor({
      state: 'visible',
      timeout: 5000
    })
    await input.fill(uri)
    const connectButton = this.page.getByTestId('uri-connect-button')
    await expect(connectButton, 'Connect button should be enabled').toBeEnabled({
      timeout: 5000
    })
    await connectButton.click()
  }

  /**
   * Handle a session proposal event in the wallet
   * @param reqAccounts - required account numbers to select ex/ ['1', '2']
   * @param optAccounts - optional account numbers to select ex/ ['1', '2']
   * @param accept - accept or reject the session
   */
  async handleSessionProposal(opts: SessionParams) {
    await this.page.waitForLoadState()
    const variant = opts.accept ? `approve` : `reject`
    // `.click` doesn't work here, so we use `.focus` and `Space`
    await this.performRequestAction(variant)
  }

  async handleRequest({ accept }: { accept: boolean }) {
    await this.page.waitForLoadState()
    const variant = accept ? `approve` : `reject`
    // `.click` doesn't work here, so we use `.focus` and `Space`
    await this.performRequestAction(variant)
  }

  async performRequestAction(variant: string) {
    await this.page.waitForLoadState()
    const btn = this.page.getByTestId(`session-${variant}-button`)
    await expect(btn, `Session ${variant} element should be visible`).toBeVisible({
      timeout: 30000
    })
    await expect(btn).toBeEnabled()
    await btn.focus()
    await this.page.keyboard.press('Space')
  }

  /**
   * Enables testnets in the wallet settings
   */
  async enableTestnets() {
    await this.page.waitForLoadState()
    const settingsButton = this.page.getByTestId('settings')
    await settingsButton.click()
    const testnetSwitch = this.page.getByTestId('settings-toggle-testnets')
    await testnetSwitch.click()
    expect(testnetSwitch).toHaveAttribute('data-state', 'checked')
  }

  /**
   * Switches the network in the wallet
   * @param network the network id to switch (e.g. eip155:1 for Ethereum Mainnet)
   */
  async switchNetwork(network: string) {
    await this.page.waitForLoadState()
    const networkButton = this.page.getByTestId('accounts')
    await networkButton.click()
    const switchNetworkButton = this.page.getByTestId(`chain-switch-button${network}`)
    await switchNetworkButton.click()
    await expect(switchNetworkButton).toHaveText('✅')
  }

  /**
   * Disconnects the current connection in the wallet
   */
  async disconnectConnection() {
    await this.page.waitForLoadState()
    const sessionsButton = this.page.getByTestId('sessions')
    await sessionsButton.click()
    const sessionCard = this.page.getByTestId(`session-card`)
    await sessionCard.click()
    const disconnectButton = this.page.getByText('Delete')
    await disconnectButton.click()
  }

  /**
   * Sets a flag to indicate whether to connect to a single account
   * @param connectToSingleAccount boolean flag to set
   */
  setConnectToSingleAccount(connectToSingleAccount: boolean) {
    this.connectToSingleAccount = connectToSingleAccount
  }
}
