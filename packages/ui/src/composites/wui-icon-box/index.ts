/* eslint-disable no-nested-ternary */
import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import '../../components/wui-icon/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconColorType, IconType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

// -- Constants ------------------------------------------ //
@customElement('wui-icon-box')
export class WuiIconBox extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public icon: IconType = 'copy'

  @property() public size: 'sm' | 'md' | 'lg' | 'xl' = 'md'

  @property() public padding?: '1' | '2' = '1'

  @property() public color: IconColorType | 'secondary' = 'default'

  // -- Render -------------------------------------------- //
  public override render() {
    this.dataset['padding'] = this.padding
    this.dataset['color'] = this.color

    return html`
      <wui-icon size=${ifDefined(this.size)} name=${this.icon} color="inherit"></wui-icon>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-icon-box': WuiIconBox
  }
}
