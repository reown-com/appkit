import type { Page } from '@playwright/test'
import { LOCAL_LABS_URL } from '../constants'

export class ModalPage {
  private readonly baseURL = LOCAL_LABS_URL

  constructor(public readonly page: Page) {}

  async load() {
    await this.page.goto(this.baseURL)
  }
}
