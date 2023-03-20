import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-wallet-image')
export class W3mWalletImage extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @property() public walletId?: string = undefined
  @property() public src?: string = undefined

  // -- render ------------------------------------------------------- //
  protected render() {
    const optimisticId = UiUtil.getWalletId(this.walletId ?? '')
    const src = this.src ? this.src : UiUtil.getWalletIcon(optimisticId)

    return html`
      ${src.length
        ? html`
            <div>
              <img src=${src} alt=${this.id} />
            </div>
          `
        : SvgUtil.WALLET_PLACEHOLDER}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-image': W3mWalletImage
  }
}
