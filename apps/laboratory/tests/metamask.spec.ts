import { testMetamask } from './shared/fixtures/w3m-metamask-fixture'

testMetamask.beforeEach(async ({ browserName, modalPage, wallet, modalValidator }) => {
  if (browserName !== 'chromium') {
    testMetamask.skip()
  }
  await modalPage.connectMetamask()
  await wallet.approve()
  await modalValidator.expectConnected()
})

testMetamask.afterEach(async ({ modalPage, modalValidator }) => {
  await modalPage.disconnect()
  await modalValidator.expectDisconnected()
})

testMetamask('it should sign', async ({ modalPage, wallet, modalValidator }) => {
  await modalPage.sign()
  await wallet.confirmTransaction()
  await modalValidator.expectAcceptedSign()
})

testMetamask('it should reject sign', async ({ modalPage, wallet, modalValidator }) => {
  await modalPage.sign()
  await wallet.reject()
  await modalValidator.expectRejectedSign()
})
