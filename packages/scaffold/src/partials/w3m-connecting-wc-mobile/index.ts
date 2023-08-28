import { AssetUtil, ConnectionController, CoreHelperUtil } from '@web3modal/core'
import { html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { WcConnectingLitElement } from '../../utils/WcConnectingLitElement.js'

@customElement('w3m-connecting-wc-mobile')
export class W3mConnectingWcMobile extends WcConnectingLitElement {
  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.wallet) {
      throw new Error('w3m-connecting-wc-mobile: No wallet provided')
    }

    this.isReady()

    return html`
      <w3m-connecting-widget
        name=${this.wallet.name}
        imageSrc=${ifDefined(AssetUtil.getWalletImage(this.wallet.image_id))}
        .error=${Boolean(this.error)}
        .onConnect=${this.onConnect.bind(this)}
        .onCopyUri=${this.onCopyUri.bind(this)}
        .autoConnect=${false}
      ></w3m-connecting-widget>
    `
  }

  // -- Private ------------------------------------------- //
  private isReady() {
    if (!this.ready && this.uri) {
      this.ready = true
      this.onConnect()
    }
  }

  private onConnect() {
    if (this.wallet?.mobile_link && this.uri) {
      try {
        this.error = false
        const { mobile_link, name } = this.wallet
        const { redirect, href } = CoreHelperUtil.formatNativeUrl(mobile_link, this.uri)
        ConnectionController.setWcLinking({ name, href })
        ConnectionController.setRecentWallet(this.wallet)
        CoreHelperUtil.openHref(redirect, '_self')
      } catch {
        this.error = true
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-mobile': W3mConnectingWcMobile
  }
}
