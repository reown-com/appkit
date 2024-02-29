import { testMEmail } from './shared/fixtures/w3m-fixture'
import { DeviceRegistrationPage } from './shared/pages/DeviceRegistrationPage'
import { Email } from './shared/utils/email'
const AVAILABLE_MAILSAC_ADDRESSES = 10

const mailsacApiKey = process.env['MAILSAC_API_KEY']
if (!mailsacApiKey) {
  throw new Error('MAILSAC_API_KEY is not set')
}

testMEmail.beforeEach(async ({ modalPage, context, modalValidator }, testInfo) => {
  const workerIndex = testInfo.workerIndex
  if (workerIndex > AVAILABLE_MAILSAC_ADDRESSES - 1) {
    throw new Error('No available Mailsac address')
  }
  const tempEmail = `web3modal${workerIndex}@mailsac.com`

  const email = new Email(mailsacApiKey)
  await email.deleteAllMessages(tempEmail)
  await modalPage.loginWithEmail(tempEmail)

  let latestMessage = await email.getNewMessageFromEmail(tempEmail)
  let messageId = latestMessage._id

  if (!messageId) {
    throw new Error('No messageId found')
  }
  let emailBody = await email.getEmailBody(tempEmail, messageId)
  let otp = ''
  if (email.isApproveEmail(emailBody)) {
    const url = email.getApproveUrlFromBody(emailBody)

    await email.deleteAllMessages(tempEmail)

    const drp = new DeviceRegistrationPage(await context.newPage(), url)
    drp.load()
    await drp.approveDevice()
    await drp.close()

    latestMessage = await email.getNewMessageFromEmail(tempEmail)
    messageId = latestMessage._id
    if (!messageId) {
      throw new Error('No messageId found')
    }

    emailBody = await email.getEmailBody(tempEmail, messageId)
    if (!email.isApproveEmail(emailBody)) {
      otp = email.getOtpCodeFromBody(emailBody)
    }
  }
  if (otp.length !== 6) {
    otp = email.getOtpCodeFromBody(emailBody)
  }
  await modalPage.enterOTP(otp)
  await modalValidator.expectConnected()
})

testMEmail('it should sign', async ({ modalPage, modalValidator }) => {
  await modalPage.sign()
  await modalPage.approveSign()
  await modalValidator.expectAcceptedSign()
})
