import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import { colorStyles, elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconSizeType, IconType, SizeType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-icon-link')
export class WuiIconLink extends LitElement {
  public static override styles = [resetStyles, elementStyles, colorStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: IconSizeType = 'md'

  @property({ type: Boolean }) public disabled = false

  @property() public icon: IconType = 'copy'

  @property() public variant: 'accent' | 'primary' | 'secondary' = 'accent'
  // -- Render -------------------------------------------- //
  public override render() {
    const iconColors = {
      accent: 'accent-primary',
      primary: 'inverse',
      secondary: 'default'
    } as const

    return html`
      <button data-variant=${this.variant} ?disabled=${this.disabled} data-size=${this.size}>
        <wui-icon color=${iconColors[this.variant]} size=${this.size} name=${this.icon}></wui-icon>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-icon-link': WuiIconLink
  }
}
