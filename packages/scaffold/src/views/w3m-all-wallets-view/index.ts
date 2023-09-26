import { CoreHelperUtil, RouterController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

@customElement('w3m-all-wallets-view')
export class W3mAllWalletsView extends LitElement {
  // -- State & Properties -------------------------------- //
  @state() private search = ''

  // -- Render -------------------------------------------- //
  public override render() {
    const isSearch = this.search.length >= 2

    return html`
      <wui-flex padding="s" gap="s">
        <wui-search-bar @inputChange=${this.onInputChange.bind(this)}></wui-search-bar>
        ${this.qrButtonTemplate()}
      </wui-flex>
      ${isSearch
        ? html`<w3m-all-wallets-search query=${this.search}></w3m-all-wallets-search>`
        : html`<w3m-all-wallets-list></w3m-all-wallets-list>`}
    `
  }

  // -- Private ------------------------------------------- //
  private onInputChange(event: CustomEvent) {
    this.onDebouncedSearch(event.detail)
  }

  private onDebouncedSearch = CoreHelperUtil.debounce((value: string) => {
    this.search = value
  })

  private qrButtonTemplate() {
    if (CoreHelperUtil.isMobile()) {
      return html`
        <wui-icon-box
          size="lg"
          iconcolor="accent-100"
          backgroundcolor="accent-100"
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
