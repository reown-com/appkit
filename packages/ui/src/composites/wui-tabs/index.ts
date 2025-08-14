import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'

import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconType, TabSize } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-tab-item/index.js'
import styles from './styles.js'

@customElement('wui-tabs')
export class WuiTabs extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Array }) public tabs: { icon: IconType; label: string }[] = []

  @property() public onTabChange: (index: number) => void = () => null

  @property() public size: TabSize = 'md'

  @state() public activeTab = 0

  // -- Render -------------------------------------------- //
  public override render() {
    this.dataset['size'] = this.size

    return this.tabs.map((tab, index) => {
      const isActive = index === this.activeTab

      return html`
        <wui-tab-item
          @click=${() => this.onTabClick(index)}
          icon=${tab.icon}
          size=${this.size}
          label=${tab.label}
          ?active=${isActive}
          data-active=${isActive}
          data-testid="tab-${tab.label?.toLowerCase()}"
        ></wui-tab-item>
      `
    })
  }

  // -- Private ------------------------------------------- //

  private onTabClick(index: number) {
    this.activeTab = index
    this.onTabChange(index)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-tabs': WuiTabs
  }
}
