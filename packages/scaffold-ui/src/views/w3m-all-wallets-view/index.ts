import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

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

  @state() private badge?: BadgeType

  // -- Render -------------------------------------------- //
  public override render() {
    const isSearch = this.search.length >= 2

    return html`
      <wui-flex .padding=${['0', 's', 's', 's']} gap="xs">
        <wui-search-bar @inputChange=${this.onInputChange.bind(this)}></wui-search-bar>
        <wui-certified-switch
          ?checked=${this.badge}
          @click=${this.onClick.bind(this)}
          data-testid="wui-certified-switch"
        ></wui-certified-switch>
        ${this.qrButtonTemplate()}
      </wui-flex>
      ${isSearch || this.badge
        ? html`<w3m-all-wallets-search
            query=${this.search}
            badge=${ifDefined(this.badge)}
          ></w3m-all-wallets-search>`
        : html`<w3m-all-wallets-list badge=${ifDefined(this.badge)}></w3m-all-wallets-list>`}
    `
  }

  // -- Private ------------------------------------------- //
  private onInputChange(event: CustomEvent<string>) {
    this.onDebouncedSearch(event.detail)
  }

  private onClick() {
    if (this.badge === 'certified') {
      this.badge = undefined

      return
    }

    this.badge = 'certified'
    SnackController.showSvg('Only WalletConnect certified', {
      icon: 'walletConnectBrown',
      iconColor: 'accent-100'
    })
  }

  private onDebouncedSearch = CoreHelperUtil.debounce((value: string) => {
    this.search = value
  })

  private qrButtonTemplate() {
    if (CoreHelperUtil.isMobile()) {
      return html`
        <wui-icon-box
          size="lg"
          iconSize="xl"
          iconColor="accent-100"
          backgroundColor="accent-100"
          icon="qrCode"
          background="transparent"
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
