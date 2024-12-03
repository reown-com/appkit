import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'
import '../wui-tooltip/index.js'
import '../../components/wui-icon/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconButtonSize, IconButtonVariant, IconType } from '../../utils/TypeUtil.js'

@customElement('wui-icon-button')
export class WuiIconButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() icon: IconType = 'card'

  @property() variant: IconButtonVariant = 'neutral-primary'

  @property() size: IconButtonSize = 'md'

  @property({ type: Boolean }) public disabled = false

  // -- Render -------------------------------------------- //
  public override render() {
    this.dataset['variant'] = this.variant
    this.dataset['size'] = this.size

    return html`<button
      data-variant=${this.variant}
      data-size=${this.size}
      ?disabled=${this.disabled}
    >
      <wui-icon color="inherit" name=${this.icon}></wui-icon>
    </button>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-icon-button': WuiIconButton
  }
}
