import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-image/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-icon-box/index.js'
import '../wui-tag/index.js'
import styles from './styles.js'

@customElement('wui-list-select-wallet')
export class WuiListSelectWallet extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public imageSrc? = ''

  @property() public name = ''

  @property() public tagLabel?: string

  @property({ type: Boolean }) public qrCode = false

  @property({ type: Boolean }) public allWallets = false

  @property({ type: Boolean }) public disabled = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ?disabled=${this.disabled}>
        ${this.leftImageTemplate()}
        <wui-text color="primary" variant="lg-regular" lineClamp="1">${this.name}</wui-text>
        <wui-tag variant=${this.allWallets ? 'info' : 'accent'} size="sm">${this.tagLabel}</wui-tag>
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private leftImageTemplate() {
    if (this.allWallets) {
      return html`<wui-icon-box
        iconColor="accent"
        iconSize="xl"
        backgroundColor="foregroundAccent010"
        icon="allWallets"
      ></wui-icon-box>`
    }

    if (this.qrCode) {
      return html`<wui-icon-box color="default" iconSize="xl" icon="qrCode"></wui-icon-box>`
    }

    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc} alt=${this.name}></wui-image>`
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-list-select-wallet': WuiListSelectWallet
  }
}
