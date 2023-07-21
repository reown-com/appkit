import {
  ConnectionController,
  CoreHelperUtil,
  ExplorerApiController,
  RouterController,
  SnackController
} from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

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
      throw new Error('w3m-connecting-wc-desktop: No listing provided')
    }

    this.isReady()

    const label = `Continue in ${this.listing.name}`
    const subLabel = this.error ? 'Connection declined' : 'Accept connection request in the wallet'

    return html`
      <w3m-connecting-widget
        .error=${this.error}
        .onConnect=${this.onConnect.bind(this)}
        .onCopyUri=${this.onCopyUri.bind(this)}
        imageSrc=${this.images[this.listing.image_id]}
        label=${label}
        subLabel=${subLabel}
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
