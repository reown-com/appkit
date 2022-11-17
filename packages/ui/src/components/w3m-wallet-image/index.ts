import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { global } from '../../utils/Theme'
import { getOptimisticId, getWalletIcon } from '../../utils/UiHelpers'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-wallet-image')
export class W3mWalletImage extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @property() public walletId?: string = undefined
  @property() public src?: string = undefined

  // -- render ------------------------------------------------------- //
  protected render() {
    const walletId = this.walletId ?? 'injected'
    const optimisticId = getOptimisticId(walletId)

    return html`
      ${dynamicStyles()}

      <div class="w3m-wallet-image">
        <img src=${this.src ?? getWalletIcon(optimisticId)} alt=${this.id} />
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-image': W3mWalletImage
  }
}
