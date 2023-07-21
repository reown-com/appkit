import {
  ConnectionController,
  ConnectorController,
  ConstantsUtil,
  CoreHelperUtil,
  ModalController,
  RouterController,
  SnackController
} from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

// -- Types ----------------------------------------------- //
type Preference = 'mobile' | 'desktop' | 'injected' | 'web' | 'qrcode' | 'unsupported'

@customElement('w3m-connecting-wc-view')
export class W3mConnectingWcView extends LitElement {
  // -- Members ------------------------------------------- //
  private interval?: ReturnType<typeof setInterval> = undefined

  private lastRetry = Date.now()

  private listing = RouterController.state.data?.listing

  // -- State & Properties -------------------------------- //

  @state() private preference?: Preference = undefined

  public constructor() {
    super()
    this.initializeConnection()
    this.interval = setInterval(this.initializeConnection.bind(this), ConstantsUtil.TEN_SEC_MS)
  }

  public disconnectedCallback() {
    clearTimeout(this.interval)
  }

  // -- Render -------------------------------------------- //
  public render() {
    if (!this.listing) {
      return html`<w3m-connecting-wc-qrcode></w3m-connecting-wc-qrcode>`
    }

    const preference = this.preference ?? this.determinePreference()

    switch (preference) {
      case 'injected':
        return html`<w3m-connecting-wc-injected></w3m-connecting-wc-injected>`
      case 'mobile':
        return html` <w3m-connecting-wc-qrcode></w3m-connecting-wc-qrcode> `
      case 'desktop':
        return html` <w3m-connecting-wc-desktop></w3m-connecting-wc-desktop> `
      case 'web':
        return html` <w3m-connecting-wc-qrcode></w3m-connecting-wc-qrcode> `
      case 'qrcode':
        return html` <w3m-connecting-wc-qrcode></w3m-connecting-wc-qrcode> `
      default:
        return html` <w3m-connecting-wc-qrcode></w3m-connecting-wc-qrcode> `
    }
  }

  // -- Private ------------------------------------------- //
  private async initializeConnection(retry = false) {
    try {
      const { wcPairingExpiry } = ConnectionController.state
      if (retry || CoreHelperUtil.isPairingExpired(wcPairingExpiry)) {
        ConnectionController.connectWalletConnect()
        await ConnectionController.state.wcPromise
        ModalController.close()
      }
    } catch {
      if (CoreHelperUtil.isAllowedRetry(this.lastRetry)) {
        SnackController.showError('Declined')
        this.lastRetry = Date.now()
        this.initializeConnection(true)
      }
    }
  }

  private determinePreference(): Preference {
    if (!this.listing) {
      throw new Error('w3m-connecting-wc-view:determinePreference No listing')
    }

    const { connectors } = ConnectorController.state
    const { mobile, desktop, injected } = this.listing
    const injectedIds = injected?.map(({ injected_id }) => injected_id) ?? []
    const isMobile = CoreHelperUtil.isMobile()
    const isMobileWc = mobile?.native || mobile?.universal
    const isWebWc = desktop?.universal
    const isInjectedConnector = connectors.find(c => c.type === 'INJECTED')
    const isInjectedInstalled = ConnectionController.checkInjectedInstalled(injectedIds)
    const isInjectedWc = isInjectedInstalled && isInjectedConnector
    const isDesktopWc = desktop?.native

    // Mobile
    if (isMobile) {
      if (isInjectedWc) {
        return 'injected'
      } else if (isMobileWc) {
        return 'mobile'
      } else if (isWebWc) {
        return 'web'
      }

      return 'unsupported'
    }

    // Desktop
    if (isInjectedWc) {
      return 'injected'
    } else if (isDesktopWc) {
      return 'desktop'
    } else if (isWebWc) {
      return 'web'
    } else if (isMobileWc) {
      return 'qrcode'
    }

    return 'unsupported'
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-view': W3mConnectingWcView
  }
}
