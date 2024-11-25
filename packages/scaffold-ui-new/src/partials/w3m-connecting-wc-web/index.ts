import { ConnectionController, CoreHelperUtil, EventsController } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { W3mConnectingWidget } from '../../utils/w3m-connecting-widget/index.js'

@customElement('w3m-connecting-wc-web')
export class W3mConnectingWcWeb extends W3mConnectingWidget {
  public constructor() {
    super()
    if (!this.wallet) {
      throw new Error('w3m-connecting-wc-web: No wallet provided')
    }
    this.onConnect = this.onConnectProxy.bind(this)
    this.secondaryBtnLabel = 'Open'
    this.secondaryLabel = 'Open and continue in a new browser tab'
    this.secondaryBtnIcon = 'externalLink'
    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_WALLET',
      properties: { name: this.wallet.name, platform: 'web' }
    })
  }

  // -- Private ------------------------------------------- //
  private onConnectProxy() {
    if (this.wallet?.webapp_link && this.uri) {
      try {
        this.error = false
        const { webapp_link, name } = this.wallet
        const { redirect, href } = CoreHelperUtil.formatUniversalUrl(webapp_link, this.uri)
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
    'w3m-connecting-wc-web': W3mConnectingWcWeb
  }
}
