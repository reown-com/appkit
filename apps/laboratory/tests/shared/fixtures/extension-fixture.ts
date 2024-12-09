import { test as base, chromium, type BrowserContext } from '@playwright/test'
import path from 'path'

export interface ExtensionFixture {
  context: BrowserContext
  extensionId: string
}

export const browserExtensionFixture = base.extend<ExtensionFixture>({
  context: async ({}, use) => {
    // TOD0: Fix the path to the extension, configure CI to build the extension
    const pathToExtension = path.join(__dirname, '../../browser-extension/dist')
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`
      ]
    })
    await use(context)
  },
  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers()
    if (!background) {
      background = await context.waitForEvent('serviceworker')
    }

    const extensionId = background.url().split('/')[2]
    await use(extensionId as string)
  }
})
