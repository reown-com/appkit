/* eslint-disable no-nested-ternary */
import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import '../../components/wui-icon/index.js'
import { ICON_COLOR } from '../../components/wui-icon/index.js'
import { vars } from '../../utils/ThemeHelperUtil.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type {
  BackgroundColorType,
  IconColorType,
  IconSizeType,
  IconType
} from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

// -- Constants ------------------------------------------ //

const BACKGROUND_COLOR = {
  foregroundSecondary: vars.tokens.theme.foregroundSecondary,
  foregroundAccent010: vars.tokens.core.foregroundAccent010
}

@customElement('wui-icon-box')
export class WuiIconBox extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public icon: IconType = 'copy'

  @property() public iconColor: IconColorType = 'inherit'

  @property() public iconSize?: Exclude<IconSizeType, 'inherit'>

  @property() public backgroundColor: BackgroundColorType = 'foregroundSecondary'

  // -- Render -------------------------------------------- //
  public override render() {
    this.style.cssText = `
       --local-bg-color: ${BACKGROUND_COLOR[this.backgroundColor]};
       --local-icon-color: ${this.iconColor === 'inherit' ? 'inherit' : ICON_COLOR[this.iconColor]};
   `

    return html`
      <wui-icon
        color=${this.iconColor}
        size=${ifDefined(this.iconSize)}
        name=${this.icon}
      ></wui-icon>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-icon-box': WuiIconBox
  }
}
