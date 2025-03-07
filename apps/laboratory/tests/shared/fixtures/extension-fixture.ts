import { type BrowserContext, test as base, chromium } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export interface ExtensionFixture {
  context: BrowserContext
  extensionId: string
}

export const extensionFixture = base.extend<ExtensionFixture>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const pathToExtension = path.resolve(__dirname, '../../../../browser-extension/dist')

    const isHeadless = process.env['HEADLESS'] === 'true'

    const context = await chromium.launchPersistentContext('', {
      headless: isHeadless,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        ...(isHeadless ? ['--headless=new'] : [])
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
