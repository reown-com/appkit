import type { ModalFixture } from './w3m-fixture'
import { Email } from '../utils/email'
import { ModalWalletPage } from '../pages/ModalWalletPage'
import { ModalWalletValidator } from '../validators/ModalWalletValidator'
import type { ModalPage } from '../pages/ModalPage'
import { timingFixture } from './timing-fixture'

// Test Modal + Smart Account
export const testModalSmartAccount = timingFixture.extend<
  ModalFixture & { slowModalPage: ModalPage }
>({
  library: ['wagmi', { option: true }],
  modalPage: [
    async ({ page, library, context }, use) => {
      const modalPage = new ModalWalletPage(page, library)
      await modalPage.load()

      const mailsacApiKey = process.env['MAILSAC_API_KEY']
      if (!mailsacApiKey) {
        throw new Error('MAILSAC_API_KEY is not set')
      }
      const email = new Email(mailsacApiKey)
      const tempEmail = await email.getEmailAddressToUse()

      // Switch to supported network first so it initializes with SA
      await modalPage.switchNetworkWithNetworkButton('Sepolia')
      await modalPage.closeModal()
      await modalPage.emailFlow(tempEmail, context, mailsacApiKey)

      await use(modalPage)
    },
    { timeout: 90_000 }
  ],
  modalValidator: async ({ modalPage }, use) => {
    const modalValidator = new ModalWalletValidator(modalPage.page)
    await use(modalValidator)
  }
})
