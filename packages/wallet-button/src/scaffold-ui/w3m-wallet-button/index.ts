/* eslint-disable max-depth */
import { LitElement } from 'lit'
import { customElement } from '@reown/appkit-ui'

@customElement('w3m-wallet-button')
export class W3mWalletButton extends LitElement {
  /*
   *  // -- Members ------------------------------------------- //
   *  private unsubscribe: (() => void)[] = []
   *
   *  // -- State & Properties -------------------------------- //
   *  @property() wallet: Wallet = 'metamask'
   *
   *  @state() private connectors = ConnectorController.state.connectors
   *
   *  @state() private caipAddress = ChainController.state.activeCaipAddress
   *
   *  @state() private ready = false
   *
   *  @state() private loading = false
   *
   *  @state() private error = false
   *
   *  public constructor() {
   *  super()
   *  this.unsubscribe.push(
   *   ...[
   *     ConnectorController.subscribeKey('connectors', val => (this.connectors = val)),
   *     ChainController.subscribeKey('activeCaipAddress', val => {
   *       if (val) {
   *         this.loading = false
   *       }
   *
   *       this.caipAddress = val
   *     }),
   *     ApiController.subscribeKey('walletButtons', val => {
   *       if (val.length) {
   *         this.ready = true
   *       }
   *     }),
   *     ModalController.subscribeKey('open', val => {
   *       if (!val) {
   *         this.loading = false
   *         RouterController.push('Connect')
   *       }
   *     })
   *   ]
   *  )
   *  }
   *
   *  // -- Lifecycle ----------------------------------------- //
   *  public override disconnectedCallback() {
   *  this.unsubscribe.forEach(unsubscribe => unsubscribe())
   *  }
   *
   *  public override firstUpdated() {
   *  ApiController.fetchWalletButtons()
   *  }
   *
   *  // -- Render -------------------------------------------- //
   *  public override render() {
   *  if (ConstantsUtil.Socials.includes(this.wallet)) {
   *   return this.socialTemplate()
   *  }
   *
   *  const walletButton = WalletUtil.getWalletButton(this.wallet)
   *
   *  const connector = walletButton
   *   ? ConnectorController.getConnector(walletButton.id, walletButton.rdns)
   *   : undefined
   *
   *  if (!connector) {
   *   return this.walletButtonTemplate()
   *  }
   *
   *  return this.externalTemplate(connector)
   *  }
   *
   *  // -- Private ------------------------------------------- //
   *  private walletButtonTemplate() {
   *  const walletConnect = this.wallet === 'walletConnect'
   *
   *  const loading = this.loading || !this.ready
   *
   *  const walletButton = WalletUtil.getWalletButton(this.wallet)
   *
   *  const walletImage = AssetUtil.getWalletImageById(walletButton?.image_id)
   *  const walletName = this.wallet === 'walletConnect' ? 'WalletConnect' : walletButton?.name
   *
   *  const walletConnectConnector = this.connectors.find(c => c.id === 'walletConnect')
   *
   *  return html`
   *   <wui-wallet-button
   *     ?walletConnect=${this.wallet === 'walletConnect'}
   *     name=${!this.ready && !walletName ? 'Loading...' : ifDefined(walletName)}
   *     imageSrc=${ifDefined(walletImage)}
   *     @click=${() =>
   *       ConnectorUtil.connectWalletConnect({
   *         walletConnect: this.wallet === 'walletConnect',
   *         wallet: walletButton,
   *         connector: walletConnectConnector
   *       })}
   *     ?disabled=${Boolean(this.caipAddress)}
   *     ?loading=${walletConnect ? this.loading : loading}
   *   ></wui-wallet-button>
   *  `
   *  }
   *
   *  private externalTemplate(connector: Connector) {
   *  const walletButton = WalletUtil.getWalletButton(this.wallet)
   *
   *  const walletImage = AssetUtil.getWalletImageById(walletButton?.image_id)
   *
   *  const connectorImage = AssetUtil.getConnectorImage(connector)
   *
   *  return html`
   *   <wui-wallet-button
   *     imageSrc=${ifDefined(connectorImage ?? walletImage)}
   *     name=${ifDefined(connector.name)}
   *     @click=${() => ConnectorUtil.connectExternal(connector)}
   *     ?disabled=${Boolean(this.caipAddress)}
   *     ?loading=${this.loading}
   *     ?error=${this.error}
   *   ></wui-wallet-button>
   *  `
   *  }
   *
   *  private socialTemplate() {
   *  return html`<wui-wallet-button
   *   social
   *   name=${this.wallet}
   *   @click=${() => ConnectorUtil.connectSocial(this.wallet)}
   *   ?disabled=${Boolean(this.caipAddress)}
   *   ?loading=${this.loading}
   *   ?error=${this.error}
   *  ></wui-wallet-button>`
   *  }
   */
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-button': W3mWalletButton
  }
}
