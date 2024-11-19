import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-text/index.js'
import '../../components/wui-image/index.js'
import '../wui-tag/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-list-wallet')
export class WuiListWallet extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public imageSrc = ''

  @property() public name = ''

  @property() public tagLabel?: string

  @property({ type: Boolean }) public disabled = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ?disabled=${this.disabled} ontouchstart>
        <wui-image src=${this.imageSrc} alt=${this.name}></wui-image>
        <wui-text color="primary" variant="lg-regular">${this.name}</wui-text>
        <wui-tag variant="accent" size="sm">${this.tagLabel}</wui-tag>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-list-wallet': WuiListWallet
  }
}
