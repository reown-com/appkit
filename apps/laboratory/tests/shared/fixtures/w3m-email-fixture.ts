import { test as base } from '@playwright/test'
import type { ModalFixture } from './w3m-fixture'
import { ModalPage } from '../pages/ModalPage'
import { ModalValidator } from '../validators/ModalValidator'
import { Email } from '../utils/email'

export const testMEmail = base.extend<ModalFixture>({
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
