import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-text'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import type { IWalletImage, TagType } from '../../utils/TypesUtil'
import '../wui-all-wallets-image'
import '../wui-wallet-image'
import '../wui-tag'
import styles from './styles'

@customElement('wui-list-select')
export class WuiListSelect extends LitElement {
  public static styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Array }) public walletImages?: IWalletImage[] = []

  @property() public imageSrc? = ''

  @property() public name = ''

  @property() public tagLabel?: 'installed' | 'qr code' | 'recent'

  @property() public tagVariant?: TagType

  @property({ type: Boolean }) public disabled = false

  @property({ type: Boolean }) public showAllWallets = false

  // -- Render -------------------------------------------- //
  public render() {
    const textColor = this.disabled ? 'fg-300' : 'fg-100'

    return html`
      <button ?disabled=${this.disabled}>
        ${this.templateAllWallets()} ${this.templateWalletImage()}
        <wui-text variant="paragraph-500" color=${textColor}>${this.name}</wui-text>
        ${this.templateStatus()}
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private templateAllWallets() {
    if (this.showAllWallets && this.walletImages) {
      return html`<wui-all-wallets-image
        .walletImages=${this.walletImages}
      ></wui-all-wallets-image>`
    }

    return null
  }

  private templateWalletImage() {
    if (!this.showAllWallets && this.imageSrc) {
      return html`<wui-wallet-image
        size="sm"
        imageSrc=${this.imageSrc}
        name=${this.name}
      ></wui-wallet-image>`
    } else if (!this.showAllWallets && !this.imageSrc) {
      return html`<wui-wallet-image size="sm" name=${this.name}></wui-wallet-image>`
    }

    return null
  }

  private templateStatus() {
    if (this.tagLabel && this.tagVariant) {
      return html` <wui-tag variant=${this.tagVariant}>${this.tagLabel}</wui-tag>`
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-list-select': WuiListSelect
  }
}
