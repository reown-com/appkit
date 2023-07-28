import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { resetStyles } from '../../utils/ThemeUtil'
import styles from './styles'

@customElement('wui-tabs')
export class WuiTabs extends LitElement {
  public static styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Number }) public selectedTab = 0

  // -- Render -------------------------------------------- //
  public render() {
    this.style.cssText = `--local-tab: ${this.selectedTab};`

    return html`<slot></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-tabs': WuiTabs
  }
}
