/* eslint-disable no-await-in-loop */
import type { Locator, Page } from '@playwright/test'
import type { SessionParams } from '../types'

export class WalletPage {
  private readonly baseURL = 'http://localhost:3001'

  private readonly goToAccounts: Locator

  private readonly goToSessions: Locator

  private readonly goToHome: Locator

  private readonly goToPairings: Locator

  private readonly goToSettings: Locator

  constructor(public readonly page: Page) {
    this.goToAccounts = this.page.getByTestId('accounts')
    this.goToSessions = this.page.getByTestId('sessions')
    this.goToHome = this.page.getByTestId('wc-connect')
    this.goToPairings = this.page.getByTestId('pairings')
    this.goToSettings = this.page.getByTestId('settings')
  }

  async load() {
    await this.page.goto(this.baseURL)
  }

  async connect() {
    await this.goToHome.click()

    await this.page.getByTestId('uri-input').click()

    // Paste clipboard
    const isMac = process.platform === 'darwin'
    const modifier = isMac ? 'Meta' : 'Control'
    await this.page.keyboard.press(`${modifier}+KeyV`)

    await this.page.getByTestId('uri-connect-button').click()
  }

  /**
   * Handle a session proposal event in the wallet
   * @param reqAccounts - required account numbers to select ex/ ['1', '2']
   * @param optAccounts - optional account numbers to select ex/ ['1', '2']
   * @param accept - accept or reject the session
   */
  async handleSessionProposal(opts: SessionParams) {
    await this.selectAccounts(opts.reqAccounts, true)
    await this.selectAccounts(opts.optAccounts, false)

    const meh = opts.accept ? `approve` : `reject`
    await this.page.getByTestId(`session-${meh}-button`).focus()
    await this.page.keyboard.press('Space')
  }

  async disconnect() {
    await this.goToSessions.click()
    const sessionCard = this.page.getByTestId('session-card').first()
    await sessionCard.getByTestId('session-icon').click()
    await this.page.getByTestId('session-delete-button').click()
  }

  private async selectAccounts(accountNums: string[], required: boolean) {
    for await (const accountNum of accountNums) {
      await this.page
        .getByTestId(`account-select-card-${required ? 'req' : 'opt'}-${accountNum}`)
        .click()
    }
  }
}
