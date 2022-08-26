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

    async function onWalletConnectUri() {
      let timeout = 0

      return new Promise<void>((resolve, reject) => {
        const interval = setInterval(async () => {
          const { connector } = await walletConnect.getProvider()
          if (connector.key) {
            clearInterval(interval)
            console.log(connector.uri)
            // TODO here something
            resolve()
          } else if (timeout >= 5000) {
            clearInterval(interval)
            reject(new Error('Timout'))
          }
          timeout += 100
        }, 100)
      })
    }

    async function onWalletConnect() {
      await Promise.all([walletConnect.connect(), onWalletConnectUri()])
      console.log('COnnected!')
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
