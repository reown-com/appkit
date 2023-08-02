import {
  ConnectionController,
  CoreHelperUtil,
  ExplorerApiController,
  RouterController,
  SnackController
} from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-connecting-wc-desktop')
export class W3mConnectingWcDesktop extends LitElement {
  // -- Members ------------------------------------------- //
  private readonly listing = RouterController.state.data?.listing

  private readonly images = ExplorerApiController.state.images

  private unsubscribe: (() => void)[] = []

  private timeout?: ReturnType<typeof setTimeout> = undefined

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
    clearTimeout(this.timeout)
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.listing) {
      throw new Error('w3m-connecting-wc-desktop: No listing provided')
    }

    this.isReady()

    return html`
      <w3m-connecting-widget
        imageSrc=${ifDefined(this.images[this.listing.image_id])}
        name=${this.listing.name}
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
      this.timeout = setTimeout(() => {
        this.ready = true
        this.onConnect()
      }, 250)
    }
  }

  private onConnect() {
    if (this.listing && this.uri) {
      try {
        this.error = false
        const { desktop, name } = this.listing
        const { redirect, href } = CoreHelperUtil.formatNativeUrl(desktop.native, this.uri)
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
    'w3m-connecting-wc-desktop': W3mConnectingWcDesktop
  }
}
