import type { TemplateResult } from 'lit'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import '../../components/wui-icon'
import '../../components/wui-text'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import type { ColorType, SizeType } from '../../utils/TypesUtil'
import styles from './styles'

@customElement('wui-button')
export class WuiButton extends LitElement {
  public static styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: Exclude<SizeType, 'inherit' | 'lg' | 'xs' | 'xxs'> = 'md'

  @property({ type: Object }) public iconLeft?: TemplateResult<2> = undefined

  @property({ type: Object }) public iconRight?: TemplateResult<2> = undefined

  @property({ type: Boolean }) public disabled = false

  @property() public variant: 'accent' | 'fill' | 'shade' = 'fill'

  private textColor: ColorType = 'inverse-100'

  @property() public onClick: (event: PointerEvent) => void = () => null

  // -- Render -------------------------------------------- //
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
        ${this.templateIconLeft()}
        <wui-text variant=${textVariant} color=${this.textColor}>
          <slot></slot>
        </wui-text>
        ${this.templateIconRight()}
      </button>
    `
  }

  // -- Private ------------------------------------------- //
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
