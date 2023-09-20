import { ConnectionController, CoreHelperUtil } from '@web3modal/core'
import { customElement } from 'lit/decorators.js'
import { W3mConnectingWidget } from '../../utils/w3m-connecting-widget/index.js'

@customElement('w3m-connecting-wc-mobile')
export class W3mConnectingWcMobile extends W3mConnectingWidget {
  public constructor() {
    super()
    if (!this.wallet) {
      throw new Error('w3m-connecting-wc-mobile: No wallet provided')
    }
    this.onConnect = this.onConnectProxy.bind(this)
    this.onRender = this.onRenderProxy.bind(this)
    document.addEventListener('visibilitychange', this.onBuffering.bind(this))
  }

  public override disconnectedCallback() {
    super.disconnectedCallback()
    document.removeEventListener('visibilitychange', this.onBuffering.bind(this))
  }

  // -- Private ------------------------------------------- //
  private onRenderProxy() {
    if (!this.ready && this.uri) {
      this.ready = true
      this.onConnect?.()
    }
  }

  private onConnectProxy() {
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

  private onBuffering() {
    const isIos = CoreHelperUtil.isIos()
    if (document?.visibilityState === 'visible' && !this.error && isIos) {
      ConnectionController.setBuffering(true)
      setTimeout(() => {
        ConnectionController.setBuffering(false)
      }, 5000)
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-mobile': W3mConnectingWcMobile
  }
}
