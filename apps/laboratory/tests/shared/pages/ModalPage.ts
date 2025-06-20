/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
import type { BrowserContext, Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

import type { WalletFeature } from '@reown/appkit'
import { WalletPage, WalletValidator } from '@reown/appkit-testing'
import {
  BASE_URL,
  DEFAULT_SESSION_PARAMS,
  EXTENSION_NAME,
  EXTENSION_RDNS
} from '@reown/appkit-testing'

import { getNamespaceByLibrary } from '@/tests/shared/utils/namespace'

import type { TimingRecords } from '../fixtures/timing-fixture'
import { doActionAndWaitForNewPage } from '../utils/actions'
import { Email } from '../utils/email'
import { routeInterceptUrl } from '../utils/verify'
import type { ModalValidator } from '../validators/ModalValidator'
import { DeviceRegistrationPage } from './DeviceRegistrationPage'

const maliciousUrl = 'https://malicious-app-verify-simulation.vercel.app'

export type ModalFlavor =
  | 'default'
  | 'external'
  | 'debug-mode'
  | 'wagmi-verify-valid'
  | 'wagmi-verify-domain-mismatch'
  | 'wagmi-verify-evil'
  | 'ethers-verify-valid'
  | 'ethers-verify-domain-mismatch'
  | 'ethers-verify-evil'
  | 'no-email'
  | 'no-socials'
  | 'wallet-button'
  | 'siwe'
  | 'siwx'
  | 'core-sign-client'
  | 'core-universal-provider'
  | 'core'
  | 'all'

function getUrlByFlavor(baseUrl: string, library: string, flavor: ModalFlavor) {
  const urlsByFlavor: Partial<Record<ModalFlavor, string>> = {
    default: `${baseUrl}library/${library}/`,
    external: `${baseUrl}library/external/`,
    siwx: `${baseUrl}library/siwx-default/`,
    'wagmi-verify-valid': `${baseUrl}library/wagmi-verify-valid/`,
    'wagmi-verify-domain-mismatch': `${baseUrl}library/wagmi-verify-domain-mismatch/`,
    'wagmi-verify-evil': maliciousUrl,
    'ethers-verify-valid': `${baseUrl}library/ethers-verify-valid/`,
    'ethers-verify-domain-mismatch': `${baseUrl}library/ethers-verify-domain-mismatch/`,
    'ethers-verify-evil': maliciousUrl,
    'core-sign-client': `${baseUrl}core/sign-client/`
  }

  return urlsByFlavor[flavor] || `${baseUrl}library/${library}-${flavor}/`
}

export class ModalPage {
  private readonly baseURL = BASE_URL

  private readonly connectButton: Locator
  private readonly url: string
  private emailAddress = ''
  public readonly page: Page
  public readonly library: string
  public readonly flavor: ModalFlavor

  constructor(page: Page, library: string, flavor: ModalFlavor) {
    this.page = page
    this.library = library
    this.flavor = flavor
    this.connectButton = this.page.getByTestId('connect-button').first()

    if (library === 'multichain-ethers-solana') {
      this.url = `${this.baseURL}library/multichain-ethers-solana/`
    } else if (library === 'default-account-types-sa' || library === 'default-account-types-eoa') {
      this.url = `${this.baseURL}flag/${library}/`
    } else {
      this.url = getUrlByFlavor(this.baseURL, library, flavor)
    }

    this.page.on('console', async msg => {
      const args = msg.args()
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < args.length; i++) {
        if (msg.type() === 'error' || msg.type() === 'warning') {
          try {
            const val = await args[i]?.jsonValue()
            console.log(`[console.${msg.type()}]`, val)
          } catch (err) {
            console.log(`[console.${msg.type()}] Could not serialize arg`, i, msg.text())
          }
        }
      }
    })
  }

  async load() {
    if (this.flavor === 'wagmi-verify-evil') {
      await routeInterceptUrl(this.page, maliciousUrl, this.baseURL, '/library/wagmi-verify-evil/')
    }
    if (this.flavor === 'ethers-verify-evil') {
      await routeInterceptUrl(this.page, maliciousUrl, this.baseURL, '/library/ethers-verify-evil/')
    }

    await this.page.goto(this.url)

    // Wait for w3m-modal to be injected
    await this.page.waitForSelector('w3m-modal', { state: 'visible', timeout: 5_000 })
  }

  assertDefined<T>(value: T | undefined | null): T {
    expect(value).toBeDefined()

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return value!
  }

  async getConnectUri(timingRecords?: TimingRecords): Promise<string> {
    await this.connectButton.click()
    await this.clickWalletConnect()
    const qrLoadInitiatedTime = new Date()

    // Using getByTestId() doesn't work on my machine, I'm guessing because this element is inside of a <slot>
    const qrCode = this.page.locator('wui-qr-code')
    await expect(qrCode).toBeVisible()

    const uri = this.assertDefined(await qrCode.getAttribute('uri'))
    const qrLoadedTime = new Date()
    if (timingRecords) {
      timingRecords.push({
        item: 'qrLoad',
        timeMs: qrLoadedTime.getTime() - qrLoadInitiatedTime.getTime()
      })
    }

    return uri
  }

  async getConnectUriFromQRModal(timingRecords?: TimingRecords): Promise<string> {
    const qrLoadInitiatedTime = new Date()

    const qrCode = this.page.locator('wui-qr-code')
    await expect(qrCode).toBeVisible()

    const uri = this.assertDefined(await qrCode.getAttribute('uri'))
    const qrLoadedTime = new Date()
    if (timingRecords) {
      timingRecords.push({
        item: 'qrLoad',
        timeMs: qrLoadedTime.getTime() - qrLoadInitiatedTime.getTime()
      })
    }

    return uri
  }

  async getImmidiateConnectUri(
    timingRecords?: TimingRecords,
    clickConnectButton = true
  ): Promise<string> {
    if (clickConnectButton) {
      await this.connectButton.click()
    }
    const qrLoadInitiatedTime = new Date()

    // Using getByTestId() doesn't work on my machine, I'm guessing because this element is inside of a <slot>
    const qrCode = this.page.locator('wui-qr-code')
    await expect(qrCode).toBeVisible()

    const uri = this.assertDefined(await qrCode.getAttribute('uri'))
    const qrLoadedTime = new Date()
    if (timingRecords) {
      timingRecords.push({
        item: 'qrLoad',
        timeMs: qrLoadedTime.getTime() - qrLoadInitiatedTime.getTime()
      })
    }

    return uri
  }

  async qrCodeFlow(
    page: ModalPage,
    walletPage: WalletPage,
    qrCodeFlowType?: 'immediate-connect' | 'immediate'
  ): Promise<void> {
    // eslint-disable-next-line init-declarations
    let uri: string
    if (!walletPage.isPageLoaded) {
      await walletPage.load()
    }
    if (qrCodeFlowType === 'immediate-connect' || qrCodeFlowType === 'immediate') {
      uri = await page.getImmidiateConnectUri(undefined, qrCodeFlowType === 'immediate-connect')
    } else {
      uri = await page.getConnectUri()
    }
    await walletPage.connectWithUri(uri)

    await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
    const walletValidator = new WalletValidator(walletPage.page)
    await walletValidator.expectConnected()
  }

  async emailFlow({
    emailAddress,
    context,
    mailsacApiKey,
    clickConnectButton = true,
    timingRecords
  }: {
    emailAddress: string
    context: BrowserContext
    mailsacApiKey: string
    clickConnectButton?: boolean
    timingRecords?: TimingRecords
  }): Promise<void> {
    this.emailAddress = emailAddress

    const email = new Email(mailsacApiKey)

    await email.deleteAllMessages(emailAddress)

    const loginWithEmail = new Date()
    await this.loginWithEmail(emailAddress, undefined, clickConnectButton)
    if (timingRecords) {
      timingRecords.push({
        item: 'loginWithEmail',
        timeMs: new Date().getTime() - loginWithEmail.getTime()
      })
    }

    const getLatestMessageId1 = new Date()
    const firstMessageId = await email.getLatestMessageId(emailAddress)
    if (timingRecords) {
      timingRecords.push({
        item: 'getLatestMessageId1',
        timeMs: new Date().getTime() - getLatestMessageId1.getTime()
      })
    }
    if (!firstMessageId) {
      throw new Error('No messageId found')
    }

    const getEmailBody1 = new Date()
    const firstEmailBody = await email.getEmailBody(emailAddress, firstMessageId)
    if (timingRecords) {
      timingRecords.push({
        item: 'getEmailBody1',
        timeMs: new Date().getTime() - getEmailBody1.getTime()
      })
    }

    let otp = ''
    if (email.isApproveEmail(firstEmailBody)) {
      const url = email.getApproveUrlFromBody(firstEmailBody)

      const deleteAllMessages = new Date()
      await email.deleteAllMessages(emailAddress)
      if (timingRecords) {
        timingRecords.push({
          item: 'deleteAllMessages',
          timeMs: new Date().getTime() - deleteAllMessages.getTime()
        })
      }

      const loadDeviceRegistrationPage = new Date()
      const drp = new DeviceRegistrationPage(await context.newPage(), url)
      drp.load()
      await drp.approveDevice()
      await drp.close()
      if (timingRecords) {
        timingRecords.push({
          item: 'loadDeviceRegistrationPage',
          timeMs: new Date().getTime() - loadDeviceRegistrationPage.getTime()
        })
      }

      const getLatestMessageId2 = new Date()
      const secondMessageId = await email.getLatestMessageId(emailAddress)
      if (!secondMessageId) {
        throw new Error('No messageId found')
      }
      if (timingRecords) {
        timingRecords.push({
          item: 'getLatestMessageId2',
          timeMs: new Date().getTime() - getLatestMessageId2.getTime()
        })
      }

      const getEmailBody2 = new Date()
      const secondEmailBody = await email.getEmailBody(emailAddress, secondMessageId)
      if (timingRecords) {
        timingRecords.push({
          item: 'getEmailBody2',
          timeMs: new Date().getTime() - getEmailBody2.getTime()
        })
      }
      if (email.isApproveEmail(secondEmailBody)) {
        throw new Error('Unexpected approve email after already approved')
      }
      otp = email.getOtpCodeFromBody(secondEmailBody)
    } else {
      otp = email.getOtpCodeFromBody(firstEmailBody)
    }

    const enterOTP = new Date()
    await this.enterOTP(otp)
    if (timingRecords) {
      timingRecords.push({
        item: 'enterOTP',
        timeMs: new Date().getTime() - enterOTP.getTime()
      })
    }
  }

  async loginWithEmail(email: string, validate = true, clickConnectButton = true) {
    if (clickConnectButton) {
      // Connect Button doesn't have a proper `disabled` attribute so we need to wait for the button to change the text
      await this.page
        .getByTestId('connect-button')
        .getByRole('button', { name: 'Connect Wallet' })
        .click()
    }
    await this.page.getByTestId('wui-email-input').locator('input').focus()
    await this.page.getByTestId('wui-email-input').locator('input').fill(email)
    await this.page.getByTestId('wui-email-input').locator('input').press('Enter')
    if (validate) {
      await expect(
        this.page.getByText(email),
        `Expected current email: ${email} to be visible on the notification screen`
      ).toBeVisible({
        timeout: 20_000
      })
    }
  }

  async loginWithSocial(socialOption: 'github', socialMail: string, socialPass: string) {
    await this.page
      .getByTestId('connect-button')
      .getByRole('button', { name: 'Connect Wallet' })
      .click()

    switch (socialOption) {
      case 'github':
        await this.loginWithGitHub(socialMail, socialPass)
        break
      default:
        throw new Error(`Unknown social option: ${socialOption}`)
    }
  }

  async loginWithGitHub(socialMail: string, socialPass: string) {
    const socialPopupPromise = this.page.waitForEvent('popup')
    await this.page.getByTestId(`social-selector-github`).click()
    const socialPopup = await socialPopupPromise
    await socialPopup.waitForLoadState()
    await socialPopup.fill('#login_field.form-control.input-block.js-login-field', socialMail)
    await socialPopup.fill(
      '#password.form-control.form-control.input-block.js-password-field',
      socialPass
    )
    await socialPopup.locator('[type=submit]').click()

    if (await socialPopup.locator('h1').getByText('Reauthorization required').isVisible()) {
      await socialPopup.locator('button').getByText('Authorize WalletConnect').click()
    }

    await socialPopup.waitForEvent('close')
  }

  async enterOTP(otp: string, headerTitle = 'Confirm Email') {
    await expect(this.page.getByText(headerTitle)).toBeVisible({
      timeout: 10_000
    })
    await expect(this.page.getByText('Enter the code we sent')).toBeVisible({
      timeout: 10_000
    })

    const splitted = otp.split('')

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < splitted.length; i++) {
      const digit = splitted[i]
      if (!digit) {
        throw new Error('Invalid OTP')
      }
      const otpInput = this.page.getByTestId('wui-otp-input')
      const wrapper = otpInput.locator('wui-input-numeric').nth(i)
      await expect(wrapper, `Wrapper element for input ${i} should be visible`).toBeVisible({
        timeout: 5000
      })
      const input = wrapper.locator('input')
      await expect(input, `Input ${i} should be enabled`).toBeEnabled({
        timeout: 5000
      })
      await input.fill(digit)
    }

    await expect(this.page.getByText(headerTitle)).not.toBeVisible({
      timeout: 20_000
    })
  }

  async disconnect(clickAccountButton = true) {
    if (clickAccountButton) {
      const accountBtn = this.page.getByTestId('account-button')
      await expect(accountBtn, 'Account button should be visible').toBeVisible()
      await expect(accountBtn, 'Account button should be enabled').toBeEnabled()
      await accountBtn.click()
    }
    const disconnectBtn = this.page.getByTestId('disconnect-button')
    await expect(disconnectBtn, 'Disconnect button should be visible').toBeVisible()
    await expect(disconnectBtn, 'Disconnect button should be enabled').toBeEnabled()
    await disconnectBtn.click()
  }

  async disconnectWithHook(namespace?: string) {
    const disconnectBtn = this.page.getByTestId(
      namespace ? `${namespace}-disconnect-button` : 'disconnect-hook-button'
    )
    await expect(disconnectBtn, 'Disconnect button should be visible').toBeVisible()
    await expect(disconnectBtn, 'Disconnect button should be enabled').toBeEnabled()
    await disconnectBtn.click()
  }

  async sign(_namespace?: string) {
    const namespace = _namespace || getNamespaceByLibrary(this.library)
    const signButton = this.page
      .getByTestId(`${namespace}-test-interactions`)
      .getByTestId('sign-message-button')

    await signButton.scrollIntoViewIfNeeded()
    await signButton.click()
  }

  async signTypedData(_namespace?: string) {
    const namespace = _namespace || getNamespaceByLibrary(this.library)
    const signButton = this.page
      .getByTestId(`${namespace}-test-interactions`)
      .getByTestId('sign-typed-data-button')

    await signButton.scrollIntoViewIfNeeded()
    await signButton.click()
  }

  async signMessageAndTypedData(
    modalValidator: ModalValidator,
    network?: string,
    namespace?: string
  ) {
    await this.sign(namespace)
    await modalValidator.expectAcceptedSign()

    if (network !== 'Solana') {
      // Wait for the toast animation to complete
      await modalValidator.page.waitForTimeout(500)
      await this.signTypedData(namespace)
      await modalValidator.expectAcceptedSignTypedData()
    }
  }

  async waitForFrameWithHeader(headerText: string) {
    const signatureHeader = this.page.frameLocator('#w3m-iframe').getByText(headerText)
    await signatureHeader.waitFor({ state: 'visible', timeout: 15_000 })
  }

  async clickSignatureRequestButton(name: string) {
    const signatureHeader = this.page.getByText('Approve Transaction')
    const signatureButton = this.page
      .frameLocator('#w3m-iframe')
      .getByRole('button', { name, exact: true })
    await signatureButton.waitFor({ state: 'visible', timeout: 15_000 })
    await signatureButton.scrollIntoViewIfNeeded()
    await signatureButton.click()
    await signatureHeader.waitFor({ state: 'hidden', timeout: 15_000 })
  }

  async approveSign() {
    await this.waitForFrameWithHeader('requests a signature')
    await this.clickSignatureRequestButton('Sign')
  }

  async rejectSign() {
    await this.waitForFrameWithHeader('requests a signature')
    await this.clickSignatureRequestButton('Cancel')
  }

  async approveMultipleTransactions() {
    await this.waitForFrameWithHeader('requests multiple transactions')
    await this.clickSignatureRequestButton('Approve')
  }

  async clickProfileWalletsMoreButton() {
    await this.page.getByTestId('wui-active-profile-wallet-item-more-button').click()
  }

  async clickProfileWalletsDisconnectButton() {
    await this.page.getByTestId('wui-active-profile-wallet-item-disconnect-button').click()
  }

  async clickWalletUpgradeCard(context: BrowserContext) {
    await this.page.getByTestId('account-button').click()
    await this.page.getByTestId('wui-wallet-switch').click()
    await this.clickProfileWalletsMoreButton()
    await this.page.getByTestId('w3m-wallet-upgrade-card').click()

    const page = await doActionAndWaitForNewPage(
      this.page.getByTestId('w3m-secure-website-button').click(),
      context
    )

    return page
  }

  async clickWalletGuideGetStarted() {
    await this.page.getByTestId('w3m-wallet-guide-get-started').click()
  }

  async promptSiwe({ cancel = false }: { cancel?: boolean } = {}) {
    const testId = cancel ? 'w3m-connecting-siwe-cancel' : 'w3m-connecting-siwe-sign'
    const buttonType = cancel ? 'cancel' : 'sign'
    const siweButton = this.page.getByTestId(testId)

    await expect(siweButton, `Siwe prompt ${buttonType} button should be visible`).toBeVisible({
      timeout: 10_000
    })
    await expect(siweButton, `Siwe prompt ${buttonType} button should be enabled`).toBeEnabled()
    await siweButton.click()
  }

  async cancelSiwe() {
    await this.page.getByTestId('w3m-connecting-siwe-cancel').click()
  }

  async switchNetwork(network: string, clickAccountButton = true) {
    if (clickAccountButton) {
      await this.page.getByTestId('account-button').click()
      await this.page.getByTestId('w3m-account-select-network').click()
    }

    await this.page.getByTestId(`w3m-network-switch-${network}`).click()
    // The state is chain too fast and test runner doesn't wait the loading page. It's fastly checking the network selection button and detect that it's switched already.
    await this.page.waitForTimeout(300)
  }

  async switchActiveChain() {
    await this.page.getByText('Switch to', { exact: false }).waitFor()
    await this.page.getByTestId('w3m-switch-active-chain-button').click()
  }

  async clickWalletDeeplink() {
    await this.connectButton.click()
    await this.page.getByTestId('wallet-selector-react-wallet-v2').click()
    await this.page.getByTestId('tab-desktop').click()
  }

  async clickWalletConnect() {
    const connect = this.page.getByTestId('wallet-selector-walletconnect')
    await connect.waitFor({
      state: 'visible',
      timeout: 5000
    })
    await connect.click()
  }

  async clickWalletSwitchButton() {
    await this.page.getByTestId('wui-wallet-switch').click()
  }

  async clickAddWalletButton() {
    await this.page.getByTestId('add-connection-button').click()
  }

  async openAccount(namespace?: string) {
    expect(this.page.getByTestId('w3m-modal-card')).not.toBeVisible()
    expect(this.page.getByTestId('w3m-modal-overlay')).not.toBeVisible()
    this.page.waitForTimeout(300)
    await this.page.getByTestId(`account-button${namespace ? `-${namespace}` : ''}`).click()
  }

  async openProfileWalletsView(
    namespace?: string,
    clickButtonType: 'account' | 'connect' = 'account'
  ) {
    if (clickButtonType === 'account') {
      await this.openAccount(namespace)
    } else {
      await this.openConnectModal(namespace)
    }
    await this.clickWalletSwitchButton()
    // Wait until stable after animations
    await this.page.waitForTimeout(500)
  }

  async openConnectModal(namespace?: string) {
    await this.page.getByTestId(`connect-button${namespace ? `-${namespace}` : ''}`).click()
  }

  async openAllSocials() {
    await this.page.getByTestId('social-selector-more').click()
  }

  async openOnramp() {
    await this.page.getByTestId('w3m-account-default-onramp-button').click()
  }

  async closeModal() {
    // Wait until stable after animations
    await this.page.waitForTimeout(200)
    const closeButton = this.page.getByTestId('w3m-header-close')
    // Click the button and wait for modal to fade out
    await closeButton.click()
    await closeButton.waitFor({ state: 'hidden', timeout: 15_000 })

    // Wait until stable after animations
    await this.page.waitForTimeout(200)
  }

  async updateEmail(mailsacApiKey: string) {
    const email = new Email(mailsacApiKey)
    const newEmailAddress = await email.getEmailAddressToUse()

    await this.page.getByTestId('account-button').click()
    await this.page.getByTestId('w3m-account-email-update').click()
    await this.page.getByTestId('wui-email-input').locator('input').focus()
    await this.page.getByTestId('wui-email-input').locator('input').fill(newEmailAddress)

    // Clear messages before putting new email
    await email.deleteAllMessages(this.emailAddress)
    await this.page.getByTestId('wui-email-input').locator('input').press('Enter')

    // Wait until the next screen appears
    await expect(this.page.getByText('Enter the code we sent')).toBeVisible({
      timeout: 20_000
    })
    const shouldConfirmEmail = await this.page.getByText('Confirm Current Email').isVisible()
    if (shouldConfirmEmail) {
      await this.updateOtpFlow(this.emailAddress, mailsacApiKey, 'Confirm Current Email')
    }

    await this.updateOtpFlow(newEmailAddress, mailsacApiKey, 'Confirm New Email')

    expect(
      this.page.getByTestId('w3m-account-email-update'),
      `Expected to go to the account screen after the update`
    ).toBeVisible()

    await expect(this.page.getByText(newEmailAddress)).toBeVisible()
  }

  async updateOtpFlow(emailAddress: string, mailsacApiKey: string, headerTitle: string) {
    const email = new Email(mailsacApiKey)

    const messageId = await email.getLatestMessageId(emailAddress)

    if (!messageId) {
      throw new Error('No messageId found')
    }
    const emailBody = await email.getEmailBody(emailAddress, messageId)
    const otp = email.getOtpCodeFromBody(emailBody)

    await this.enterOTP(otp, headerTitle)
  }

  async switchNetworkWithNetworkButton(networkName: string) {
    const networkButton = this.page.getByTestId('wui-network-button')
    await networkButton.click()

    const networkToSwitchButton = this.page.getByTestId(`w3m-network-switch-${networkName}`)
    await networkToSwitchButton.click()
  }

  async openAllWallets() {
    const allWallets = this.page.getByTestId('all-wallets')
    await expect(allWallets, 'All wallets should be visible').toBeVisible()
    await allWallets.click()
  }

  async clickAllWalletsListSearchItem(id: string) {
    const allWalletsListSearchItem = this.page.getByTestId(`wallet-search-item-${id}`)
    await expect(allWalletsListSearchItem).toBeVisible()
    await allWalletsListSearchItem.click()
  }

  async clickCertifiedToggle() {
    const certifiedSwitch = this.page.getByTestId('wui-certified-switch')
    await expect(certifiedSwitch).toBeVisible()
    await certifiedSwitch.click()
  }

  async clickTabWebApp() {
    const tabWebApp = this.page.getByTestId('tab-webapp')
    await expect(tabWebApp).toBeVisible()
    await tabWebApp.click()
  }

  async clickTab(name: string) {
    const tab = this.page.getByTestId(`tab-${name}`)
    await expect(tab).toBeVisible()
    await tab.click()
  }

  async getExtensionWallet() {
    // eslint-disable-next-line init-declarations
    let walletSelector: Locator

    const walletSelectorRDNS = this.page.getByTestId(`wallet-selector-${EXTENSION_RDNS}`)
    const walletSelectorName = this.page.getByTestId(`wallet-selector-${EXTENSION_NAME}`)

    try {
      await walletSelectorRDNS.waitFor({ state: 'visible', timeout: 2_000 })
      walletSelector = walletSelectorRDNS
    } catch {
      try {
        await walletSelectorName.waitFor({ state: 'visible', timeout: 2_000 })
        walletSelector = walletSelectorName
      } catch {
        throw new Error('No wallet selector found')
      }
    }

    return walletSelector
  }

  async getActiveProfileWalletItemAddress() {
    const activeProfileWalletItem = this.page.getByTestId('wui-active-profile-wallet-item')
    const address = await activeProfileWalletItem.getAttribute('address')

    return address as string
  }

  async getConnectedWalletType() {
    const walletType = this.page.getByTestId('w3m-wallet-type')
    const text = await walletType.textContent()

    return text?.trim()
  }

  async clickWalletButton(id: string) {
    await this.page.getByTestId(`wallet-button-${id}`).click()
  }

  async clickHookDisconnectButton() {
    const disconnectHookButton = this.page.getByTestId('disconnect-hook-button')
    await expect(disconnectHookButton).toBeVisible()
    await disconnectHookButton.click()
  }

  async clickCopyLink() {
    const copyLink = this.page.getByTestId('wui-link-copy')
    await expect(copyLink).toBeVisible()

    let hasCopied = false

    while (!hasCopied) {
      await copyLink.click()
      await this.page.waitForTimeout(500)

      const snackbarMessage = this.page.getByTestId('wui-snackbar-message')
      const snackbarMessageText = await snackbarMessage.textContent()

      if (snackbarMessageText && snackbarMessageText.startsWith('Link copied')) {
        hasCopied = true
      }
    }

    return this.page.evaluate(() => navigator.clipboard.readText())
  }

  async clickOpenWebApp() {
    let url = ''

    const openButton = this.page.getByTestId('w3m-connecting-widget-secondary-button')
    await expect(openButton).toBeVisible()
    await expect(openButton).toHaveText('Open')

    while (!url) {
      await openButton.click()
      await this.page.waitForTimeout(500)

      const pages = this.page.context().pages()

      // Check if more than 1 tab is open
      if (pages.length > 1) {
        const lastTab = pages[pages.length - 1]

        if (lastTab) {
          url = lastTab.url()
          break
        }
      }
    }

    return url
  }

  async search(value: string) {
    const searchInput = this.page.getByTestId('wui-input-text')
    await expect(searchInput, 'Search input should be visible').toBeVisible()
    await searchInput.fill(value)
  }

  async openModal() {
    await this.page.getByTestId('account-button').click()
    const modal = this.page.getByTestId('w3m-modal-card')
    await expect(modal).toBeVisible()
  }

  async openNetworks() {
    await this.page.getByTestId('w3m-account-select-network').click()
    await expect(this.page.getByText('Choose Network')).toBeVisible()
  }

  async openProfileView() {
    const profileButton = this.page.getByTestId('wui-profile-button')
    await expect(profileButton).toBeVisible()
    await profileButton.click()
    await profileButton.waitFor({ state: 'hidden', timeout: 15_000 })
  }

  async getWalletFeaturesButton(feature: WalletFeature) {
    const walletFeatureButton = this.page.getByTestId(`wallet-features-${feature}-button`)
    await expect(walletFeatureButton).toBeVisible()

    return walletFeatureButton
  }

  async sendCalls() {
    const sendCallsButton = this.page.getByTestId('send-calls-button')
    await sendCallsButton.isVisible()
    await sendCallsButton.scrollIntoViewIfNeeded()
    await sendCallsButton.click()
  }
  async getCallsStatus(batchCallId: string) {
    const sendCallsInput = this.page.getByTestId('get-calls-id-input')
    const sendCallsButton = this.page.getByTestId('get-calls-status-button')
    await sendCallsButton.scrollIntoViewIfNeeded()

    await sendCallsInput.fill(batchCallId)
    await sendCallsButton.click()
  }

  async switchAccount(idx = 0) {
    const firstActiveConnection = this.page.getByTestId('active-connection')
    const firstActiveConnectionButton = firstActiveConnection
      .nth(idx)
      .getByTestId('wui-inactive-profile-wallet-item-button')
    await expect(firstActiveConnectionButton).toBeVisible()
    await firstActiveConnectionButton.click()
  }

  async switchAccountByAddress(address: string) {
    const activeConnections = await this.getActiveConnections()

    let hasSwitched = false

    await Promise.all(
      activeConnections.map(async connection => {
        const connectionAddress = await connection.getAttribute('address')

        if (connectionAddress && connectionAddress.toLowerCase() === address.toLowerCase()) {
          await connection.getByTestId('wui-inactive-profile-wallet-item-button').click()
          hasSwitched = true
        }
      })
    )

    if (!hasSwitched) {
      throw new Error(`Active connection with address "${address}" not found`)
    }
  }

  async getAddress(namespace?: string): Promise<`0x${string}`> {
    const address = await this.page
      .getByTestId(`w3m-address${namespace ? `-${namespace}` : ''}`)
      .textContent()
    expect(address, 'Address should be present').toBeTruthy()

    return address as `0x${string}`
  }

  async getActiveConnectionsAddresses() {
    const activeConnections = await this.getActiveConnections()

    const activeConnectionsAddresses = await Promise.all(
      activeConnections.map(async connection => connection.getAttribute('address'))
    )

    return activeConnectionsAddresses.filter(Boolean) as string[]
  }

  // Returns all connected addresses excluding the currently active account
  async getActiveConnections() {
    const locator = this.page.getByTestId('active-connection')
    const count = await locator.count()

    return Array.from({ length: count }).map((_, i) => locator.nth(i))
  }

  async getChainId(): Promise<number> {
    const chainId = await this.page.getByTestId('w3m-chain-id').textContent()
    expect(chainId, 'Chain ID should be present').toBeTruthy()

    return Number(chainId)
  }

  async getSignature(): Promise<`0x${string}`> {
    const signature = await this.page.getByTestId('w3m-signature').textContent()
    expect(signature, 'Signature should be present').toBeTruthy()

    return signature as `0x${string}`
  }

  async switchNetworkWithHook() {
    await this.page.getByTestId('switch-network-hook-button').click()
  }

  async abortLoginWithFarcaster() {
    await this.page
      .getByTestId('connect-button')
      .getByRole('button', { name: 'Connect Wallet' })
      .click()
    await this.page.getByTestId('social-selector-farcaster').click()
    await this.page.locator('wui-qr-code').waitFor({ state: 'visible' })
    await this.page.getByTestId('header-back').click()
    await this.page.waitForTimeout(1000)
    await this.closeModal()
  }

  async connectToExtension() {
    await this.connectButton.click()
    const walletSelector = await this.getExtensionWallet()
    await walletSelector.click()
  }

  async connectToExtensionMultichain(
    chainNamespace: 'eip155' | 'solana' | 'bitcoin',
    modalOpen?: boolean,
    isAnotherNamespaceConnected?: boolean
  ) {
    const isFiltered = modalOpen && isAnotherNamespaceConnected

    if (!modalOpen) {
      await this.connectButton.click()
    }
    const walletSelector = await this.getExtensionWallet()
    await walletSelector.click()
    if (!isFiltered) {
      const chainSelector = this.page.getByTestId(`wui-list-chain-${chainNamespace}`)
      await chainSelector.click()
    }
  }
}
