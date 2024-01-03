import { testMEmail } from './shared/fixtures/w3m-fixture'
import { DeviceRegistrationPage } from './shared/pages/DeviceRegistrationPage'
import { Email } from './shared/utils/email'

// Prevent collissions by using a semi-random reserved Mailsac email
const AVAILABLE_MAILSAC_ADDRESSES = 10

testMEmail.beforeEach(async ({ modalPage, context, modalValidator }) => {
  // Skip wagmi as it's not working
  if (modalPage.library === 'wagmi') {
    return
  }
  // This is prone to collissions and will be improved later
  const tempEmail = `web3modal${Math.floor(
    Math.random() * AVAILABLE_MAILSAC_ADDRESSES
  )}@mailsac.com`
  const mailsacApiKey = process.env['MAILSAC_API_KEY']
  if (!mailsacApiKey) {
    throw new Error('MAILSAC_API_KEY is not set')
  }
  const email = new Email(mailsacApiKey)
  await email.deleteAllMessages(tempEmail)
  await modalPage.loginWithEmail(tempEmail)

  let latestMessage = await email.getNewMessage(tempEmail)
  let messageId = latestMessage._id

  if (!messageId) {
    throw new Error('No messageId found')
  }

  let otp = await email.getCodeFromEmail(tempEmail, messageId)

  if (otp.length !== 6) {
    // We got a device registration link so let's register first
    const drp = new DeviceRegistrationPage(await context.newPage(), otp)
    drp.load()
    await drp.approveDevice()

    latestMessage = await email.getNewMessage(tempEmail)
    messageId = latestMessage._id
    if (!messageId) {
      throw new Error('No messageId found')
    }
    otp = await email.getCodeFromEmail(tempEmail, messageId)
  }

  await modalPage.enterOTP(otp)
  await modalValidator.expectConnected()
})

testMEmail('it should sign', async ({ modalPage, modalValidator }) => {
  testMEmail.skip(modalPage.library === 'wagmi', 'Tests are flaky on wagmi')
  await modalPage.sign()
  await modalPage.approveSign()
  await modalValidator.expectAcceptedSign()
})
