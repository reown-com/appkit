import { type BrowserContext, type Page, expect, test } from '@playwright/test'

import { DEFAULT_SESSION_PARAMS, WalletPage } from './WalletPage'
import { checkStateContainers, waitForModalToAppear } from './helpers'

test.describe.configure({ mode: 'serial' })

// Constants for test configuration
const NETWORKS = ['polygon', 'solana', 'bitcoin']
const BASE_URL = 'http://localhost:3011'

test.describe('AppKit HTML Basic Example', () => {
  let walletContext: BrowserContext
  let dappContext: BrowserContext
  let walletPage: WalletPage
  let dappPage: Page
  test.beforeAll(async ({ browser, browserName }) => {
    // Create a separate browser context for the wallet
    if (browserName === 'chromium') {
      walletContext = await browser.newContext({
        permissions: ['clipboard-read']
      })
      dappContext = await browser.newContext({
        permissions: ['clipboard-write', 'clipboard-read']
      })
    } else {
      walletContext = await browser.newContext()
      dappContext = await browser.newContext()
    }

    walletPage = new WalletPage(await walletContext.newPage())
    await walletPage.load()

    dappPage = await dappContext.newPage()
    await dappPage.goto(BASE_URL)
  })

  test.afterAll(async () => {
    await walletContext.close()
  })

  // test('should load the page successfully', async () => {
  //   // Navigate to the app
  //   await page.goto(BASE_URL)

  //   // Verify the page title is correct
  //   await expect(page).toHaveTitle('HTML AppKit Basic Example')

  //   // Verify the main components are visible
  //   await expect(page.locator('.page-title')).toBeVisible()
  //   await expect(page.locator('#open-modal')).toBeVisible()
  //   await expect(page.locator('#disconnect')).toBeVisible()
  //   await expect(page.locator('#sign-message')).toBeVisible()
  // })

  test('should open modal and connect with QR code', async () => {
    // Navigate to the app
    await dappPage.goto(BASE_URL)

    // Open the modal
    await dappPage.click('#open-modal')
    await waitForModalToAppear(dappPage)
    await dappPage.waitForTimeout(2000)

    const qrCode = dappPage.locator('wui-qr-code').first()
    qrCode.waitFor({
      state: 'visible',
      timeout: 5000
    })

    // Get QR code and copy link
    const copyLinkButton = dappPage.getByTestId('copy-wc2-uri').nth(1)
    copyLinkButton.waitFor({
      state: 'visible',
      timeout: 5000
    })
    await copyLinkButton.click()

    // Get link from clipboard
    const uri = await dappPage.evaluate(() => navigator.clipboard.readText())
    expect(uri).toContain('wc:')

    // Connect from wallet page
    await walletPage.connectWithUri(uri)
    await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)

    // Verify connection status on the main page
    await dappPage.waitForTimeout(200) // Wait for connection to be established
    await checkStateContainers(dappPage)

    // Verify that account state shows we're connected
    const accountStateText = await dappPage.locator('#accountState').textContent()
    expect(accountStateText).toContain('address')
    expect(accountStateText).toContain('connected')
  })

  test('should sign a message', async () => {
    await dappPage.click('#sign-message')
    await walletPage.handleRequest({ accept: true })
    await dappPage.waitForTimeout(1000)
  })

  // for (const network of NETWORKS) {
  //   test(`should switch to ${network} and sign a message`, async () => {
  //     // Switch to the specified network
  //     const networkButtonId = `#switch-network-${network.toLowerCase()}`
  //     await page.click(networkButtonId)

  //     // Wait for network switch
  //     await page.waitForTimeout(1000)

  //     // Verify network changed in the state
  //     const networkStateText = await page.locator('#networkState').textContent()
  //     expect(networkStateText?.toLowerCase()).toContain(network.toLowerCase())

  //     // Sign a message
  //     await page.click('#sign-message')

  //     // Approve signature in wallet
  //     await walletPage.approveSignature()

  //     // Verify signature was successful by checking events
  //     await page.waitForTimeout(1000)
  //     const eventsText = await page.locator('#events').textContent()
  //     expect(eventsText).toContain('on_sign') // This string may need to be adjusted based on actual event names
  //   })
  // }

  test('should disconnect', async () => {
    // Click disconnect button
    await dappPage.click('#disconnect')

    // Verify disconnection in account state
    await dappPage.waitForTimeout(1000)
    const accountStateText = await dappPage.locator('#accountState').textContent()
    expect(accountStateText).not.toContain('address')

    // Try opening the modal again to ensure we can reconnect
    await dappPage.click('#open-modal')
    await waitForModalToAppear(dappPage)
  })
})
