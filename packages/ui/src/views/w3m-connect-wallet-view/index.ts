import { ClientCtrl, RouterCtrl } from '@web3modal/core'
import { html, LitElement, TemplateResult } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-footer'
import '../../components/w3m-modal-header'
import '../../components/w3m-wallet-button'
import '../../components/w3m-walletconnect-button'
import { global } from '../../utils/Theme'
import styles from './styles'

@customElement('w3m-connect-wallet-view')
export class W3mConnectWalletView extends LitElement {
  public static styles = [global, styles]
  // -- private ------------------------------------------------------ //
  private onWalletConnect() {
    RouterCtrl.push('WalletConnectConnector')
  }

  private onCoinbaseWallet() {
    RouterCtrl.push('CoinbaseConnector')
  }

  private metaMaskTemplate() {
    return html`
      <w3m-wallet-button
        label="MetaMask"
        .onClick=${this.onCoinbaseWallet}
        imgUrl="https://cdn.iconscout.com/icon/free/png-256/metamask-2728406-2261817.png"
      ></w3m-wallet-button>
    `
  }

  private injectedTemplate(name: string) {
    return html`
      <w3m-wallet-button
        label=${name}
        .onClick=${this.onCoinbaseWallet}
        imgUrl="https://cdn.iconscout.com/icon/free/png-256/metamask-2728406-2261817.png"
      ></w3m-wallet-button>
    `
  }

  private dynamicSlots() {
    const injected = ClientCtrl.ethereum().getInjectedConnector()
    const metamask = ClientCtrl.ethereum().getMetaMaskConnector()
    let slot1: TemplateResult<1> | null = null
    let slot2: TemplateResult<1> | null = null
    if (injected.ready && !metamask.ready) {
      slot1 = this.injectedTemplate(injected.name)
      slot2 = this.metaMaskTemplate()
    } else if (metamask.ready && injected.ready) {
      slot1 = this.metaMaskTemplate()
      slot2 = this.injectedTemplate(injected.name)
    } else {
      slot1 = this.metaMaskTemplate()
      slot2 = this.metaMaskTemplate()
    }

    return { slot1, slot2 }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { slot1, slot2 } = this.dynamicSlots()

    return html`
      <w3m-modal-header title="Connect your wallet"></w3m-modal-header>
      <w3m-modal-content>
        <div class="w3m-view-row">
          <w3m-walletconnect-button .onClick=${this.onWalletConnect}></w3m-walletconnect-button>
          <w3m-wallet-button
            label="Coinbase"
            .onClick=${this.onCoinbaseWallet}
            imgUrl="https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0"
          ></w3m-wallet-button>
        </div>

        <div class="w3m-view-row">
          ${slot1} ${slot2}
          <w3m-wallet-button
            label="Ledger"
            .onClick=${this.onCoinbaseWallet}
            imgUrl="https://cdn.iconscout.com/icon/free/png-256/metamask-2728406-2261817.png"
          ></w3m-wallet-button>
          <w3m-wallet-button
            label="View All"
            .onClick=${this.onCoinbaseWallet}
            imgUrl="https://cdn.iconscout.com/icon/free/png-256/metamask-2728406-2261817.png"
          ></w3m-wallet-button>
        </div>
      </w3m-modal-content>
      <w3m-modal-footer>Hello</w3m-modal-footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-wallet-view': W3mConnectWalletView
  }
}
