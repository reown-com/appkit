import { testMEmail } from './shared/fixtures/w3m-fixture'
import { Email } from './shared/utils/email'

testMEmail.beforeEach(async ({ modalPage }) => {
  const tempEmail = `web3modal@mailsac.com` // TODO: we pay per user so need to improve this
  const email = new Email(process.env['MAILSAC_API_KEY']!)
  await email.deleteAllMessages(tempEmail)
  await modalPage.loginWithEmail(tempEmail)

  const latestMessage: any = await email.getNewMessage(tempEmail)
  const messageId = latestMessage._id
  const otp = await email.getCodeFromEmail(tempEmail, messageId)

  await modalPage.enterOTP(otp)
})

testMEmail('it should sign', async ({ modalValidator }) => {
  await modalValidator.expectConnected()
  // TODO Implement sign
})
