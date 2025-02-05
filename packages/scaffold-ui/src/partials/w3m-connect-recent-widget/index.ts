import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { ConstantsUtil } from '@reown/appkit-common'
import type { WcWallet } from '@reown/appkit-core'
import {
  AssetUtil,
  ChainController,
  ConnectorController,
  RouterController,
  StorageUtil
} from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { MobileWalletUtil } from '@reown/appkit-utils'

@customElement('w3m-connect-recent-widget')
export class W3mConnectRecentWidget extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() public tabIdx?: number = undefined

  @state() private connectors = ConnectorController.state.connectors

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectorController.subscribeKey('connectors', val => (this.connectors = val))
    )
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const recentWallets = StorageUtil.getRecentWallets()
    const filteredRecentWallets = recentWallets.filter(
      wallet =>
        !this.connectors.some(
          connector => connector.id === wallet.id || connector.name === wallet.name
        )
    )

    if (!filteredRecentWallets.length) {
      this.style.cssText = `display: none`

      return null
    }

    return html`
      <wui-flex flexDirection="column" gap="xs">
        ${filteredRecentWallets.map(
          wallet => html`
            <wui-list-wallet
              imageSrc=${ifDefined(AssetUtil.getWalletImage(wallet))}
              name=${wallet.name ?? 'Unknown'}
              @click=${() => this.onConnectWallet(wallet)}
              tagLabel="recent"
              tagVariant="shade"
              tabIdx=${ifDefined(this.tabIdx)}
            >
            </wui-list-wallet>
          `
        )}
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  private onConnectWallet(wallet: WcWallet) {
    const connector = ConnectorController.getConnector(wallet.id, wallet.rdns)

    if (ChainController.state.activeChain === ConstantsUtil.CHAIN.SOLANA) {
      /**
       * Universal Links requires explicit user interaction to open the wallet app.
       * Previously we've been calling this with the life-cycle methods in the Solana clients by listening the SELECT_WALLET event of EventController.
       * But this breaks the UL functionality for some wallets like Phantom.
       */
      MobileWalletUtil.handleMobileWalletRedirection({
        name: connector?.name || wallet?.name || ''
      })
    }

    if (connector) {
      RouterController.push('ConnectingExternal', { connector })
    } else {
      RouterController.push('ConnectingWalletConnect', { wallet })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-recent-widget': W3mConnectRecentWidget
  }
}
