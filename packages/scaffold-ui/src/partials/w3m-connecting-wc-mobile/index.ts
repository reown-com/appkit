import { state } from 'lit/decorators.js'

import {
  ConnectionController,
  ConstantsUtil,
  CoreHelperUtil,
  EventsController,
  type OpenTarget,
  OptionsController,
  RouterController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'

import { W3mConnectingWidget } from '../../utils/w3m-connecting-widget/index.js'

@customElement('w3m-connecting-wc-mobile')
export class W3mConnectingWcMobile extends W3mConnectingWidget {
  // -- Private ------------------------------------------- //
  private btnLabelTimeout?: ReturnType<typeof setTimeout> = undefined

  // -- State --------------------------------------------- //
  @state() protected redirectDeeplink: string | undefined = undefined

  @state() protected redirectUniversalLink: string | undefined = undefined

  @state() protected target: OpenTarget | undefined = undefined

  @state() protected preferUniversalLinks =
    OptionsController.state.experimental_preferUniversalLinks

  @state() protected override isLoading = true

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    if (!this.wallet) {
      throw new Error('w3m-connecting-wc-mobile: No wallet provided')
    }

    this.secondaryBtnLabel = 'Open'
    this.secondaryLabel = ConstantsUtil.CONNECT_LABELS.MOBILE
    this.secondaryBtnIcon = 'externalLink'

    // Update isLoading state initially and whenever URI changes
    this.onHandleURI()

    this.unsubscribe.push(
      ConnectionController.subscribeKey('wcUri', () => {
        this.onHandleURI()
      })
    )

    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_WALLET',
      properties: {
        name: this.wallet.name,
        platform: 'mobile',
        displayIndex: this.wallet?.display_index,
        walletRank: this.wallet.order,
        view: RouterController.state.view
      }
    })
  }

  public override disconnectedCallback() {
    super.disconnectedCallback()
    clearTimeout(this.btnLabelTimeout)
  }

  // -- Private ------------------------------------------- //
  private onHandleURI() {
    this.isLoading = !this.uri
    if (!this.ready && this.uri) {
      this.ready = true
      this.onConnect?.()
    }
  }

  protected override onConnect = () => {
    if (this.wallet?.mobile_link && this.uri) {
      try {
        this.error = false
        const { mobile_link, link_mode, name } = this.wallet
        const { redirect, redirectUniversalLink, href } = CoreHelperUtil.formatNativeUrl(
          mobile_link,
          this.uri,
          link_mode
        )

        this.redirectDeeplink = redirect
        this.redirectUniversalLink = redirectUniversalLink
        this.target = CoreHelperUtil.isIframe() ? '_top' : '_self'

        ConnectionController.setWcLinking({ name, href })
        ConnectionController.setRecentWallet(this.wallet)

        if (this.preferUniversalLinks && this.redirectUniversalLink) {
          CoreHelperUtil.openHref(this.redirectUniversalLink, this.target)
        } else {
          CoreHelperUtil.openHref(this.redirectDeeplink, this.target)
        }
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

  protected override onTryAgain() {
    // Reset error state and attempt connection again
    ConnectionController.setWcError(false)
    this.onConnect?.()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-mobile': W3mConnectingWcMobile
  }
}
