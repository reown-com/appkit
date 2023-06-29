import type { TemplateResult } from 'lit'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { globalStyles } from '../../utils/ThemeUtil'
import '../../components/wui-text'
import '../../components/wui-icon'
import styles from './styles'

@customElement('wui-link')
export class WuiLink extends LitElement {
  public static styles = [globalStyles, styles]

  // -- state & properties ------------------------------------------- //
  @property({ type: Object }) public iconLeft?: TemplateResult<2> = undefined

  @property({ type: Object }) public iconRight?: TemplateResult<2> = undefined

  @property({ type: Boolean }) public disabled = false

  @property() public onClick: (event: PointerEvent) => void = () => null

  // -- render ------------------------------------------------------- //
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
        ${iconLeftHtml}
        <wui-text variant="sm-semibold" color=${textColor}>
          <slot></slot>
        </wui-text>
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
