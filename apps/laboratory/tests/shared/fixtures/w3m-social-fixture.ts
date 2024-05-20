import type { ModalFixture } from './w3m-fixture'
import { ModalPage } from '../pages/ModalPage'
import { ModalValidator } from '../validators/ModalValidator'
import { timingFixture } from './timing-fixture'

export const testMSocial = timingFixture.extend<ModalFixture>({
  library: ['wagmi', { option: true }],
  modalPage: async ({ page, library }, use) => {
    const modalPage = new ModalPage(page, library, 'email')
    await modalPage.load()

    const socialMail = process.env['SOCIAL_TEST_EMAIL']
    if (!socialMail) {
      throw new Error('SOCIAL_TEST_MAIL is not set')
    }
    const socialPass = process.env['SOCIAL_TEST_PASSWORD']
    if (!socialPass) {
      throw new Error('SOCIAL_TEST_PASSWORD is not set')
    }

    await modalPage.loginWithSocial(socialMail, socialPass)
    await use(modalPage)
  },
  modalValidator: async ({ modalPage }, use) => {
    const modalValidator = new ModalValidator(modalPage.page)
    await use(modalValidator)
  }
})
