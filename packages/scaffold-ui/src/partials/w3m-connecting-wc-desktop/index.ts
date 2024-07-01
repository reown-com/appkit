import { ConnectionController, CoreHelperUtil, EventsController } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
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
    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_WALLET',
      properties: { name: this.wallet.name, platform: 'desktop' }
    })
  }

  // -- Private ------------------------------------------- //
  private onRenderProxy() {
    if (!this.ready && this.uri) {
      this.ready = true
      this.timeout = setTimeout(() => {
        this.onConnect?.()
      }, 200)
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
        CoreHelperUtil.openHref(redirect, '_blank')
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
