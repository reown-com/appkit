import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { globalStyles } from '../../utils/ThemeUtil'
import '../../components/wui-text'
import '../wui-wallet-image'
import '../wui-all-wallets-image'
import styles from './styles'
import type { IWalletImage } from '../../utils/TypesUtil'

@customElement('wui-list-select')
export class WuiListSelect extends LitElement {
  public static styles = [globalStyles, styles]

  // -- state & properties ------------------------------------------- //
  @property({ type: Array }) public walletImages?: IWalletImage[] = []

  @property() public imageSrc? = ''

  @property() public name = ''

  @property() public status?: 'installed' | 'qr code' | 'recent'

  @property({ type: Boolean }) public showAllWallets = false

  // -- render ------------------------------------------------------- //
  public render() {
    const visual =
      this.showAllWallets && this.walletImages
        ? html`<wui-all-wallets-image .walletImages=${this.walletImages}></wui-all-wallets-image>`
        : this.imageSrc &&
          html`<wui-wallet-image
            size="sm"
            src=${this.imageSrc}
            alt=${this.name}
          ></wui-wallet-image>`

    const status =
      this.status && html` <wui-text variant="micro-700" color="fg-300">${this.status}</wui-text> `

    return html`
      <button>
        ${visual}
        <wui-text variant="paragraph-500" color="fg-100">${this.name}</wui-text>
        ${status}
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-list-select': WuiListSelect
  }
}
