import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import type { BaseError, Platform } from '@reown/appkit-controllers'
import {
  ChainController,
  ConnectionController,
  CoreHelperUtil,
  EventsController,
  ModalController,
  OptionsController,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'

import '../../partials/w3m-connecting-header/index.js'
import '../../partials/w3m-connecting-wc-browser/index.js'
import '../../partials/w3m-connecting-wc-desktop/index.js'
import '../../partials/w3m-connecting-wc-mobile/index.js'
import '../../partials/w3m-connecting-wc-qrcode/index.js'
import '../../partials/w3m-connecting-wc-unsupported/index.js'
import '../../partials/w3m-connecting-wc-web/index.js'

@customElement('w3m-connecting-wc-view')
export class W3mConnectingWcView extends LitElement {
  // -- Members ------------------------------------------- //
  private wallet = RouterController.state.data?.wallet

  // -- State & Properties -------------------------------- //
  @state() private platform?: Platform = undefined

  @state() private platforms: Platform[] = []

  @state() private isSiwxEnabled = Boolean(OptionsController.state.siwx)

  public constructor() {
    super()
    this.determinePlatforms()
    this.initializeConnection()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      ${this.headerTemplate()}
      <div>${this.platformTemplate()}</div>
      <wui-ux-by-reown></wui-ux-by-reown>
    `
  }

  // -- Private ------------------------------------------- //
  private async initializeConnection(retry = false) {
    /*
     * If the platform is browser it means the user is using a browser wallet,
     * in this case the connection is handled in w3m-connecting-wc-browser component.
     *
     * If manual control is on, we should avoid calling connectWalletConnect since that's
     * already done by the signer from other packages like @walletconnect/ethereum-provider
     */
    if (this.platform === 'browser' || (OptionsController.state.manualWCControl && !retry)) {
      return
    }

    try {
      const { wcPairingExpiry, status } = ConnectionController.state

      if (
        retry ||
        OptionsController.state.enableEmbedded ||
        CoreHelperUtil.isPairingExpired(wcPairingExpiry) ||
        status === 'connecting'
      ) {
        await ConnectionController.connectWalletConnect()
        if (!this.isSiwxEnabled) {
          ModalController.close()
        }
      }
    } catch (error) {
      EventsController.sendEvent({
        type: 'track',
        event: 'CONNECT_ERROR',
        properties: { message: (error as BaseError)?.message ?? 'Unknown' }
      })
      ConnectionController.setWcError(true)
      SnackController.showError((error as BaseError).message ?? 'Connection error')
      ConnectionController.resetWcConnection()
      RouterController.goBack()
    }
  }

  private determinePlatforms() {
    if (!this.wallet) {
      this.platforms.push('qrcode')
      this.platform = 'qrcode'

      return
    }

    if (this.platform) {
      return
    }

    const { mobile_link, desktop_link, webapp_link, injected, rdns } = this.wallet
    const injectedIds = injected?.map(({ injected_id }) => injected_id).filter(Boolean) as string[]
    const browserIds = [...(rdns ? [rdns] : (injectedIds ?? []))]
    const isBrowser = OptionsController.state.isUniversalProvider ? false : browserIds.length
    const hasMobileWCLink = mobile_link
    const isWebWc = webapp_link
    const isBrowserInstalled = ConnectionController.checkInstalled(browserIds)
    const isBrowserWc = isBrowser && isBrowserInstalled
    const isDesktopWc = desktop_link && !CoreHelperUtil.isMobile()

    // Populate all preferences
    if (isBrowserWc && !ChainController.state.noAdapters) {
      this.platforms.push('browser')
    }
    if (hasMobileWCLink) {
      this.platforms.push(CoreHelperUtil.isMobile() ? 'mobile' : 'qrcode')
    }
    if (isWebWc) {
      this.platforms.push('web')
    }
    if (isDesktopWc) {
      this.platforms.push('desktop')
    }
    if (!isBrowserWc && isBrowser && !ChainController.state.noAdapters) {
      this.platforms.push('unsupported')
    }

    this.platform = this.platforms[0]
  }

  private platformTemplate() {
    switch (this.platform) {
      case 'browser':
        return html`<w3m-connecting-wc-browser></w3m-connecting-wc-browser>`
      case 'web':
        return html`<w3m-connecting-wc-web></w3m-connecting-wc-web>`
      case 'desktop':
        return html`
          <w3m-connecting-wc-desktop .onRetry=${() => this.initializeConnection(true)}>
          </w3m-connecting-wc-desktop>
        `
      case 'mobile':
        return html`
          <w3m-connecting-wc-mobile isMobile .onRetry=${() => this.initializeConnection(true)}>
          </w3m-connecting-wc-mobile>
        `
      case 'qrcode':
        return html`<w3m-connecting-wc-qrcode></w3m-connecting-wc-qrcode>`
      default:
        return html`<w3m-connecting-wc-unsupported></w3m-connecting-wc-unsupported>`
    }
  }

  private headerTemplate() {
    const multiPlatform = this.platforms.length > 1

    if (!multiPlatform) {
      return null
    }

    return html`
      <w3m-connecting-header
        .platforms=${this.platforms}
        .onSelectPlatfrom=${this.onSelectPlatform.bind(this)}
      >
      </w3m-connecting-header>
    `
  }

  private async onSelectPlatform(platform: Platform) {
    const container = this.shadowRoot?.querySelector('div')
    if (container) {
      await container.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 200,
        fill: 'forwards',
        easing: 'ease'
      }).finished
      this.platform = platform
      container.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 200,
        fill: 'forwards',
        easing: 'ease'
      })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-view': W3mConnectingWcView
  }
}
