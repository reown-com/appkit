import { Platform } from '@web3modal/core'
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
    const tabs = this.platforms.map(platform => {
      if (platform === 'injected') {
        return { label: 'Extension', icon: 'extension', platform: 'injected' } as const
      } else if (platform === 'mobile') {
        return { label: 'Mobile', icon: 'mobile', platform: 'mobile' } as const
      } else if (platform === 'qrcode') {
        return { label: 'Mobile', icon: 'mobile', platform: 'qrcode' } as const
      } else if (platform === 'web') {
        return { label: 'Webapp', icon: 'browser', platform: 'web' } as const
      } else if (platform === 'desktop') {
        return { label: 'Desktop', icon: 'desktop', platform: 'desktop' } as const
      }

      return { label: 'Extension', icon: 'extension', platform: 'unsupported' } as const
    })

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
