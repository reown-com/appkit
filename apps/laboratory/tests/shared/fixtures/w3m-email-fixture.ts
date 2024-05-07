import type { ModalFixture } from './w3m-fixture'
import { testMSiwe as siwe } from './w3m-fixture'
import { ModalPage } from '../pages/ModalPage'
import { ModalValidator } from '../validators/ModalValidator'
import { Email } from '../utils/email'
import { ModalWalletValidator } from '../validators/ModalWalletValidator'
import { timingFixture } from './timing-fixture'

export const testMEmail = timingFixture.extend<ModalFixture>({
  library: ['wagmi', { option: true }],
  modalPage: async ({ page, library, context }, use, testInfo) => {
    const modalPage = new ModalPage(page, library, 'email')
    await modalPage.load()

    const mailsacApiKey = process.env['MAILSAC_API_KEY']
    if (!mailsacApiKey) {
      throw new Error('MAILSAC_API_KEY is not set')
    }
    const email = new Email(mailsacApiKey)
    const tempEmail = email.getEmailAddressToUse(testInfo.parallelIndex)

    await modalPage.emailFlow(tempEmail, context, mailsacApiKey)
    await use(modalPage)
  },
  modalValidator: async ({ modalPage }, use) => {
    const modalValidator = new ModalValidator(modalPage.page)
    await use(modalValidator)
  }
})

export const testMEmailSiwe = siwe.extend<ModalFixture>({
  modalPage: async ({ page, library, context }, use, testInfo) => {
    const modalPage = new ModalPage(page, library, 'all')
    await modalPage.load()

    const mailsacApiKey = process.env['MAILSAC_API_KEY']
    if (!mailsacApiKey) {
      throw new Error('MAILSAC_API_KEY is not set')
    }
    const email = new Email(mailsacApiKey)
    const tempEmail = email.getEmailAddressToUse(testInfo.parallelIndex)

    await modalPage.emailFlow(tempEmail, context, mailsacApiKey)
    await modalPage.page.waitForTimeout(1000)
    await modalPage.promptSiwe()
    await modalPage.approveSign()
    await modalPage.page.waitForTimeout(1000)

    await use(modalPage)
  },
  modalValidator: async ({ modalPage }, use) => {
    const modalValidator = new ModalWalletValidator(modalPage.page)
    await use(modalValidator)
  }
})
