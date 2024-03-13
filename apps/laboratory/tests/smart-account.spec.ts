import { testMSAccount } from './shared/fixtures/w3m-smart-account-fixture'

testMSAccount.beforeEach(async ({ modalValidator }) => {
  await modalValidator.expectConnected()
})

testMSAccount('it should sign', async ({ modalPage, modalValidator }) => {
  await modalPage.sign()
  await modalPage.approveSign()
  await modalValidator.expectAcceptedSign()
})

testMSAccount('it should reject sign', async ({ modalPage, modalValidator }) => {
  await modalPage.sign()
  await modalPage.rejectSign()
  await modalValidator.expectRejectedSign()
})

testMSAccount('it should switch network and sign', async ({ modalPage, modalValidator }) => {
  let targetChain = 'Polygon'
  await modalPage.switchNetwork(targetChain)
  await modalValidator.expectNetwork(targetChain)
  await modalPage.page.waitForTimeout(1500)
  await modalPage.sign()
  await modalPage.approveSign()
  await modalValidator.expectAcceptedSign()

  await modalPage.page.waitForTimeout(2000)

  targetChain = 'Ethereum'
  await modalPage.switchNetwork(targetChain)
  await modalValidator.expectNetwork(targetChain)
  await modalPage.page.waitForTimeout(1500)
  await modalPage.sign()
  await modalPage.approveSign()
  await modalValidator.expectAcceptedSign()
})
