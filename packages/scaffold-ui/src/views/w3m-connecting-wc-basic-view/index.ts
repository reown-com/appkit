import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import {
  ApiController,
  CoreHelperUtil,
  OptionsController,
  StorageUtil
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'

import '../../partials/w3m-all-wallets-widget/index.js'
import '../../partials/w3m-connector-list/index.js'
import '../w3m-connecting-wc-view/index.js'

@customElement('w3m-connecting-wc-basic-view')
export class W3mConnectingWcBasicView extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private isMobile = CoreHelperUtil.isMobile()
  @state() private remoteFeatures = OptionsController.state.remoteFeatures

  public constructor() {
    super()
    this.unsubscribe.push(
      OptionsController.subscribeKey('remoteFeatures', val => (this.remoteFeatures = val))
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (this.isMobile) {
      const { featured, recommended } = ApiController.state
      const { customWallets } = OptionsController.state
      const recent = StorageUtil.getRecentWallets()

      const showConnectors =
        featured.length || recommended.length || customWallets?.length || recent.length

      return html`<wui-flex flexDirection="column" gap="2" .margin=${['1', '3', '3', '3'] as const}>
        ${showConnectors ? html`<w3m-connector-list></w3m-connector-list>` : null}
        <w3m-all-wallets-widget></w3m-all-wallets-widget>
      </wui-flex>`
    }

    return html`<wui-flex flexDirection="column" .padding=${['0', '0', '4', '0'] as const}>
        <w3m-connecting-wc-view ?basic=${true} .displayBranding=${false}></w3m-connecting-wc-view>
        <wui-flex flexDirection="column" .padding=${['0', '3', '0', '3'] as const}>
          <w3m-all-wallets-widget></w3m-all-wallets-widget>
        </wui-flex>
      </wui-flex>
      ${this.reownBrandingTemplate()} `
  }

  private reownBrandingTemplate() {
    if (!this.remoteFeatures?.reownBranding) {
      return null
    }

    return html` <wui-flex flexDirection="column" .padding=${['1', '0', '1', '0'] as const}>
      <wui-ux-by-reown></wui-ux-by-reown>
    </wui-flex>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-basic-view': W3mConnectingWcBasicView
  }
}
