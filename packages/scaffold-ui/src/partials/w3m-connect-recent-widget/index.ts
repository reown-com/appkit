import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { ChainNamespace } from '@reown/appkit-common'
import type { WcWallet } from '@reown/appkit-controllers'
import {
  AssetUtil,
  ChainController,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  StorageUtil
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-list-wallet'

import { WalletUtil } from '../../utils/WalletUtil.js'

@customElement('w3m-connect-recent-widget')
export class W3mConnectRecentWidget extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() public tabIdx?: number = undefined

  @state() private connectors = ConnectorController.state.connectors

  @state() private loading = false

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectorController.subscribeKey('connectors', val => (this.connectors = val))
    )
    if (CoreHelperUtil.isTelegram() && CoreHelperUtil.isIos()) {
      this.loading = !ConnectionController.state.wcUri
      this.unsubscribe.push(
        ConnectionController.subscribeKey('wcUri', val => (this.loading = !val))
      )
    }
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const recentWallets = StorageUtil.getRecentWallets()

    const filteredRecentWallets = recentWallets
      .filter(wallet => !WalletUtil.isExcluded(wallet))
      .filter(wallet => !this.hasWalletConnector(wallet))
      .filter(wallet => this.isWalletCompatibleWithCurrentChain(wallet))

    if (!filteredRecentWallets.length) {
      this.style.cssText = `display: none`

      return null
    }

    const hasWcConnection = ConnectionController.hasAnyConnection(
      CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
    )

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
              ?loading=${this.loading}
              ?disabled=${hasWcConnection}
            >
            </wui-list-wallet>
          `
        )}
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  private onConnectWallet(wallet: WcWallet) {
    if (this.loading) {
      return
    }

    ConnectorController.selectWalletConnector(wallet)
  }

  private hasWalletConnector(wallet: WcWallet) {
    return this.connectors.some(
      connector => connector.id === wallet.id || connector.name === wallet.name
    )
  }

  private isWalletCompatibleWithCurrentChain(wallet: WcWallet) {
    const currentNamespace = ChainController.state.activeChain

    if (currentNamespace && wallet.chains) {
      return wallet.chains.some(c => {
        const chainNamespace = c.split(':')[0] as ChainNamespace

        return currentNamespace === chainNamespace
      })
    }

    return true
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-recent-widget': W3mConnectRecentWidget
  }
}
