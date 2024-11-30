/* eslint-disable no-nested-ternary */
import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-icon/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type {
  BackgroundColorType,
  IconColorType,
  IconBoxSpacingType,
  IconSizeType,
  IconType
} from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'
import { vars } from '../../utils/ThemeHelperUtil.js'
import { ICON_COLOR } from '../../components/wui-icon/index.js'

// -- Constants ------------------------------------------ //
const BACKGROUND_COLOR = {
  primary: vars.tokens.theme.backgroundPrimary,
  foregroundPrimary: vars.tokens.theme.foregroundPrimary,
  foregroundSecondary: vars.tokens.theme.foregroundSecondary,
  foregroundAccent010: vars.tokens.core.foregroundAccent010
}

const ICON_SPACING = {
  sm: vars.spacing[1],
  md: vars.spacing[2]
}

@customElement('wui-icon-box')
export class WuiIconBox extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public icon: IconType = 'copy'

  @property() public iconColor: IconColorType = 'inverse'

  @property() public spacing: IconBoxSpacingType = 'md'

  @property() public iconSize?: Exclude<IconSizeType, 'inherit'>

  @property() public backgroundColor: BackgroundColorType = 'inherit'

  // -- Render -------------------------------------------- //
  public override render() {
    this.style.cssText = `
       --local-bg-color: ${
         this.backgroundColor === 'inherit' ? 'inherit' : BACKGROUND_COLOR[this.backgroundColor]
       };
       --local-icon-color: ${
         this.iconColor === 'inherit' ? 'iconColor' : ICON_COLOR[this.iconColor]
       };
      --local-spacing: ${ICON_SPACING[this.spacing]};
   `

    return html` <wui-icon size=${this.iconSize} name=${this.icon}></wui-icon> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-icon-box': WuiIconBox
  }
}
