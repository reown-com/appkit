import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import {
  type BadgeType,
  CoreHelperUtil,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-certified-switch'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon-box'
import '@reown/appkit-ui/wui-search-bar'

import '../../partials/w3m-all-wallets-list/index.js'
import '../../partials/w3m-all-wallets-search/index.js'

@customElement('w3m-all-wallets-view')
export class W3mAllWalletsView extends LitElement {
  // -- State & Properties -------------------------------- //
  @state() private search = ''

  @state() private badge: BadgeType | undefined = undefined

  // -- Render -------------------------------------------- //
  public override render() {
    const isSearch = this.search.length >= 2

    return html`
      <wui-flex .padding=${['1', '3', '3', '3'] as const} gap="2" alignItems="center">
        <wui-search-bar @inputChange=${this.onInputChange.bind(this)}></wui-search-bar>
        <wui-certified-switch
          ?checked=${this.badge === 'certified'}
          @certifiedSwitchChange=${this.onCertifiedSwitchChange.bind(this)}
          data-testid="wui-certified-switch"
        ></wui-certified-switch>
        ${this.qrButtonTemplate()}
      </wui-flex>
      ${isSearch || this.badge
        ? html`<w3m-all-wallets-search
            query=${this.search}
            .badge=${this.badge}
          ></w3m-all-wallets-search>`
        : html`<w3m-all-wallets-list .badge=${this.badge}></w3m-all-wallets-list>`}
    `
  }

  // -- Private ------------------------------------------- //
  private onInputChange(event: CustomEvent<string>) {
    this.onDebouncedSearch(event.detail)
  }

  private onCertifiedSwitchChange(event: CustomEvent<boolean>) {
    if (event.detail) {
      this.badge = 'certified'
      SnackController.showSvg('Only WalletConnect certified', {
        icon: 'walletConnectBrown',
        iconColor: 'accent-100'
      })
    } else {
      this.badge = undefined
    }
  }

  private onDebouncedSearch = CoreHelperUtil.debounce((value: string) => {
    this.search = value
  })

  private qrButtonTemplate() {
    if (CoreHelperUtil.isMobile()) {
      return html`
        <wui-icon-box
          size="xl"
          iconSize="xl"
          color="accent-primary"
          icon="qrCode"
          border
          borderColor="wui-accent-glass-010"
          @click=${this.onWalletConnectQr.bind(this)}
        ></wui-icon-box>
      `
    }

    return null
  }

  private onWalletConnectQr() {
    RouterController.push('ConnectingWalletConnect')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-all-wallets-view': W3mAllWalletsView
  }
}
