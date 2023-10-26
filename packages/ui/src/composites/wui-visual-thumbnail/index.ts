import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-image/index.js'
import '../../components/wui-icon/index.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-visual-thumbnail')
export class WuiVisualThumbnail extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public imageSrc?: string | null

  @property() public alt?: string

  @property({ type: Boolean }) public borderRadiusFull?: boolean

  // -- Render -------------------------------------------- //
  public override render() {
    this.style.cssText = `--local-border-radius: ${this.borderRadiusFull ? '1000px' : '20px'};`

    return html`${this.templateVisual()}`
  }

  // -- Private ------------------------------------------- //
  private templateVisual() {
    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc} alt=${this.alt ?? ''}></wui-image>`
    }

    return html`<wui-icon
      data-parent-size="md"
      size="inherit"
      color="inherit"
      name="walletPlaceholder"
    ></wui-icon>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-visual-thumbnail': WuiVisualThumbnail
  }
}
