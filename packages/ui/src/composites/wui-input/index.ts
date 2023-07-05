import type { TemplateResult } from 'lit'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon'
import { globalStyles, resetStyles } from '../../utils/ThemeUtil'
import type { SizeType } from '../../utils/TypesUtil'
import styles from './styles'

@customElement('wui-input')
export class WuiInput extends LitElement {
  public static styles = [resetStyles, globalStyles, styles]

  // -- state & properties ------------------------------------------- //
  @property() public size: Exclude<SizeType, 'inherit' | 'lg' | 'xs' | 'xxs'> = 'md'

  @property({ type: Object }) public icon?: TemplateResult<2> = undefined

  @property({ type: Boolean }) public disabled = false

  @property() public placeholder = ''

  // -- render ------------------------------------------------------- //
  public render() {
    const sizeClass = `wui-size-${this.size}`

    return html`<input
        class=${sizeClass}
        ?disabled=${this.disabled}
        placeholder=${this.placeholder}
      />
      ${this.templateIcon()}`
  }

  private templateIcon() {
    const iconSize = this.size === 'md' ? 'lg' : 'md'
    if (this.icon) {
      return html`<wui-icon size=${iconSize} color="inherit">${this.icon}</wui-icon>`
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-input': WuiInput
  }
}
