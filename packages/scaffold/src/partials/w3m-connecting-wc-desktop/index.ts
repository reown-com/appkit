import { AssetUtil, ConnectionController, CoreHelperUtil } from '@web3modal/core'
import { html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { WcConnectingLitElement } from '../../utils/WcConnectingLitElement.js'

@customElement('w3m-connecting-wc-desktop')
export class W3mConnectingWcDesktop extends WcConnectingLitElement {
  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.wallet) {
      throw new Error('w3m-connecting-wc-desktop: No wallet provided')
    }

    this.isReady()

    return html`
      <w3m-connecting-widget
        imageSrc=${ifDefined(AssetUtil.getWalletImage(this.wallet.image_id))}
        name=${this.wallet.name}
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
      this.timeout = setTimeout(() => {
        this.ready = true
        this.onConnect()
      }, 250)
    }
  }

  private onConnect() {
    if (this.wallet?.desktop_link && this.uri) {
      try {
        this.error = false
        const { desktop_link, name } = this.wallet
        const { redirect, href } = CoreHelperUtil.formatNativeUrl(desktop_link, this.uri)
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
    'w3m-connecting-wc-desktop': W3mConnectingWcDesktop
  }
}
