import { AppKitWalletButton } from '../src/client.js'

// -- Components ------------------------------------------------------------
export * from '../src/scaffold-ui/appkit-wallet-button/index.js'

// -- Types ------------------------------------------------------------
export type { Wallet } from '../src/utils/TypeUtil.js'

// -- Utils & Other -----------------------------------------------------
export let walletButton: AppKitWalletButton | undefined = undefined

export function createAppKitWalletButton() {
  if (!walletButton) {
    walletButton = new AppKitWalletButton()
  }

  return walletButton
}
