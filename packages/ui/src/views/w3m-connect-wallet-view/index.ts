import { ConfigCtrl, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-modal-header'

@customElement('w3m-connect-wallet-view')
export class W3mConnectWalletView extends LitElement {
  // -- private ------------------------------------------------------ //
  private getConnectors() {
    const connectors = ConfigCtrl.state.ethereumClient?.connectors
    if (!connectors) throw new Error('At least 1 connector is required')
    const walletConnect = connectors.find(item => item.id === 'walletConnect')
    const coinbase = connectors.find(item => item.id === 'coinbaseWallet')
    const metamask = connectors.find(item => item.id === 'metaMask')
    const injected = connectors.find(item => item.id === 'injected')
    if (!walletConnect) throw new Error('Missing WalletConnect connector')
    else if (!coinbase) throw new Error('Missing Coinbase Wallet connector')
    else if (!metamask) throw new Error('Missing Metamask connector')
    else if (!injected) throw new Error('Missing Injected connector')

    return { walletConnect, coinbase, metamask, injected }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { walletConnect } = this.getConnectors()

    async function onWalletConnect() {
      const provider = await walletConnect.getProvider()
      provider.connector.on('display_uri', data => console.log(data))
      await walletConnect.connect()
    }

    return html`
      <w3m-modal-header title="Connect your wallet"></w3m-modal-header>
      <button @click=${onWalletConnect}>WalletConnect</button>
      <button @click=${() => RouterCtrl.replace('QrCode')}>Go To Select Network</button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-wallet-view': W3mConnectWalletView
  }
}
