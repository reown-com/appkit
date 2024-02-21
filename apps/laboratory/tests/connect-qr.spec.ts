import { DEFAULT_SESSION_PARAMS } from './shared/constants'
import { testM } from './shared/fixtures/w3m-fixture'
import { WalletPage } from './shared/pages/WalletPage'
import { WalletValidator } from './shared/validators/WalletValidator'

testM('it should connect with uri', async ({ modalPage, modalValidator, context }) => {
  const walletPage = new WalletPage(await context.newPage())
  await walletPage.load()
  const walletValidator = new WalletValidator(walletPage.page)

  const uri = await modalPage.getConnectUri()
  await walletPage.connectWithUri(uri)
  await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
  await modalValidator.expectConnected()
  await walletValidator.expectConnected()
  await modalPage.disconnect()
  await modalValidator.expectDisconnected()
  await walletValidator.expectDisconnected()
})
