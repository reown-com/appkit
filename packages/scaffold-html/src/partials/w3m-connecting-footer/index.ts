import {
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  Platform,
  RouterController
} from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('w3m-connecting-footer')
export class W3mConnectingFooter extends LitElement {
  // -- State & Properties -------------------------------- //
  @property() public platform?: Platform = undefined

  @property({ type: Array }) public platforms: Platform[] = []

  @property() public onSelectPlatfrom?: (platform: Platform) => void = undefined

  // -- Render -------------------------------------------- //
  public render() {
    const title = this.platforms.length > 2 ? 'or try other options' : 'or try other option'

    return html`
      <wui-separator text=${title}></wui-separator>
      <wui-flex .padding=${['xxl', '0', 'xl', '0'] as const} justifyContent="center" gap="xs">
        ${this.mobileTemplate()} ${this.extensionTemplate()} ${this.webappTemplate()}
        ${this.desktopTemplate()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private mobileTemplate() {
    const isMobile =
      this.platforms.includes('mobile') && this.platform !== 'mobile' && this.platform !== 'qrcode'

    if (!isMobile) {
      return null
    }

    return html`
      <wui-button
        size="sm"
        variant="accent"
        @click=${() => this.onSelectPlatfrom?.(CoreHelperUtil.isMobile() ? 'mobile' : 'qrcode')}
      >
        <wui-icon size="sm" color="inherit" slot="iconLeft" name="mobile"></wui-icon>
        Mobile
      </wui-button>
    `
  }

  private extensionTemplate() {
    const isExtension = this.platforms.includes('injected') && this.platform !== 'injected'

    if (!isExtension) {
      return null
    }

    const { connectors } = ConnectorController.state
    const listing = RouterController.state.data?.listing
    const injectedIds = listing?.injected?.map(({ injected_id }) => injected_id) ?? []
    const isInjected = injectedIds.length
    const isInjectedConnector = connectors.find(c => c.type === 'INJECTED')
    const isInjectedInstalled = ConnectionController.checkInjectedInstalled(injectedIds)
    const isInstalled = isInjected && isInjectedInstalled && isInjectedConnector

    return html`
      <wui-button
        size="sm"
        variant="accent"
        @click=${() => this.onSelectPlatfrom?.(isInstalled ? 'injected' : 'unsupported')}
      >
        <wui-icon size="sm" color="inherit" slot="iconLeft" name="extension"></wui-icon>
        Extension
      </wui-button>
    `
  }

  private webappTemplate() {
    const isWebapp = this.platforms.includes('web') && this.platform !== 'web'

    if (!isWebapp) {
      return null
    }

    return html`
      <wui-button size="sm" variant="accent" @click=${() => this.onSelectPlatfrom?.('web')}>
        <wui-icon size="sm" color="inherit" slot="iconLeft" name="browser"></wui-icon>
        Webapp
      </wui-button>
    `
  }

  private desktopTemplate() {
    const isDesktop = this.platforms.includes('desktop') && this.platform !== 'desktop'

    if (!isDesktop || !this.onSelectPlatfrom) {
      return null
    }

    return html`
      <wui-button size="sm" variant="accent" @click=${() => this.onSelectPlatfrom?.('desktop')}>
        <wui-icon size="sm" color="inherit" slot="iconLeft" name="desktop"></wui-icon>
        Desktop
      </wui-button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-footer': W3mConnectingFooter
  }
}
