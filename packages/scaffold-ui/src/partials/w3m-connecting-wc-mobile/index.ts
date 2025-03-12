import {
  ConnectionController,
  ConstantsUtil,
  CoreHelperUtil,
  EventsController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'

import { W3mConnectingWidget } from '../../utils/w3m-connecting-widget/index.js'

@customElement('w3m-connecting-wc-mobile')
export class W3mConnectingWcMobile extends W3mConnectingWidget {
  private btnLabelTimeout?: ReturnType<typeof setTimeout> = undefined
  private labelTimeout?: ReturnType<typeof setTimeout> = undefined

  public constructor() {
    super()
    if (!this.wallet) {
      throw new Error('w3m-connecting-wc-mobile: No wallet provided')
    }
    this.secondaryBtnLabel = undefined
    this.secondaryLabel = ConstantsUtil.CONNECT_LABELS.MOBILE
    document.addEventListener('visibilitychange', this.onBuffering.bind(this))
    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_WALLET',
      properties: { name: this.wallet.name, platform: 'mobile' }
    })
    this.btnLabelTimeout = setTimeout(() => {
      this.secondaryBtnLabel = 'Try again'
      this.secondaryLabel = ConstantsUtil.CONNECT_LABELS.MOBILE
    }, ConstantsUtil.FIVE_SEC_MS)
    this.labelTimeout = setTimeout(() => {
      this.secondaryLabel = `Hold tight... it's taking longer than expected`
    }, ConstantsUtil.THREE_SEC_MS)
  }

  public override disconnectedCallback() {
    super.disconnectedCallback()
    document.removeEventListener('visibilitychange', this.onBuffering.bind(this))
    clearTimeout(this.btnLabelTimeout)
    clearTimeout(this.labelTimeout)
  }

  // -- Private ------------------------------------------- //
  protected override onRender = () => {
    if (!this.ready && this.uri) {
      this.ready = true
      this.onConnect?.()
    }
  }

  protected override onConnect = () => {
    if (this.wallet?.mobile_link && this.uri) {
      try {
        this.error = false
        const { mobile_link, name } = this.wallet
        const { redirect, href } = CoreHelperUtil.formatNativeUrl(mobile_link, this.uri)
        ConnectionController.setWcLinking({ name, href })
        ConnectionController.setRecentWallet(this.wallet)
        const target = CoreHelperUtil.isIframe() ? '_top' : '_self'
        CoreHelperUtil.openHref(redirect, target)
        clearTimeout(this.labelTimeout)
        this.secondaryLabel = ConstantsUtil.CONNECT_LABELS.MOBILE
      } catch (e) {
        EventsController.sendEvent({
          type: 'track',
          event: 'CONNECT_PROXY_ERROR',
          properties: {
            message: e instanceof Error ? e.message : 'Error parsing the deeplink',
            uri: this.uri,
            mobile_link: this.wallet.mobile_link,
            name: this.wallet.name
          }
        })
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

  protected override onTryAgain() {
    if (!this.buffering) {
      ConnectionController.setWcError(false)
      this.onConnect()
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-mobile': W3mConnectingWcMobile
  }
}
