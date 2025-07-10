/* eslint-disable no-nested-ternary */
import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import '../../components/wui-icon/index.js'
import { ICON_COLOR } from '../../components/wui-icon/index.js'
import { vars } from '../../utils/ThemeHelperUtil.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

// -- Constants ------------------------------------------ //

const BACKGROUND_COLOR = {
  'accent-primary': vars.tokens.core.foregroundAccent010,
  default: vars.tokens.theme.foregroundPrimary,
  error: vars.tokens.core.backgroundError,
  warning: vars.tokens.core.backgroundWarning,
  success: vars.tokens.core.backgroundSuccess
}

@customElement('wui-icon-box')
export class WuiIconBox extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public icon: IconType = 'copy'

  @property() public size: 'sm' | 'md' | 'lg' | 'xl' = 'md'

  @property() public color: 'error' | 'default' | 'accent-primary' | 'warning' | 'success' =
    'default'

  // -- Render -------------------------------------------- //
  public override render() {
    this.style.cssText = `
       --local-bg-color: ${BACKGROUND_COLOR[this.color]};
       --local-icon-color: ${ICON_COLOR[this.color]};
   `

    return html`
      <wui-icon color=${this.color} size=${ifDefined(this.size)} name=${this.icon}></wui-icon>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-icon-box': WuiIconBox
  }
}
