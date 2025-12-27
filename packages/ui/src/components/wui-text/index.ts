import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'

import { vars } from '../../utils/ThemeHelperUtil.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import type { LineClamp, TextAlign, TextColorType, TextType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

// -- Constants ------------------------------------------ //

export const TEXT_VARS_BY_COLOR = {
  /* Colors */
  primary: vars.tokens.theme.textPrimary,
  secondary: vars.tokens.theme.textSecondary,
  tertiary: vars.tokens.theme.textTertiary,
  invert: vars.tokens.theme.textInvert,
  error: vars.tokens.core.textError,
  success: vars.tokens.core.textSuccess,
  warning: vars.tokens.core.textWarning,

  /* Token colors */
  'accent-primary': vars.tokens.core.textAccentPrimary
}

@customElement('wui-text')
export class WuiText extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public variant: TextType = 'md-regular'

  @property() public color?: TextColorType = 'inherit'

  @property() public align?: TextAlign = 'left'

  @property() public lineClamp?: LineClamp = undefined

  @property() public display: 'inline-flex' | 'inline' = 'inline-flex'

  // -- Render -------------------------------------------- //
  public override render() {
    const classes = {
      [`wui-font-${this.variant}`]: true,
      // eslint-disable-next-line no-unneeded-ternary
      [`wui-line-clamp-${this.lineClamp}`]: this.lineClamp ? true : false
    }

    this.style.cssText = `
      display: ${this.display};
      --local-align: ${this.align};
      --local-color: ${
        this.color === 'inherit' ? 'inherit' : TEXT_VARS_BY_COLOR[this.color ?? 'primary']
      };
      `

    return html`<slot class=${classMap(classes)}></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-text': WuiText
  }
}
