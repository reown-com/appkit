import { NetworkCtrl, OptionsCtrl, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-header'

@customElement('w3m-select-network-view')
export class W3mSelectNetworkView extends LitElement {
  // -- private ------------------------------------------------------ //
  private onSelectChain(chainId: number) {
    OptionsCtrl.setSelectedChainId(chainId)
    RouterCtrl.push('ConnectWallet')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { chains } = NetworkCtrl.get()

    return html`
      <w3m-modal-header title="Select Network"></w3m-modal-header>
      <w3m-modal-content>
        ${chains.map(
          chain => html`<button @click=${() => this.onSelectChain(chain.id)}>${chain.name}</button>`
        )}
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-select-network-view': W3mSelectNetworkView
  }
}
