import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-network-image/index.js'
import styles from './styles.js'

@customElement('wui-list-network')
export class WuiListNetwork extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public imageSrc? = ''

  @property() public name = ''

  @property({ type: Boolean }) public disabled = false

  @property({ type: Boolean }) public transparent = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button data-transparent=${this.transparent} ?disabled=${this.disabled} ontouchstart>
        ${this.templateNetworkImage()}
        <wui-text variant="paragraph-500" color="inherit">${this.name}</wui-text>
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private templateNetworkImage() {
    if (this.imageSrc) {
      return html`<wui-network-image
        size="sm"
        imageSrc=${this.imageSrc}
        name=${this.name}
      ></wui-network-image>`
    }
    if (!this.imageSrc) {
      return html`<wui-network-image size="sm" name=${this.name}></wui-network-image>`
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-list-network': WuiListNetwork
  }
}
