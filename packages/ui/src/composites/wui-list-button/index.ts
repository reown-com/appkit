import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconType, TextType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-list-button')
export class WuiListButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public text = ''

  @property({ type: Boolean }) public disabled = false

  @property() public size: 'sm' | 'md' | 'lg' = 'lg'

  @property() public icon: IconType = 'copy'

  @property() public tabIdx?: number = undefined

  // -- Render -------------------------------------------- //
  public override render() {
    this.dataset['size'] = this.size

    const textVariant = `${this.size}-regular` as TextType

    return html`
      <button ?disabled=${this.disabled} tabindex=${ifDefined(this.tabIdx)}>
        <wui-icon name=${this.icon} size=${this.size} color="default"></wui-icon>
        <wui-text align="center" variant=${textVariant} color="primary">${this.text}</wui-text>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-list-button': WuiListButton
  }
}
