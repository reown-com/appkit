import test, { type Page, expect } from '@playwright/test'

import { BASE_URL, DEFAULT_CHAIN_NAME, DEFAULT_SESSION_PARAMS } from './shared/constants'
import { timingFixture } from './shared/fixtures/timing-fixture'
import { testMEthersVerifyDomainMismatch } from './shared/fixtures/w3m-ethers-verify-domain-mismatch-fixture'
import { testMEthersVerifyEvil } from './shared/fixtures/w3m-ethers-verify-evil-fixture'
import { testMEthersVerifyValid } from './shared/fixtures/w3m-ethers-verify-valid-fixture'
import { testM } from './shared/fixtures/w3m-fixture'
import { testMWagmiVerifyDomainMismatch } from './shared/fixtures/w3m-wagmi-verify-domain-mismatch-fixture'
import { testMWagmiVerifyEvil } from './shared/fixtures/w3m-wagmi-verify-evil-fixture'
import { testMWagmiVerifyValid } from './shared/fixtures/w3m-wagmi-verify-valid-fixture'
import { ModalPage } from './shared/pages/ModalPage'
import { WalletPage } from './shared/pages/WalletPage'
import { routeInterceptUrl } from './shared/utils/verify'
import { ModalValidator } from './shared/validators/ModalValidator'
import { WalletValidator } from './shared/validators/WalletValidator'

testM(
  'connection and signature requests from non-verified project should show as cannot verify',
  async ({ modalPage, context }) => {
    test.skip(modalPage.library !== 'wagmi', 'fixture always uses wagmi')

    const modalValidator = new ModalValidator(modalPage.page)
    const walletPage = new WalletPage(await context.newPage())
    await walletPage.load()
    const walletValidator = new WalletValidator(walletPage.page)

    const uri = await modalPage.getConnectUri()
    await walletPage.connectWithUri(uri)
    await expect(walletPage.page.getByText('Cannot Verify')).toBeVisible()
    await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
    await modalValidator.expectConnected()
    await walletValidator.expectConnected()

    await modalPage.sign()
    const chainName = modalPage.library === 'solana' ? 'Solana' : DEFAULT_CHAIN_NAME
    await walletValidator.expectReceivedSign({ chainName })
    await expect(walletPage.page.getByText('Cannot Verify')).toBeVisible()
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()

    await modalPage.disconnect()
    await modalValidator.expectDisconnected()
    await walletValidator.expectDisconnected()
  }
)

testMWagmiVerifyValid(
  'wagmi: connection and signature requests from non-scam verified domain should show as domain match',
  async ({ modalPage, context }) => {
    test.skip(modalPage.library !== 'wagmi', 'fixture always uses wagmi')

    const modalValidator = new ModalValidator(modalPage.page)
    const walletPage = new WalletPage(await context.newPage())
    await walletPage.load()
    const walletValidator = new WalletValidator(walletPage.page)

    const uri = await modalPage.getConnectUri()
    await walletPage.connectWithUri(uri)
    await expect(walletPage.page.getByTestId('session-info-verified')).toBeVisible()
    await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
    await modalValidator.expectConnected()
    await walletValidator.expectConnected()

    await modalPage.sign()
    const chainName = DEFAULT_CHAIN_NAME
    await walletValidator.expectReceivedSign({ chainName })
    await expect(walletPage.page.getByTestId('session-info-verified')).toBeVisible()
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()

    await modalPage.disconnect()
    await modalValidator.expectDisconnected()
    await walletValidator.expectDisconnected()
  }
)

testMWagmiVerifyDomainMismatch(
  'wagmi: connection and signature requests from non-scam verified domain but on localhost should show as invalid domain',
  async ({ modalPage, context }) => {
    test.skip(modalPage.library !== 'wagmi', 'fixture always uses wagmi')

    const modalValidator = new ModalValidator(modalPage.page)
    const walletPage = new WalletPage(await context.newPage())
    await walletPage.load()
    const walletValidator = new WalletValidator(walletPage.page)

    const uri = await modalPage.getConnectUri()
    await walletPage.connectWithUri(uri)
    await expect(walletPage.page.getByText('Invalid Domain')).toBeVisible()
    await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
    await modalValidator.expectConnected()
    await walletValidator.expectConnected()

    await modalPage.sign()
    const chainName = DEFAULT_CHAIN_NAME
    await walletValidator.expectReceivedSign({ chainName })
    await expect(walletPage.page.getByText('Invalid Domain')).toBeVisible()
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()

    await modalPage.disconnect()
    await modalValidator.expectDisconnected()
    await walletValidator.expectDisconnected()
  }
)

testMWagmiVerifyEvil(
  'wagmi: connection and signature requests from scam verified domain should show as scam domain',
  async ({ modalPage, context }) => {
    test.skip(modalPage.library !== 'wagmi', 'fixture always uses wagmi')

    const modalValidator = new ModalValidator(modalPage.page)
    const walletPage = new WalletPage(await context.newPage())
    await walletPage.load()
    const walletValidator = new WalletValidator(walletPage.page)

    const uri = await modalPage.getConnectUri()
    await walletPage.connectWithUri(uri)
    await expect(walletPage.page.getByText('Website flagged')).toBeVisible()
    await walletPage.page.getByText('Proceed anyway').click()
    await expect(walletPage.page.getByText('Potential threat')).toBeVisible()
    await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
    await modalValidator.expectConnected()
    await walletValidator.expectConnected()

    await modalPage.sign()
    const chainName = DEFAULT_CHAIN_NAME
    await expect(walletPage.page.getByText('Website flagged')).toBeVisible()
    await walletPage.page.getByText('Proceed anyway').click()
    await walletValidator.expectReceivedSign({ chainName })
    await expect(walletPage.page.getByText('Potential threat')).toBeVisible()
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()

    await modalPage.disconnect()
    await modalValidator.expectDisconnected()
    await walletValidator.expectDisconnected()
  }
)

testMEthersVerifyValid(
  'ethers: connection and signature requests from non-scam verified domain should show as domain match',
  async ({ modalPage, context }) => {
    test.skip(modalPage.library !== 'ethers', 'fixture always uses ethers')

    const modalValidator = new ModalValidator(modalPage.page)
    const walletPage = new WalletPage(await context.newPage())
    await walletPage.load()
    const walletValidator = new WalletValidator(walletPage.page)

    const uri = await modalPage.getConnectUri()
    await walletPage.connectWithUri(uri)
    await expect(walletPage.page.getByTestId('session-info-verified')).toBeVisible()
    await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
    await modalValidator.expectConnected()
    await walletValidator.expectConnected()

    await modalPage.sign()
    const chainName = DEFAULT_CHAIN_NAME
    await walletValidator.expectReceivedSign({ chainName })
    await expect(walletPage.page.getByTestId('session-info-verified')).toBeVisible()
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()

    await modalPage.disconnect()
    await modalValidator.expectDisconnected()
    await walletValidator.expectDisconnected()
  }
)

testMEthersVerifyDomainMismatch(
  'ethers: connection and signature requests from non-scam verified domain but on localhost should show as invalid domain',
  async ({ modalPage, context }) => {
    test.skip(modalPage.library !== 'ethers', 'fixture always uses ethers')

    const modalValidator = new ModalValidator(modalPage.page)
    const walletPage = new WalletPage(await context.newPage())
    await walletPage.load()
    const walletValidator = new WalletValidator(walletPage.page)

    const uri = await modalPage.getConnectUri()
    await walletPage.connectWithUri(uri)
    await expect(walletPage.page.getByText('Invalid Domain')).toBeVisible()
    await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
    await modalValidator.expectConnected()
    await walletValidator.expectConnected()

    await modalPage.sign()
    const chainName = DEFAULT_CHAIN_NAME
    await walletValidator.expectReceivedSign({ chainName })
    await expect(walletPage.page.getByText('Invalid Domain')).toBeVisible()
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()

    await modalPage.disconnect()
    await modalValidator.expectDisconnected()
    await walletValidator.expectDisconnected()
  }
)

testMEthersVerifyEvil(
  'ethers: connection and signature requests from scam verified domain should show as scam domain',
  async ({ modalPage, context }) => {
    test.skip(modalPage.library !== 'ethers', 'fixture always uses ethers')

    const modalValidator = new ModalValidator(modalPage.page)
    const walletPage = new WalletPage(await context.newPage())
    await walletPage.load()
    const walletValidator = new WalletValidator(walletPage.page)

    const uri = await modalPage.getConnectUri()
    await walletPage.connectWithUri(uri)
    await expect(walletPage.page.getByText('Website flagged')).toBeVisible()
    await walletPage.page.getByText('Proceed anyway').click()
    await expect(walletPage.page.getByText('Potential threat')).toBeVisible()
    await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
    await modalValidator.expectConnected()
    await walletValidator.expectConnected()

    await modalPage.sign()
    const chainName = DEFAULT_CHAIN_NAME
    await expect(walletPage.page.getByText('Website flagged')).toBeVisible()
    await walletPage.page.getByText('Proceed anyway').click()
    await walletValidator.expectReceivedSign({ chainName })
    await expect(walletPage.page.getByText('Potential threat')).toBeVisible()
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()

    await modalPage.disconnect()
    await modalValidator.expectDisconnected()
    await walletValidator.expectDisconnected()
  }
)

const prodVerifyServer = 'https://verify.walletconnect.org'

// "https://verify-server-staging.walletconnect-v1-bridge.workers.dev"
const altVerifyServer = null

interface TimingFixtureWithLibrary {
  library: string
}

timingFixture.extend<TimingFixtureWithLibrary>({
  library: ['wagmi', { option: true }]
})('wagmi: AppKit in iframe + verify happy case', async ({ page: rootPage, context, library }) => {
  test.skip(library !== 'wagmi', 'test always uses wagmi')

  const verifyApiNestedIframesTestOuterDomain =
    'https://verify-api-nested-iframes-test-outer-domain.com'
  const outerUrl = verifyApiNestedIframesTestOuterDomain
  const innerUrl = `${BASE_URL}library/wagmi-verify-valid`
  await rootPage.route(outerUrl, async route => {
    await route.fulfill({
      body: `<iframe name="innerFrame" src="${innerUrl}" style="width:100vw; height:100vh"></iframe>`
    })
  })
  if (altVerifyServer) {
    await routeInterceptUrl(rootPage, prodVerifyServer, altVerifyServer, '/')
  }
  await rootPage.goto(outerUrl)

  const frame = rootPage.frame({ name: 'innerFrame' })
  if (frame === null) {
    throw new Error('iframe not found')
  }

  /*
   * Forcibly cast the Frame to a Page so ModalPage accepts it. It has the same necessary functions for this test case, so this is OK.
   * Note we don't call `.load()` on the ModalPage since it would navigate the top-level page instead of the iframe.
   * Tried using `Page | Frame` on the ModalPage constructor but we have other functions that depend on fields specific to Page.
   */
  const page = frame as unknown as Page

  const modalPage = new ModalPage(page, 'wagmi', 'wagmi-verify-valid')
  if (modalPage.library === 'solana') {
    return
  }

  const modalValidator = new ModalValidator(modalPage.page)
  const walletPagePage = await context.newPage()
  if (altVerifyServer) {
    await routeInterceptUrl(walletPagePage, prodVerifyServer, altVerifyServer, '/')
  }
  const walletPage = new WalletPage(walletPagePage)
  await walletPage.load()
  const walletValidator = new WalletValidator(walletPage.page)

  const uri = await modalPage.getConnectUri()
  await walletPage.connectWithUri(uri)
  await expect(walletPage.page.getByTestId('session-info-verified')).toBeVisible()
  await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
  await modalValidator.expectConnected()
  await walletValidator.expectConnected()

  await modalPage.sign()
  const chainName = modalPage.library === 'solana' ? 'Solana' : DEFAULT_CHAIN_NAME
  await walletValidator.expectReceivedSign({ chainName })
  await expect(walletPage.page.getByTestId('session-info-verified')).toBeVisible()
  await walletPage.handleRequest({ accept: true })
  await modalValidator.expectAcceptedSign()

  await modalPage.disconnect()
  await modalValidator.expectDisconnected()
  await walletValidator.expectDisconnected()
})
