import { testMEmail } from './shared/fixtures/w3m-email-fixture'

testMEmail.beforeEach(async ({ modalValidator }) => {
  await modalValidator.expectConnected()
})

testMEmail('it should sign', async ({ modalPage, modalValidator }) => {
  await modalPage.sign()
  await modalPage.approveSign()
  await modalValidator.expectAcceptedSign()
})
