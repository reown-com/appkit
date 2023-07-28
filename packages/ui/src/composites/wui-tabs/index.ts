import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import styles from './styles'

@customElement('wui-tabs')
export class WuiTabs extends LitElement {
  public static styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Array }) tabs: { icon: string; label: string }[] = []

  @property({ type: Number }) public activeTab = 0

  // -- Render -------------------------------------------- //
  public render() {
    this.style.cssText = `--local-tab: ${this.activeTab};`

    return this.tabs.map((tab, index) => {
      const isActive = index === this.activeTab

      return html`
        <button>
          <wui-icon size="xs" color=${isActive ? 'fg-100' : 'fg-200'} name=${tab.icon}></wui-icon>
          <wui-text variant="small-600" color=${isActive ? 'fg-100' : 'fg-200'}>
            ${tab.label}
          </wui-text>
        </button>
      `
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-tabs': WuiTabs
  }
}
