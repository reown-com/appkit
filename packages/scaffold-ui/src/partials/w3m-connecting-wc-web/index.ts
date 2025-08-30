import { state } from 'lit/decorators.js'

import {
  ConnectionController,
  ConstantsUtil,
  CoreHelperUtil,
  EventsController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'

import { W3mConnectingWidget } from '../../utils/w3m-connecting-widget/index.js'

@customElement('w3m-connecting-wc-web')
export class W3mConnectingWcWeb extends W3mConnectingWidget {
  // Add a property to control button disabled state
  @state() protected override isLoading = true

  public constructor() {
    super()
    if (!this.wallet) {
      throw new Error('w3m-connecting-wc-web: No wallet provided')
    }
    this.onConnect = this.onConnectProxy.bind(this)
    this.secondaryBtnLabel = 'Open'
    this.secondaryLabel = ConstantsUtil.CONNECT_LABELS.MOBILE
    this.secondaryBtnIcon = 'externalLink'

    // Update isLoading state initially and whenever URI changes
    this.updateLoadingState()
    this.unsubscribe.push(
      ConnectionController.subscribeKey('wcUri', () => {
        this.updateLoadingState()
      })
    )

    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_WALLET',
      properties: {
        name: this.wallet.name,
        platform: 'web',
        displayIndex: this.wallet?.display_index
      }
    })
  }

  // Update the isLoading state based on required conditions
  private updateLoadingState() {
    this.isLoading = !this.uri
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
