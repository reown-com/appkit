import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import {
  AssetUtil,
  ChainController,
  type Connector,
  ConnectorController,
  ModalController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-wallet-button'

import { ApiController } from '../../controllers/ApiController.js'
import { ConnectorUtil } from '../../utils/ConnectorUtil.js'
import { ConstantsUtil } from '../../utils/ConstantsUtil.js'
import type { SocialProvider, Wallet } from '../../utils/TypeUtil.js'
import { WalletUtil } from '../../utils/WalletUtil.js'

@customElement('appkit-wallet-button')
export class AppKitWalletButton extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() wallet: Wallet = 'metamask'

  @state() private connectors = ConnectorController.state.connectors

  @state() private caipAddress = ChainController.state.activeCaipAddress

  @state() private loading = false

  @state() private error = false

  @state() private ready = WalletUtil.isWalletButtonReady(this.wallet)

  @state() private modalLoading = ModalController.state.loading

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        ModalController.subscribeKey('loading', val => (this.modalLoading = val)),
        ConnectorController.subscribeKey('connectors', val => (this.connectors = val)),
        ChainController.subscribeKey('activeCaipAddress', val => {
          if (val) {
            this.error = false
          }
          this.caipAddress = val
        }),
        ApiController.subscribeKey('walletButtons', () => {
          this.ready = WalletUtil.isWalletButtonReady(this.wallet)
        })
      ]
    )
  }

  // -- Lifecycle ----------------------------------------- //
  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  public override firstUpdated() {
    if (!WalletUtil.isWalletButtonReady(this.wallet)) {
      // Prefetch wallet buttons
      ApiController.fetchWalletButtons()
    }
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (this.wallet === 'email') {
      return this.emailTemplate()
    }

    if (ConstantsUtil.Socials.some(social => social === this.wallet)) {
      return this.socialTemplate()
    }

    const walletButton = WalletUtil.getWalletButton(this.wallet)

    const connector = walletButton
      ? ConnectorController.getConnector(walletButton.id, walletButton.rdns)
      : undefined

    if (connector) {
      return this.externalTemplate(connector)
    }

    return this.walletButtonTemplate()
  }

  // -- Private ------------------------------------------- //
  private walletButtonTemplate() {
    const walletConnect = this.wallet === 'walletConnect'

    const loading = walletConnect ? this.loading : this.loading || !this.ready

    const walletButton = WalletUtil.getWalletButton(this.wallet)

    const walletImage = AssetUtil.getWalletImageById(walletButton?.image_id)
    const walletName = this.wallet === 'walletConnect' ? 'WalletConnect' : walletButton?.name

    return html`
      <wui-wallet-button
        data-testid="apkt-wallet-button"
        name=${(!this.ready && !walletConnect) || this.modalLoading
          ? 'Loading...'
          : ifDefined(walletName)}
        @click=${async () => {
          this.loading = true
          await ConnectorUtil.connectWalletConnect({
            walletConnect: this.wallet === 'walletConnect',
            wallet: walletButton,
            connector: this.connectors.find(c => c.id === 'walletConnect')
          })
            .catch(() => {
              // Ignore. We don't want to handle errors if user closes QR modal
            })
            .finally(() => (this.loading = false))
        }}
        .icon=${ifDefined(this.wallet === 'walletConnect' ? 'walletConnect' : undefined)}
        .imageSrc=${ifDefined(walletImage)}
        ?disabled=${Boolean(this.caipAddress) || loading || this.modalLoading}
        ?loading=${loading || this.modalLoading}
      ></wui-wallet-button>
    `
  }

  private externalTemplate(connector: Connector) {
    const walletButton = WalletUtil.getWalletButton(this.wallet)

    const walletImage = AssetUtil.getWalletImageById(walletButton?.image_id)

    const connectorImage = AssetUtil.getConnectorImage(connector)

    return html`
      <wui-wallet-button
        data-testid="apkt-wallet-button-external"
        name=${this.modalLoading ? 'Loading...' : ifDefined(connector.name)}
        @click=${async () => {
          this.loading = true
          this.error = false
          await ConnectorUtil.connectExternal(connector)
            .catch(() => (this.error = true))
            .finally(() => (this.loading = false))
        }}
        .imageSrc=${ifDefined(walletImage ?? connectorImage)}
        ?disabled=${Boolean(this.caipAddress) || this.loading || this.modalLoading}
        ?loading=${this.loading || this.modalLoading}
        ?error=${this.error}
      ></wui-wallet-button>
    `
  }

  private socialTemplate() {
    return html`<wui-wallet-button
      data-testid="apkt-wallet-button-social"
      name=${this.modalLoading ? 'Loading...' : this.wallet}
      @click=${async () => {
        this.loading = true
        this.error = false
        await ConnectorUtil.connectSocial(this.wallet as SocialProvider)
          .catch(() => (this.error = true))
          .finally(() => (this.loading = false))
      }}
      .icon=${this.wallet}
      ?disabled=${Boolean(this.caipAddress) || this.loading || this.modalLoading}
      ?loading=${this.loading || this.modalLoading}
      ?error=${this.error}
    ></wui-wallet-button>`
  }

  private emailTemplate() {
    return html`<wui-wallet-button
      data-testid="apkt-wallet-button-email"
      name=${this.modalLoading ? 'Loading...' : 'Email'}
      @click=${async () => {
        this.loading = true
        this.error = false
        await ConnectorUtil.connectEmail()
          .catch(() => (this.error = true))
          .finally(() => (this.loading = false))
      }}
      .icon=${'mail'}
      .iconSize=${'lg'}
      ?disabled=${Boolean(this.caipAddress) || this.loading || this.modalLoading}
      ?loading=${this.loading || this.modalLoading}
      ?error=${this.error}
    ></wui-wallet-button>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'appkit-wallet-button': AppKitWalletButton
  }
}
