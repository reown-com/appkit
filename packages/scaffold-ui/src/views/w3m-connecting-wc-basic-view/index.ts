import { ApiController, CoreHelperUtil, OptionsController, StorageUtil } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

@customElement('w3m-connecting-wc-basic-view')
export class W3mConnectingWcBasicView extends LitElement {
  @state() private isMobile = CoreHelperUtil.isMobile()

  // -- Render -------------------------------------------- //
  public override render() {
    if (this.isMobile) {
      const { featured, recommended } = ApiController.state
      const { customWallets } = OptionsController.state
      const recent = StorageUtil.getRecentWallets()

      const showConnectors =
        featured.length || recommended.length || customWallets?.length || recent.length

      return html`<wui-flex
        flexDirection="column"
        gap="xs"
        .margin=${['3xs', 's', 's', 's'] as const}
      >
        ${showConnectors ? html`<w3m-connector-list></w3m-connector-list>` : null}
        <w3m-all-wallets-widget></w3m-all-wallets-widget>
      </wui-flex>`
    }

    return html`<wui-flex flexDirection="column" .padding=${['0', '0', 'l', '0'] as const}>
      <w3m-connecting-wc-view></w3m-connecting-wc-view>
      <wui-flex flexDirection="column" .padding=${['0', 'm', '0', 'm'] as const}>
        <w3m-all-wallets-widget></w3m-all-wallets-widget> </wui-flex
    ></wui-flex>`
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-basic-view': W3mConnectingWcBasicView
  }
}
