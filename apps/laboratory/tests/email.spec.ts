import { testMEmail } from './shared/fixtures/w3m-fixture'
import { DeviceRegistrationPage } from './shared/pages/DeviceRegistrationPage'
import { Email } from './shared/utils/email'

testMEmail.beforeEach(async ({ modalPage, context, modalValidator }) => {
  const tempEmail = `web3modal@mailsac.com` // TODO: we pay per user so need to improve this
  const email = new Email(process.env['MAILSAC_API_KEY']!)
  await email.deleteAllMessages(tempEmail)
  await modalPage.loginWithEmail(tempEmail)

  let latestMessage: any = await email.getNewMessage(tempEmail)
  let messageId = latestMessage._id
  let otp = await email.getCodeFromEmail(tempEmail, messageId)

  if (otp.length !== 6) {
    // device registration
    const drp = new DeviceRegistrationPage(await context.newPage(), otp)
    drp.load()
    await drp.approveDevice()

    latestMessage = await email.getNewMessage(tempEmail)
    messageId = latestMessage._id
    otp = await email.getCodeFromEmail(tempEmail, messageId)
  }

  await modalPage.enterOTP(otp)
  await modalValidator.expectConnected()
})

testMEmail('it should sign', async ({ modalPage, modalValidator }) => {
  await modalPage.sign()
  await modalPage.appoveSign()
  await modalValidator.expectAcceptedSign()
})
