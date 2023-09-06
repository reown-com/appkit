import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconType } from '../../utils/TypesUtil.js'
import styles from './styles.js'

@customElement('wui-tabs')
export class WuiTabs extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Array }) public tabs: { icon: IconType; label: string }[] = []

  @property() public onTabChange: (index: number) => void = () => null

  @state() public activeTab = 0

  // -- Render -------------------------------------------- //
  public override render() {
    const isDense = this.tabs.length > 3

    this.style.cssText = `
      --local-tab: ${this.activeTab};
      --local-tab-width: 100px;
      --local-dense-tab-width: max-content;
    `

    this.dataset['type'] = isDense ? 'flex' : 'block'

    return this.tabs.map((tab, index) => {
      const isActive = index === this.activeTab

      return html`
        <button @click=${() => this.onTabClick(index)} data-active=${isActive}>
          <wui-icon size="sm" color="inherit" name=${tab.icon}></wui-icon>
          ${this.showLabel(tab, isDense, isActive)}
        </button>
      `
    })
  }

  // -- Private ------------------------------------------- //
  private onTabClick(index: number) {
    this.activeTab = index
    this.onTabChange(index)
  }

  private showLabel(tab: { icon: IconType; label: string }, isDense: boolean, isActive: boolean) {
    if (!isDense) {
      return html`<wui-text variant="small-600" color="inherit"> ${tab.label}</wui-text>`
    }
    if (isDense && isActive) {
      return html`<wui-text variant="small-600" color="inherit"> ${tab.label}</wui-text>`
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-tabs': WuiTabs
  }
}
