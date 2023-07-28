import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import type { IconType } from '../../utils/TypesUtil'
import styles from './styles'

@customElement('wui-tabs')
export class WuiTabs extends LitElement {
  public static styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Array }) public tabs: { icon: IconType; label: string }[] = []

  @property() public onTabChange: (index: number) => void = () => null

  @state() public activeTab = 0

  // -- Render -------------------------------------------- //
  public render() {
    this.style.cssText = `--local-tab: ${this.activeTab};`

    return this.tabs.map((tab, index) => {
      const isActive = index === this.activeTab

      return html`
        <button @click=${() => this.onTabClick(index)}>
          <wui-icon size="xs" color=${isActive ? 'fg-100' : 'fg-200'} name=${tab.icon}></wui-icon>
          <wui-text variant="small-600" color=${isActive ? 'fg-100' : 'fg-200'}>
            ${tab.label}
          </wui-text>
        </button>
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
