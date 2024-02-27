import type { ModalValidator } from '../validators/ModalValidator'
import { WalletValidator } from '../validators/WalletValidator'

export async function expectConnection(
  modalValidator: ModalValidator,
  walletValidator: WalletValidator
) {
  await modalValidator.expectConnected()
  await walletValidator.expectConnected()
  await modalValidator.page.evaluate(
    `window.localStorage.setItem('WALLETCONNECT_DEEPLINK_CHOICE', '')`
  )
}
