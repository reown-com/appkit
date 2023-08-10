/* eslint-disable prefer-destructuring */
/* eslint-disable no-empty-pattern */
import { test as base, chromium, type BrowserContext } from '@playwright/test'
import path from 'path'

export const testWithMM = base.extend<{
  contextMM: BrowserContext
  extensionId: string
}>({
  context: async ({}, use) => {
    const pathToExtension = path.join(__dirname, '../data/metamask-chrome-10.34.0')
    const pathToStorage = path.join(__dirname, '../data/mm-storage')

    const context = await chromium.launchPersistentContext(pathToStorage, {
      headless: false,
      args: [
        // `--headless=new`,
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`
      ]
    })
    await use(context)
    await context.close()
  },
  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers()
    if (!background) {
      background = await context.waitForEvent('serviceworker')
    }

    const extensionId = background.url().split('/')[2]
    await use(extensionId)
  }
})
