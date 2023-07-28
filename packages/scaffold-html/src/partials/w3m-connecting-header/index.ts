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
  // -- Members ------------------------------------------- //
  private platformTabs: Platform[] = []

  // -- State & Properties -------------------------------- //
  @property({ type: Array }) public platforms: Platform[] = []

  @property() public onSelectPlatfrom?: (platform: Platform) => void = undefined

  // -- Render -------------------------------------------- //
  public render() {
    const tabs = this.generateTabs()

    return html`
      <wui-flex justifyContent="center" .padding=${['l', '0', '0', '0'] as const}>
        <wui-tabs .tabs=${tabs} .onTabChange=${this.onTabChange.bind(this)}></wui-tabs>
      </wui-flex>
    `
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
      tabs.push({ label: 'Mobile', icon: 'mobile', platform: 'mobile' } as const)
    }

    if (isQrcode) {
      tabs.push({ label: 'Mobile', icon: 'mobile', platform: 'qrcode' } as const)
    }

    if (isExtension) {
      const { connectors } = ConnectorController.state
      const listing = RouterController.state.data?.listing
      const injectedIds = listing?.injected?.map(({ injected_id }) => injected_id) ?? []
      const isInjected = injectedIds.length
      const isInjectedConnector = connectors.find(c => c.type === 'INJECTED')
      const isInjectedInstalled = ConnectionController.checkInjectedInstalled(injectedIds)
      const isInstalled = isInjected && isInjectedInstalled && isInjectedConnector

      tabs.push({
        label: 'Extension',
        icon: 'extension',
        platform: isInstalled ? 'injected' : 'unsupported'
      } as const)
    }

    if (isWebapp) {
      tabs.push({ label: 'Web App', icon: 'browser', platform: 'web' } as const)
    }

    if (isDesktop) {
      tabs.push({ label: 'Desktop', icon: 'desktop', platform: 'desktop' } as const)
    }

    this.platformTabs = tabs.map(({ platform }) => platform)

    return tabs
  }

  private onTabChange(index: number) {
    this.onSelectPlatfrom?.(this.platformTabs[index])
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-header': W3mConnectingHeader
  }
}
