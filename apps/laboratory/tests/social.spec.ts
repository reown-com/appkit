import { testMSocial } from './shared/fixtures/w3m-social-fixture'

const mailsacApiKey = process.env['MAILSAC_API_KEY']
if (!mailsacApiKey) {
  throw new Error('MAILSAC_API_KEY is not set')
}

testMSocial.beforeEach(async ({ modalValidator }) => {
  await modalValidator.expectConnected()
})

testMSocial('it should sign', async ({ modalPage, modalValidator }) => {
  await modalPage.sign()
  await modalPage.approveSign()
  await modalValidator.expectAcceptedSign()
})

testMSocial('it should reject sign', async ({ modalPage, modalValidator }) => {
  await modalPage.sign()
  await modalPage.rejectSign()
  await modalValidator.expectRejectedSign()
})

testMSocial('it should switch network and sign', async ({ modalPage, modalValidator }) => {
  let targetChain = 'Polygon'
  await modalPage.switchNetwork(targetChain)
  await modalValidator.expectSwitchedNetwork(targetChain)
  await modalPage.closeModal()
  await modalPage.sign()
  await modalPage.approveSign()
  await modalValidator.expectAcceptedSign()

  targetChain = 'Ethereum'
  await modalPage.switchNetwork(targetChain)
  await modalValidator.expectSwitchedNetwork(targetChain)
  await modalPage.closeModal()
  await modalPage.sign()
  await modalPage.approveSign()
  await modalValidator.expectAcceptedSign()
})

testMSocial('it should disconnect correctly', async ({ modalPage, modalValidator }) => {
  await modalPage.disconnect()
  await modalValidator.expectDisconnected()
})
