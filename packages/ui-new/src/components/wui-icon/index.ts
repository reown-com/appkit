import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { colorStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconType, IconSizeType, IconColorType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

// -- Svg's-------------------------------- //
import { allWalletsSvg } from '../../assets/svg/all-wallets.js'
import { qrCodeSvg } from '../../assets/svg/qr-code.js'
import { spinnerSvg } from '../../assets/svg/spinner.js'
import { warningCircleSvg } from '../../assets/svg/warning-circle.js'
import { infoSvg } from '../../assets/svg/info.js'
import { exclamationTriangleSvg } from '../../assets/svg/exclamation-triangle.js'
import { externalLinkSvg } from '../../assets/svg/external-link.js'
import { mailSvg } from '../../assets/svg/mail.js'
import { cursorSvg } from '../../assets/svg/cursor.js'
import { vars } from '../../utils/ThemeHelperUtil.js'
import { ethereumSvg } from '../../assets/svg/ethereum.js'
import { chevronDownSvg } from '../../assets/svg/chevron-down.js'

// -- Constants ------------------------------------------ //
export const SVG_OPTIONS = {
  allWallets: allWalletsSvg,
  cursor: cursorSvg,
  chevronDown: chevronDownSvg,
  ethereum: ethereumSvg,
  exclamationTriangle: exclamationTriangleSvg,
  externalLink: externalLinkSvg,
  info: infoSvg,
  mail: mailSvg,
  qrCode: qrCodeSvg,
  spinner: spinnerSvg,
  warningCircle: warningCircleSvg
}

export const ICON_COLOR = {
  default: vars.tokens.theme.iconDefault,
  inverse: vars.tokens.theme.iconInverse,
  accentPrimary: vars.tokens.core.iconAccentPrimary,
  accentCertified: vars.tokens.core.iconAccentCertified,
  success: vars.tokens.core.iconSuccess,
  error: vars.tokens.core.iconError,
  warning: vars.tokens.core.iconWarning
}

@customElement('wui-icon')
export class WuiIcon extends LitElement {
  public static override styles = [resetStyles, colorStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: IconSizeType = 'md'

  @property() public color: IconColorType = 'inherit'

  @property() public name: IconType = 'qrCode'

  // -- Render -------------------------------------------- //
  public override render() {
    this.style.cssText = `
      --local-width: ${this.size === 'inherit' ? 'inherit' : vars.iconSize[this.size]};
      --local-color: ${this.color === 'inherit' ? 'inherit' : ICON_COLOR[this.color]};
    `

    return html`${SVG_OPTIONS[this.name]}`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-icon': WuiIcon
  }
}
