import {
  ApiController,
  ConnectionController,
  CoreHelperUtil,
  RouterController,
  SnackController
} from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-connecting-wc-mobile')
export class W3mConnectingWcMobile extends LitElement {
  // -- Members ------------------------------------------- //
  private readonly wallet = RouterController.state.data?.wallet

  private readonly images = ApiController.state.images

  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private error = false

  @state() private uri = ConnectionController.state.wcUri

  @state() private ready = false

  @property({ type: Boolean }) public multiPlatfrom = false

  public constructor() {
    super()
    this.unsubscribe.push(ConnectionController.subscribeKey('wcUri', val => (this.uri = val)))
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.wallet) {
      throw new Error('w3m-connecting-wc-mobile: No wallet provided')
    }

    this.isReady()

    return html`
      <w3m-connecting-widget
        name=${this.wallet.name}
        imageSrc=${ifDefined(this.images[this.wallet.image_id])}
        .error=${this.error}
        .onConnect=${this.onConnect.bind(this)}
        .onCopyUri=${this.onCopyUri.bind(this)}
        .autoConnect=${false}
      ></w3m-connecting-widget>
    `
  }

  // -- Private ------------------------------------------- //
  private isReady() {
    if (!this.ready && this.uri) {
      this.ready = true
      this.onConnect()
    }
  }

  private onConnect() {
    if (this.wallet?.mobile_link && this.uri) {
      try {
        this.error = false
        const { mobile_link, name } = this.wallet
        const { redirect, href } = CoreHelperUtil.formatNativeUrl(mobile_link, this.uri)
        ConnectionController.setWcLinking({ name, href })
        CoreHelperUtil.openHref(redirect, '_self')
      } catch {
        this.error = true
      }
    }
  }

  private onCopyUri() {
    try {
      if (this.uri) {
        CoreHelperUtil.copyToClopboard(this.uri)
        SnackController.showSuccess('Link copied')
      }
    } catch {
      SnackController.showError('Failed to copy')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-mobile': W3mConnectingWcMobile
  }
}
