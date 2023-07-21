import { ConnectionController, CoreHelperUtil, RouterController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

@customElement('w3m-connecting-wc-mobile')
export class W3mConnectingWcMobile extends LitElement {
  // -- Members ------------------------------------------- //
  private readonly listing = RouterController.state.data?.listing

  private unsubscribe: (() => void)[] = []

  private timeout?: ReturnType<typeof setTimeout> = undefined

  // -- State & Properties -------------------------------- //
  @state() private error = false

  @state() private uri = ConnectionController.state.wcUri

  public constructor() {
    super()
    this.unsubscribe.push(ConnectionController.subscribeKey('wcUri', val => (this.uri = val)))
  }

  public disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
    clearTimeout(this.timeout)
  }

  // -- Render -------------------------------------------- //
  public render() {
    if (!this.listing) {
      throw new Error('w3m-connecting-wc-mobile: No listing provided')
    }

    const label = `Continue in ${this.listing.name}`
    const subLabel = this.error ? 'Connection declined' : 'Accept connection request in the wallet'

    return html`
      <w3m-connecting-widget
        .error=${this.error}
        .onConnect=${this.onConnect.bind(this)}
        label=${label}
        subLabel=${subLabel}
      ></w3m-connecting-widget>
    `
  }

  // -- Private ------------------------------------------- //
  private onConnect() {
    if (this.listing && this.uri) {
      try {
        this.error = false
        const { mobile, name } = this.listing
        const { redirect, href } = CoreHelperUtil.formatNativeUrl(
          mobile.native ?? mobile.universal,
          this.uri
        )
        ConnectionController.setWcLinking({ name, href })
        CoreHelperUtil.openHref(redirect, '_self')
      } catch {
        this.error = true
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-mobile': W3mConnectingWcMobile
  }
}
