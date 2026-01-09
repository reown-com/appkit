import { LitElement, html, svg } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../layout/wui-flex/index.js'
import { QrCodeUtil } from '../../utils/QrCode.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import type { ThemeType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-qr-code')
export class WuiQrCode extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public uri = ''

  @property({ type: Number }) public size = 500

  @property() public theme: ThemeType = 'dark'

  @property() public imageSrc?: string = undefined

  @property() public alt?: string = undefined

  @property({ type: Boolean }) public arenaClear?: boolean = undefined

  @property({ type: Boolean }) public farcaster?: boolean = undefined

  // -- Render -------------------------------------------- //
  public override render() {
    this.dataset['theme'] = this.theme
    this.dataset['clear'] = String(this.arenaClear)

    return html`<wui-flex
      alignItems="center"
      justifyContent="center"
      class="wui-qr-code"
      direction="column"
      gap="4"
      width="100%"
      style="height: 100%"
    >
      ${this.templateVisual()} ${this.templateSvg()}
    </wui-flex>`
  }

  // -- Private ------------------------------------------- //
  private templateSvg() {
    return svg`
      <svg viewBox="0 0 ${this.size} ${this.size}" width="100%" height="100%">
        ${QrCodeUtil.generate({
          uri: this.uri,
          size: this.size,
          logoSize: this.arenaClear ? 0 : this.size / 4
        })}
      </svg>
    `
  }

  private templateVisual() {
    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc} alt=${this.alt ?? 'logo'}></wui-image>`
    }

    if (this.farcaster) {
      return html`<wui-icon
        class="farcaster"
        size="inherit"
        color="inherit"
        name="farcaster"
      ></wui-icon>`
    }

    return html`<wui-icon size="inherit" color="inherit" name="walletConnect"></wui-icon>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-qr-code': WuiQrCode
  }
}
