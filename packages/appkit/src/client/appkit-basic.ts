import { type ChainNamespace } from '@reown/appkit-common'
import type { ChainAdapter } from '@reown/appkit-controllers'
import {
  AccountController,
  ConnectionController,
  CoreHelperUtil,
  OptionsController
} from '@reown/appkit-controllers'

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
  view?:
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
  public override async open(options: OpenOptions) {
    // Only open modal when not connected
    if (!AccountController.state.caipAddress) {
      await super.open(options)
    }
  }

  public override async close() {
    await super.close()

    if (this.options.manualWCControl) {
      ConnectionController.finalizeWcConnection()
    }
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
