import { ConnectionController, CoreHelperUtil } from '@web3modal/core'
import { customElement } from 'lit/decorators.js'
import { W3mConnectingWidget } from '../../utils/w3m-connecting-widget/index.js'

@customElement('w3m-connecting-wc-desktop')
export class W3mConnectingWcDesktop extends W3mConnectingWidget {
  public constructor() {
    super()
    if (!this.wallet) {
      throw new Error('w3m-connecting-wc-desktop: No wallet provided')
    }
    this.onConnect = this.onConnectProxy.bind(this)
    this.onRender = this.onRenderProxy.bind(this)
  }

  // -- Private ------------------------------------------- //
  private onRenderProxy() {
    if (!this.ready && this.uri) {
      this.ready = true
      this.timeout = setTimeout(() => {
        this.onConnect?.()
      }, 250)
    }
  }

  private onConnectProxy() {
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
