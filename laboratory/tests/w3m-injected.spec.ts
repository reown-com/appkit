import { testWithMM } from './shared/fixtures/mm-fixture'
import { expect } from '@playwright/test'

/**
 * R&D testing for inject wallets, WIP
 */

testWithMM('should prefer injected wallets', async ({ page, context }) => {
  const mmPageEvent = context.waitForEvent('page')
  const mmPage = await mmPageEvent
  await mmPage.getByTestId('unlock-password').fill('password')
  await mmPage.getByTestId('unlock-submit').click()

  await page.goto('https://lab.web3modal.com/with-wagmi/react?w3mPreferInjected=true')
  await page.getByTestId('partial-core-connect-button').focus()
  await page.getByTestId('partial-core-connect-button').click()

  await mmPage.reload()
  await expect(mmPage.getByText(/Connect with MetaMask/u)).toBeVisible()
})

/* You can use this mock test + playwright debug to open/modify the mm extension */
testWithMM.skip('debug extension', async ({ page, context }) => {
  const mmPageEvent = context.waitForEvent('page')
  const mmPage = await mmPageEvent
  await mmPage.getByTestId('unlock-password').fill('password')
  await mmPage.getByTestId('unlock-submit').click()

  // eslint-disable-next-line no-promise-executor-return
  await new Promise(resolve => setTimeout(resolve, 10000000))
  await page.goto('https://example.com')
  expect(true).toBe(true)
})
