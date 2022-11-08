import { OptionsCtrl, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-header'
import '../../components/w3m-network-button'
import { scss } from '../../style/utils'
import { global } from '../../utils/Theme'
import { getChainIcon } from '../../utils/UiHelpers'
import styles from './styles.scss'

@customElement('w3m-select-network-view')
export class W3mSelectNetworkView extends LitElement {
  public static styles = [global, scss`${styles}`]

  // -- private ------------------------------------------------------ //
  private onSelectChain(chainId: number) {
    OptionsCtrl.setSelectedChainId(chainId)
    RouterCtrl.push('ConnectWallet')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { chains } = OptionsCtrl.state

    return html`
      <w3m-modal-header title="Select network"></w3m-modal-header>
      <w3m-modal-content>
        <div class="w3m-container">
          ${chains?.map(
            ({ name, id }) =>
              html`
                <w3m-network-button
                  name=${name}
                  src=${getChainIcon(id)}
                  .onClick=${() => this.onSelectChain(id)}
                >
                  ${name}
                </w3m-network-button>
              `
          )}
        </div>
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-select-network-view': W3mSelectNetworkView
  }
}
