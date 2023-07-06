import type { TemplateResult } from 'lit'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon'
import '../../components/wui-text'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import styles from './styles'

@customElement('wui-link')
export class WuiLink extends LitElement {
  public static styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Object }) public iconLeft?: TemplateResult<2> = undefined

  @property({ type: Object }) public iconRight?: TemplateResult<2> = undefined

  @property({ type: Boolean }) public disabled = false

  @property() public onClick: (event: PointerEvent) => void = () => null

  // -- Render -------------------------------------------- //
  public render() {
    const textColor = this.disabled ? 'inherit' : 'blue-100'

    const iconLeftHtml = this.iconLeft
      ? html`<wui-icon size="xs" color=${textColor}>${this.iconLeft}</wui-icon>`
      : undefined

    const iconRightHtml = this.iconRight
      ? html`<wui-icon size="xs" color=${textColor}>${this.iconRight}</wui-icon>`
      : undefined

    return html`
      <button ?disabled=${this.disabled} @click=${this.onClick.bind(this)}>
        <slot name="iconLeft"></slot>
        ${iconLeftHtml}
        <wui-text variant="small-600" color=${textColor}>
          <slot></slot>
        </wui-text>
        <slot name="iconRight"></slot>
        ${iconRightHtml}
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-link': WuiLink
  }
}
