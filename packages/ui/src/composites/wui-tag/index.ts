import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-text.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import type { TagType } from '../../utils/TypesUtil.js'
import styles from './styles.js'

@customElement('wui-tag')
export class WuiTag extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public variant: TagType = 'main'

  // -- Render -------------------------------------------- //
  public override render() {
    const isMain = this.variant === 'main'
    const backgroundColor = isMain ? 'var(--wui-color-blue-015)' : 'var(--wui-overlay-010)'
    const color = isMain ? 'blue-100' : 'fg-200'
    this.style.cssText = `
    --local-bg-value: ${backgroundColor};
    --local-color-value: var(--wui-color-${color});
  `

    return html`
      <wui-text data-variant=${this.variant} variant="micro-700" color="inherit">
        <slot></slot>
      </wui-text>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-tag': WuiTag
  }
}
