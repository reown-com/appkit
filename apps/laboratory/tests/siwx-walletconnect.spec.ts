import { WalletPage } from '@reown/appkit-testing'

import { timingFixture } from './shared/fixtures/timing-fixture'
import { ModalPage } from './shared/pages/ModalPage'
import { ModalValidator } from './shared/validators/ModalValidator'

const test = timingFixture

test('signs SIWX over a multichain WalletConnect session', async ({ context, page }) => {
  const modal = new ModalPage(page, 'wagmi', 'siwx')
  const wallet = new WalletPage(await context.newPage())
  const validator = new ModalValidator(page)

  await modal.load()
  await modal.qrCodeFlow(modal, wallet)
  await modal.promptSiwe()
  await wallet.handleRequest({ accept: true })
  await validator.expectConnected()
})
