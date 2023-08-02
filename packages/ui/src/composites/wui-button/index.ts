import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { ButtonType, SizeType } from '../../utils/TypesUtil.js'
import styles from './styles.js'

@customElement('wui-button')
export class WuiButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: Exclude<SizeType, 'inherit' | 'lg' | 'xs' | 'xxs'> = 'md'

  @property({ type: Boolean }) public disabled = false

  @property() public variant: ButtonType = 'fill'

  // -- Render -------------------------------------------- //
  public override render() {
    const textVariant = this.size === 'md' ? 'paragraph-600' : 'small-600'
    this.style.cssText = `--local-width: ${this.variant === 'fullWidth' ? '100%' : 'auto'};`

    return html`
      <button
        data-variant=${this.variant}
        data-size=${this.size}
        ?disabled=${this.disabled}
        ontouchstart
      >
        <slot name="iconLeft"></slot>
        <wui-text variant=${textVariant} color="inherit">
          <slot></slot>
        </wui-text>
        <slot name="iconRight"></slot>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-button': WuiButton
  }
}
