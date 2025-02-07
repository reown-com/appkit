import { type ChainNamespace } from '@reown/appkit-common'
import type { ChainAdapter } from '@reown/appkit-core'
import { AccountController, CoreHelperUtil, OptionsController } from '@reown/appkit-core'

import type { AdapterBlueprint } from '../adapters/ChainAdapterBlueprint.js'
import { AppKitCore } from './core.js'

declare global {
  interface Window {
    ethereum?: Record<string, unknown>
  }
}

// -- Export Controllers -------------------------------------------------------
export { AccountController }

// -- Types --------------------------------------------------------------------
export interface OpenOptions {
  view:
    | 'Account'
    | 'Connect'
    | 'Networks'
    | 'ApproveTransaction'
    | 'OnRampProviders'
    | 'ConnectingWalletConnectBasic'
    | 'Swap'
    | 'WhatIsAWallet'
    | 'WhatIsANetwork'
    | 'AllWallets'
    | 'WalletSend'
  uri?: string
}

// -- Helpers -------------------------------------------------------------------
let isInitialized = false

// -- Client --------------------------------------------------------------------
export class AppKit extends AppKitCore {
  public activeAdapter?: AdapterBlueprint

  public adapters?: ChainAdapter[]

  public activeChainNamespace?: ChainNamespace

  public adapter?: ChainAdapter

  // -- Overrides --------------------------------------------------------------
  public override async open(_options: OpenOptions) {
    // Do nothing
  }

  protected override async injectModalUi() {
    if (!isInitialized && CoreHelperUtil.isClient()) {
      await import('@reown/appkit-scaffold-ui/basic')
      await import('@reown/appkit-scaffold-ui/w3m-modal')
      const modal = document.createElement('w3m-modal')
      if (!OptionsController.state.disableAppend && !OptionsController.state.enableEmbedded) {
        document.body.insertAdjacentElement('beforeend', modal)
      }
      isInitialized = true
    }
  }
}
