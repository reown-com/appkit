import {
  ConnectionController,
  CoreHelperUtil,
  ExplorerApiController,
  RouterController,
  SnackController
} from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import styles from './styles'

@customElement('w3m-connecting-wc-qrcode')
export class W3mConnectingWcQrcode extends LitElement {
  public static styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  private timeout?: ReturnType<typeof setTimeout> = undefined

  private readonly listing = RouterController.state.data?.listing

  private readonly images = ExplorerApiController.state.images

  // -- State & Properties -------------------------------- //
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
    this.isReady()

    return html`
      <wui-flex .padding=${['s', 'xl', 'xl', 'xl'] as const} flexDirection="column" gap="s">
        <wui-flex justifyContent="space-between" alignItems="center">
          <wui-text variant="paragraph-500" color="fg-100">
            Scan this QR Code with your phone
          </wui-text>
          <wui-icon-link size="md" icon="copy" @click=${this.onCopyUri}></wui-icon-link>
        </wui-flex>

        <wui-shimmer borderRadius="l" width="100%"> ${this.qrCodeTenmplate()} </wui-shimmer>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private isReady() {
    if (!this.ready && this.uri) {
      this.timeout = setTimeout(() => (this.ready = true), 250)
    }
  }

  private qrCodeTenmplate() {
    if (!this.uri || !this.ready) {
      return null
    }
    const size = this.getBoundingClientRect().width - 40
    const imageSrc = this.listing ? this.images[this.listing.image_id] : undefined
    const alt = this.listing ? this.listing.name : undefined

    return html`<wui-qr-code
      size=${size}
      theme="dark"
      uri=${this.uri}
      imageSrc=${ifDefined(imageSrc)}
      alt=${ifDefined(alt)}
    ></wui-qr-code>`
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
    'w3m-connecting-wc-qrcode': W3mConnectingWcQrcode
  }
}
