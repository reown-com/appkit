import type { SignClient } from '@walletconnect/sign-client'

import { type ChainNamespace } from '@reown/appkit-common'
import type { ChainAdapter } from '@reown/appkit-core'
import {
  AccountController,
  ConnectionController,
  CoreHelperUtil,
  OptionsController
} from '@reown/appkit-core'

import type { AdapterBlueprint } from '../adapters/ChainAdapterBlueprint.js'
import { AppKitCore, type AppKitOptionsWithSdk } from './core.js'

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

export interface AppKitBasicOptions extends AppKitOptionsWithSdk {
  signClient?: InstanceType<typeof SignClient>
}

// -- Helpers -------------------------------------------------------------------
let isInitialized = false

// -- Client --------------------------------------------------------------------
export class AppKit extends AppKitCore {
  public activeAdapter?: AdapterBlueprint

  public adapters?: ChainAdapter[]

  public activeChainNamespace?: ChainNamespace

  public adapter?: ChainAdapter

  public signClient?: InstanceType<typeof SignClient>

  constructor(options: AppKitBasicOptions) {
    super(options)
    this.signClient = options.signClient
    this.listenSignClient()
  }

  private listenSignClient() {
    if (this.signClient) {
      this.signClient.on('session_update', () => {
        ConnectionController.finalizeWcConnection()
      })
    }
  }

  // -- Overrides --------------------------------------------------------------
  public override async open(options: OpenOptions) {
    // Only open modal when not connected
    if (!AccountController.state.caipAddress) {
      await super.open(options)
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
