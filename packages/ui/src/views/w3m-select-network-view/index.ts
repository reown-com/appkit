import { OptionsCtrl, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-select-network-view')
export class W3mSelectNetworkView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- private ------------------------------------------------------ //
  private onSelectChain() {
    RouterCtrl.push('ConnectWallet')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { chains } = OptionsCtrl.state

    return html`
      <w3m-modal-header title="Select network"></w3m-modal-header>
      <w3m-modal-content>
        <div class="w3m-grid">
          ${chains?.map(
            ({ name, id }) =>
              html`
                <w3m-network-button name=${name} chainId=${id} .onClick=${this.onSelectChain}>
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
