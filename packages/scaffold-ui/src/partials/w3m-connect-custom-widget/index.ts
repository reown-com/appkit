import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { WcWallet } from '@reown/appkit-controllers'
import {
  AssetUtil,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  OptionsController,
  RouterController,
  StorageUtil
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'

@customElement('w3m-connect-custom-widget')
export class W3mConnectCustomWidget extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() public tabIdx?: number = undefined

  @state() private connectors = ConnectorController.state.connectors

  @state() private loading = false

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

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const { customWallets } = OptionsController.state

    if (!customWallets?.length) {
      this.style.cssText = `display: none`

      return null
    }

    const wallets = this.filterOutDuplicateWallets(customWallets)

    const hasWcConnection = ConnectionController.hasAnyConnection(
      CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
    )

    return html`<wui-flex flexDirection="column" gap="2">
      ${wallets.map(
        wallet => html`
          <w3m-list-wallet
            imageSrc=${ifDefined(AssetUtil.getWalletImage(wallet))}
            name=${wallet.name ?? 'Unknown'}
            @click=${() => this.onConnectWallet(wallet)}
            size="sm"
            data-testid=${`wallet-selector-${wallet.id}`}
            tabIdx=${ifDefined(this.tabIdx)}
            ?loading=${this.loading}
            ?disabled=${hasWcConnection}
            rdnsId=${wallet.rdns}
            walletRank=${wallet.order}
          >
          </w3m-list-wallet>
        `
      )}
    </wui-flex>`
  }

  // -- Private Methods ----------------------------------- //
  private filterOutDuplicateWallets(wallets: WcWallet[]) {
    const recent = StorageUtil.getRecentWallets()

    const connectorRDNSs = this.connectors
      .map(connector => connector.info?.rdns)
      .filter(Boolean) as string[]

    const recentRDNSs = recent.map(wallet => wallet.rdns).filter(Boolean) as string[]
    const allRDNSs = connectorRDNSs.concat(recentRDNSs)
    if (allRDNSs.includes('io.metamask.mobile') && CoreHelperUtil.isMobile()) {
      const index = allRDNSs.indexOf('io.metamask.mobile')
      allRDNSs[index] = 'io.metamask'
    }
    const filtered = wallets.filter(wallet => !allRDNSs.includes(String(wallet?.rdns)))

    return filtered
  }

  private onConnectWallet(wallet: WcWallet) {
    if (this.loading) {
      return
    }
    RouterController.push('ConnectingWalletConnect', {
      wallet,
      redirectView: RouterController.state.data?.redirectView
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-custom-widget': W3mConnectCustomWidget
  }
}
