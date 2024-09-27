import type { ModalFixture } from './w3m-fixture'
import { ModalPage } from '../pages/ModalPage'
import { timingFixture } from './timing-fixture'

export const testMSocial = timingFixture.extend<
  ModalFixture & {
    social: string[]
  }
>({
  library: ['wagmi', { option: true }],
  social: ['github'],
  modalPage: async ({ page, library }, use) => {
    const modalPage = new ModalPage(page, library, 'default')
    await modalPage.load()

    const socialMail = process.env['SOCIAL_TEST_EMAIL']
    if (!socialMail) {
      throw new Error('SOCIAL_TEST_MAIL is not set')
    }
    const socialPass = process.env['SOCIAL_TEST_PASSWORD']
    if (!socialPass) {
      throw new Error('SOCIAL_TEST_PASSWORD is not set')
    }

    await modalPage.loginWithSocial('github', socialMail, socialPass)
    await use(modalPage)
  }
})
