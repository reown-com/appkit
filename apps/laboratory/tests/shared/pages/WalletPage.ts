/* eslint-disable no-await-in-loop */
import type { Locator, Page } from '@playwright/test'
import { WALLET_URL } from '../constants'
import type { SessionParams } from '../types'

export class WalletPage {
  private readonly baseURL = WALLET_URL

  private readonly gotoAccounts: Locator

  private readonly gotoSessions: Locator

  private readonly gotoHome: Locator

  private readonly gotoPairings: Locator

  private readonly gotoSettings: Locator

  constructor(public readonly page: Page) {
    this.gotoAccounts = this.page.getByTestId('accounts')
    this.gotoSessions = this.page.getByTestId('sessions')
    this.gotoHome = this.page.getByTestId('wc-connect')
    this.gotoPairings = this.page.getByTestId('pairings')
    this.gotoSettings = this.page.getByTestId('settings')
  }

  async load() {
    await this.page.goto(this.baseURL)
  }

  async connect() {
    await this.gotoHome.click()

    await this.page.getByTestId('uri-input').click()

    // Paste clipboard
    const isMac = process.platform === 'darwin'
    const modifier = isMac ? 'Meta' : 'Control'
    await this.page.keyboard.press(`${modifier}+KeyV`)

    await this.page.getByTestId('uri-connect-button').click()
  }

  async disconnect() {
    await this.gotoSessions.click()
    const sessionCard = this.page.getByTestId('session-card').first()
    await sessionCard.getByTestId('session-icon').click()
    await this.page.getByTestId('session-delete-button').click()
  }

  /**
   * Handle a session proposal event in the wallet
   * @param reqAccounts - required account numbers to select ex/ ['1', '2']
   * @param optAccounts - optional account numbers to select ex/ ['1', '2']
   * @param accept - accept or reject the session
   */
  async handleSessionProposal(opts: SessionParams) {
    const meh = opts.accept ? `approve` : `reject`
    await this.page.getByTestId(`session-${meh}-button`).focus()
    await this.page.keyboard.press('Space')
  }

  async handleRequest({ accept }: { accept: boolean }) {
    const meh = accept ? `approve` : `reject`
    await this.page.getByTestId(`request-button-${meh}`).click()
  }
}
