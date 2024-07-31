import { MetaMask, defineWalletSetup, getExtensionId } from '@synthetixio/synpress'

const SEED_PHRASE = 'test test test test test test test test test test test junk'
const PASSWORD = 'Password123'

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  // @ts-expect-error versions mismatch with Playwright
  const extensionId = await getExtensionId(context, 'MetaMask')

  // @ts-expect-error versions mismatch with Playwright
  const metamask = new MetaMask(context, walletPage, PASSWORD, extensionId)

  await metamask.importWallet(SEED_PHRASE)
})
