import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconType, SizeType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-icon-button')
export class WuiIconButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() icon: IconType = 'card'

  @property() variant: 'accent' | 'secondary' = 'accent'

  @property() public size: Exclude<SizeType, 'xxs' | 'mdl' | 'xl' | 'xs' | 'xxl'> = 'md'

  @property({ type: Boolean }) public fullWidth = false

  @property({ type: Boolean }) public disabled = false

  // -- Render -------------------------------------------- //
  public override render() {
    const iconColors = {
      accent: 'accent-primary',
      secondary: 'inverse'
    } as const

    return html`<button
      data-variant=${this.variant}
      data-size=${this.size}
      data-full-width=${this.fullWidth}
      ?disabled=${this.disabled}
    >
      <wui-icon color=${iconColors[this.variant]} name=${this.icon}></wui-icon>
    </button>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-icon-button': WuiIconButton
  }
}
