import { test as base, chromium, type BrowserContext } from '@playwright/test'
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
    // eslint-disable-next-line no-console
    console.log('isHeadless', isHeadless)

    const context = await chromium.launchPersistentContext('', {
      headless: isHeadless,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-setuid-sandbox',
        ...(isHeadless ? ['--headless=new'] : [])
      ]
    })

    await use(context)
  },
  extensionId: async ({ context }, use) => {
    // eslint-disable-next-line no-console
    console.log('extensionId (1)')
    let [background] = context.serviceWorkers()
    // eslint-disable-next-line no-console
    console.log('extensionId (2)')
    if (!background) {
      background = await context.waitForEvent('serviceworker')
      // eslint-disable-next-line no-console
      console.log('extensionId (3)')
    }

    // eslint-disable-next-line no-console
    console.log('extensionId (4)', background)

    const extensionId = background.url().split('/')[2]

    await use(extensionId as string)
  }
})
