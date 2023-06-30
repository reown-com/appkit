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

  @property() public listName = ''

  @property() public listStatus?: string

  @property({ type: Boolean }) public showAllWallets = false

  // -- render ------------------------------------------------------- //
  public render() {
    const getWalletComponent = () => {
      if (this.showAllWallets && this.walletImages) {
        return html`<wui-all-wallets-image
          .walletImages=${this.walletImages}
        ></wui-all-wallets-image>`
      } else if (this.imageSrc) {
        return html`<wui-wallet-image
          size="sm"
          src=${this.imageSrc}
          alt=${this.listName}
        ></wui-wallet-image>`
      }

      return undefined
    }

    const status =
      this.listStatus &&
      html` <wui-text variant="micro-700" color="fg-300">${this.listStatus}</wui-text> `

    return html`
      <button>
        <div>
          ${getWalletComponent()}
          <wui-text variant="paragraph-500" color="fg-100">${this.listName}</wui-text>
        </div>
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
