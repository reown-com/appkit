import {
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  Platform,
  RouterController
} from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('w3m-connecting-header')
export class W3mConnectingHeader extends LitElement {
  // -- State & Properties -------------------------------- //
  @property() public platform?: Platform = undefined

  @property({ type: Array }) public platforms: Platform[] = []

  @property() public onSelectPlatfrom?: (platform: Platform) => void = undefined

  // -- Render -------------------------------------------- //
  public render() {
    const tabs = this.generateTabs()

    return html` <wui-tabs .tabs=${tabs}></wui-tabs> `
  }

  // -- Private ------------------------------------------- //
  private generateTabs() {
    const isMobile = CoreHelperUtil.isMobile() && this.platforms.includes('mobile')
    const isQrcode = !CoreHelperUtil.isMobile() && this.platforms.includes('mobile')
    const isExtension = this.platforms.includes('injected')
    const isWebapp = this.platforms.includes('web')
    const isDesktop = this.platforms.includes('desktop')

    const tabs = []

    if (isMobile) {
      tabs.push({ label: 'Mobile', icon: 'mobile' } as const)
    }

    if (isQrcode) {
      tabs.push({ label: 'Qrcode', icon: 'mobile' } as const)
    }

    if (isExtension) {
      tabs.push({ label: 'Extension', icon: 'extension' } as const)
    }

    if (isWebapp) {
      tabs.push({ label: 'Web App', icon: 'browser' } as const)
    }

    if (isDesktop) {
      tabs.push({ label: 'Desktop', icon: 'desktop' } as const)
    }

    return tabs
  }

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
    'w3m-connecting-header': W3mConnectingHeader
  }
}
