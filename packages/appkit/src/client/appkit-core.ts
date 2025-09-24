import { type ChainNamespace } from '@reown/appkit-common'
import type { ChainAdapter } from '@reown/appkit-controllers'
import {
  ChainController,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  OptionsController
} from '@reown/appkit-controllers'

import type { AdapterBlueprint } from '../adapters/ChainAdapterBlueprint.js'
import {
  AppKitBaseClient,
  type OpenOptions as BaseOpenOptions,
  type Views
} from './appkit-base-client.js'

declare global {
  interface Window {
    ethereum?: Record<string, unknown>
  }
}

// -- Types --------------------------------------------------------------------
export type OpenOptions<View extends Views> = Omit<BaseOpenOptions<View>, 'namespace'>

// -- Helpers -------------------------------------------------------------------
let isInitialized = false

// -- Client --------------------------------------------------------------------
export class AppKit extends AppKitBaseClient {
  public activeAdapter?: AdapterBlueprint

  public adapters?: ChainAdapter[]

  public activeChainNamespace?: ChainNamespace

  public adapter?: ChainAdapter

  // -- Overrides --------------------------------------------------------------
  public override async open<View extends Views>(options?: OpenOptions<View>) {
    // Only open modal when not connected
    const isConnected = ConnectorController.isConnected()

    if (!isConnected) {
      await super.open(options)
    }
  }

  public override async close() {
    await super.close()

    if (this.options.manualWCControl) {
      const address = ChainController.getAccountData(this.activeChainNamespace)?.address
      ConnectionController.finalizeWcConnection(address)
    }
  }

  public override async syncIdentity(
    _request: Pick<AdapterBlueprint.ConnectResult, 'address' | 'chainId'> & {
      chainNamespace: ChainNamespace
    }
  ) {
    return Promise.resolve()
  }

  public override async syncBalance(_params: {
    address: string
    chainId: string | number | undefined
    chainNamespace: ChainNamespace
  }) {
    return Promise.resolve()
  }

  protected override async injectModalUi() {
    if (!isInitialized && CoreHelperUtil.isClient()) {
      await import('@reown/appkit-scaffold-ui/basic')
      await import('@reown/appkit-scaffold-ui/w3m-modal')

      const isElementCreated = document.querySelector('w3m-modal')
      if (!isElementCreated) {
        const modal = document.createElement('w3m-modal')
        if (!OptionsController.state.disableAppend && !OptionsController.state.enableEmbedded) {
          document.body.insertAdjacentElement('beforeend', modal)
        }
      }
      isInitialized = true
    }
  }
}
