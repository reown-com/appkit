import type { ChainNamespace } from '@reown/appkit-common'

import { AppKitWalletButton } from '../src/client.js'

// -- Components ------------------------------------------------------------
export * from '../src/scaffold-ui/appkit-wallet-button/index.js'

// -- Types ------------------------------------------------------------
export type { Wallet } from '../src/utils/TypeUtil.js'

// -- Utils & Other -----------------------------------------------------
let walletButton: AppKitWalletButton | undefined = undefined

export function createAppKitWalletButton({ namespace }: { namespace?: ChainNamespace } = {}) {
  if (!walletButton) {
    walletButton = new AppKitWalletButton({ namespace })
  }

  return walletButton
}
