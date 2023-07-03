import type { TemplateResult } from 'lit'
import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { globalStyles } from '../../utils/ThemeUtil'
import '../../components/wui-text'
import '../../components/wui-icon'
import styles from './styles'
import type { ColorType, SizeType } from '../../utils/TypesUtil'

@customElement('wui-button')
export class WuiButton extends LitElement {
  public static styles = [globalStyles, styles]

  // -- state & properties ------------------------------------------- //

  @property() public size: Exclude<SizeType, 'inherit' | 'lg' | 'xs' | 'xxs'> = 'md'

  @property({ type: Object }) public iconLeft?: TemplateResult<2> = undefined

  @property({ type: Object }) public iconRight?: TemplateResult<2> = undefined

  @property({ type: Boolean }) public disabled = false

  @property() public variant: 'accent' | 'fill' | 'shade' = 'fill'

  @state() private textColor: ColorType = 'inverse-100'

  @property() public onClick: (event: PointerEvent) => void = () => null

  // -- render ------------------------------------------------------- //
  public render() {
    switch (this.variant) {
      case 'accent':
        this.textColor = 'blue-100'
        break
      case 'shade':
        this.textColor = 'fg-200'
        break
      case 'fill':
        this.textColor = 'inverse-100'
        break
      default:
        this.textColor = 'inverse-100'
    }
    this.textColor = this.disabled ? 'inherit' : this.textColor

    const textVariant = this.size === 'md' ? 'paragraph-600' : 'small-600'

    const classes = {
      [`wui-size-${this.size}`]: true,
      'wui-variant-fill': this.variant === 'fill',
      'wui-variant-transparent': this.variant === 'shade' || this.variant === 'accent'
    }

    return html`
      <button
        class="${classMap(classes)}"
        ?disabled=${this.disabled}
        @click=${this.onClick.bind(this)}
      >
        ${this.templateIconRight()}
        <wui-text variant=${textVariant} color=${this.textColor}>
          <slot></slot>
        </wui-text>
        ${this.templateIconLeft()}
      </button>
    `
  }

  private templateIconRight() {
    if (this.iconRight) {
      return html`<wui-icon size="sm" color=${this.textColor}>${this.iconRight}</wui-icon>`
    }

    return null
  }

  private templateIconLeft() {
    if (this.iconLeft) {
      return html`<wui-icon size="sm" color=${this.textColor}>${this.iconLeft}</wui-icon>`
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-button': WuiButton
  }
}
