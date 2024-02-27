/* eslint-disable no-await-in-loop */
import { expect, type Locator, type Page } from '@playwright/test'
import { WALLET_URL } from '../constants'
import type { SessionParams } from '../types'

export class WalletPage {
  private readonly baseURL = WALLET_URL

  private gotoHome: Locator
  private vercelPreview: Locator

  constructor(public page: Page) {
    this.gotoHome = this.page.getByTestId('wc-connect')
    this.vercelPreview = this.page.locator('css=vercel-live-feedback')
  }

  async load() {
    await this.page.goto(this.baseURL)
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
    const isVercelPreview = (await this.vercelPreview.count()) > 0
    if (isVercelPreview) {
      await this.vercelPreview.evaluate((iframe: HTMLIFrameElement) => iframe.remove())
    }
    await this.gotoHome.click()
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
    const variant = opts.accept ? `approve` : `reject`
    // `.click` doesn't work here, so we use `.focus` and `Space`
    await this.performRequestAction(variant)
  }

  async handleRequest({ accept }: { accept: boolean }) {
    const variant = accept ? `approve` : `reject`
    // `.click` doesn't work here, so we use `.focus` and `Space`
    await this.performRequestAction(variant)
  }

  async performRequestAction(variant: string) {
    await this.page.waitForLoadState()
    const btn = this.page.getByTestId(`session-${variant}-button`)
    await expect(btn, `Session ${variant} element should be visible`).toBeVisible({
      timeout: 15000
    })
    await expect(btn).toBeEnabled()
    await btn.focus()
    await this.page.keyboard.press('Space')
  }
}
