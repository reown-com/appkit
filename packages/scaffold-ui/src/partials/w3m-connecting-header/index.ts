import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import type { Platform } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-tabs'

@customElement('w3m-connecting-header')
export class W3mConnectingHeader extends LitElement {
  // -- Members ------------------------------------------- //
  private platformTabs: Platform[] = []

  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property({ type: Array }) public platforms: Platform[] = []

  @property() public onSelectPlatfrom?: (platform: Platform) => void = undefined

  disconnectCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const tabs = this.generateTabs()

    return html`
      <wui-flex justifyContent="center" .padding=${['0', '0', 'l', '0'] as const}>
        <wui-tabs .tabs=${tabs} .onTabChange=${this.onTabChange.bind(this)}></wui-tabs>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private generateTabs() {
    const tabs = this.platforms.map(platform => {
      if (platform === 'browser') {
        return { label: 'Browser', icon: 'extension', platform: 'browser' } as const
      } else if (platform === 'mobile') {
        return { label: 'Mobile', icon: 'mobile', platform: 'mobile' } as const
      } else if (platform === 'qrcode') {
        return { label: 'Mobile', icon: 'mobile', platform: 'qrcode' } as const
      } else if (platform === 'web') {
        return { label: 'Webapp', icon: 'browser', platform: 'web' } as const
      } else if (platform === 'desktop') {
        return { label: 'Desktop', icon: 'desktop', platform: 'desktop' } as const
      }

      return { label: 'Browser', icon: 'extension', platform: 'unsupported' } as const
    })

    this.platformTabs = tabs.map(({ platform }) => platform)

    return tabs
  }

  private onTabChange(index: number) {
    const tab = this.platformTabs[index]
    if (tab) {
      this.onSelectPlatfrom?.(tab)
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-header': W3mConnectingHeader
  }
}
