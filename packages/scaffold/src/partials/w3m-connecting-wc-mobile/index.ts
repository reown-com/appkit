import {
  ConnectionController,
  CoreHelperUtil,
  EventsController,
  OptionsController
} from '@web3modal/core'
import { customElement } from '@web3modal/ui'
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
    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_WALLET',
      properties: { name: this.wallet.name, platform: 'mobile' }
    })
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
        const { mobile_link, link_mode, name } = this.wallet

        let formattedUrl: { redirect: string; href: string } | undefined = undefined

        if (OptionsController.state.enableUniversalLinks && link_mode) {
          formattedUrl = CoreHelperUtil.formatNativeUrl(link_mode, this.uri)
        } else {
          formattedUrl = CoreHelperUtil.formatUniversalUrl(mobile_link, this.uri)
        }

        ConnectionController.setWcLinking({ name, href: formattedUrl.href })
        ConnectionController.setRecentWallet(this.wallet)
        CoreHelperUtil.openHref(formattedUrl.redirect, '_self')
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
