import { html, LitElement, svg } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
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

  @property({ type: Number }) public size = 0

  @property() public theme: ThemeType = 'dark'

  @property() public imageSrc?: string = undefined

  @property() public alt?: string = undefined

  @property({ type: Boolean }) public arenaClear?: boolean = undefined

  @property({ type: Boolean }) public farcaster?: boolean = undefined

  // -- Render -------------------------------------------- //
  public override render() {
    this.dataset['theme'] = this.theme
    this.dataset['clear'] = String(this.arenaClear)
    this.style.cssText = `--local-size: ${this.size}px`

    return html`${this.templateVisual()} ${this.templateSvg()}`
  }

  // -- Private ------------------------------------------- //
  private templateSvg() {
    const size = this.theme === 'light' ? this.size : this.size - 16 * 2

    return svg`
      <svg height=${size} width=${size}>
        ${QrCodeUtil.generate(this.uri, size, this.arenaClear ? 0 : size / 4)}
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
