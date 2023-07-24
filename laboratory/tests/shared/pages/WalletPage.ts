import type { Locator, Page } from '@playwright/test'

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
    await this.page.getByTestId('session-approve-button').click()
  }
}
