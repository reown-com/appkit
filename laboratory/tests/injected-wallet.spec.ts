import { testWithMM } from './shared/fixtures/extensions'
import { expect } from '@playwright/test'

/**
 * R&D testing for inject wallets, WIP
 */
testWithMM('open extension', async ({ page, context }) => {
  const mmPageEvent = context.waitForEvent('page')
  const mmPage = await mmPageEvent
  await mmPage.getByTestId('unlock-password').fill('3e1b0433a44e4c2c9a34e3b105eb6564')
  await mmPage.getByTestId('unlock-submit').click()

  // eslint-disable-next-line no-promise-executor-return
  await new Promise(resolve => setTimeout(resolve, 10000000))
  await page.goto('https://example.com')
})

/* You can use this mock test + playwright debug to open/modify the mm extension*/
testWithMM('configure extension', async ({ page }) => {
  await page.goto('https://example.com')

  // eslint-disable-next-line no-promise-executor-return
  await new Promise(resolve => setTimeout(resolve, 10000000))
  await page.goto('./with-wagmi/react?w3mPreferInjected=true')
  await page.getByTestId('partial-core-connect-button').click()
  await page.pause()
  await page.goto(`chrome-extension://deciejoknbkjgpaljdhgfcpnmipdnbnk/home.html#unlock`)
  await page.getByTestId('unlock-password').fill('3e1b0433a44e4c2c9a34e3b105eb6564')
  await page.getByTestId('unlock-submit').click()
  expect(true).toBe(true)
})
