import {
  ConnectionController,
  CoreHelperUtil,
  EventsController,
  RouterController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'

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
      properties: {
        name: this.wallet.name,
        platform: 'desktop',
        displayIndex: this.wallet?.display_index,
        walletRank: this.wallet.order,
        view: RouterController.state.view
      }
    })
  }

  // -- Private ------------------------------------------- //
  private onRenderProxy() {
    if (!this.ready && this.uri) {
      this.ready = true
      this.onConnect?.()
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
