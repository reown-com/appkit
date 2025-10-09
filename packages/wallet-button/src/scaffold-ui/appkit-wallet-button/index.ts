/* eslint-disable @typescript-eslint/no-empty-function */
import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { CaipAddress, ChainNamespace } from '@reown/appkit-common'
import {
  AssetUtil,
  ChainController,
  type Connector,
  ConnectorController,
  ConnectorControllerUtil,
  ModalController,
  RouterController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-wallet-button'

import { ApiController } from '../../controllers/ApiController.js'
import { ConstantsUtil } from '../../utils/ConstantsUtil.js'
import type { SocialProvider, Wallet } from '../../utils/TypeUtil.js'
import { WalletUtil } from '../../utils/WalletUtil.js'

@customElement('appkit-wallet-button')
export class AppKitWalletButton extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() wallet: Wallet = 'metamask'

  @property() namespace?: ChainNamespace

  @state() private connectors = ConnectorController.state.connectors

  @state() private caipAddress: CaipAddress | undefined

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

  // -- Lifecycle ----------------------------------------- //
  public override connectedCallback() {
    super.connectedCallback()
    this.caipAddress = this.namespace
      ? ChainController.state.chains.get(this.namespace)?.accountState?.caipAddress
      : ChainController.state.activeCaipAddress
  }

  public override firstUpdated() {
    if (!WalletUtil.isWalletButtonReady(this.wallet)) {
      // Prefetch wallet buttons
      ApiController.fetchWalletButtons()
    }

    if (this.namespace) {
      this.unsubscribe.push(
        ChainController.subscribeChainProp(
          'accountState',
          val => {
            this.caipAddress = val?.caipAddress
          },
          this.namespace
        )
      )
    } else {
      this.unsubscribe.push(
        ChainController.subscribeKey('activeCaipAddress', val => (this.caipAddress = val))
      )
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
      ? ConnectorController.getConnector({
          id: walletButton.id,
          rdns: walletButton.rdns,
          namespace: this.namespace
        })
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
          await ConnectorControllerUtil.connectWalletConnect({
            walletConnect: this.wallet === 'walletConnect',
            connector: this.connectors.find(c => c.id === 'walletConnect'),
            onOpen(isMobile) {
              ModalController.open({
                view: isMobile ? 'AllWallets' : 'ConnectingWalletConnect',
                data: isMobile ? undefined : { wallet: walletButton }
              })
            },
            onConnect() {
              RouterController.replace('Connect')
            }
          })
            .catch(() => {
              // Ignore. We don't want to handle errors if user closes QR modal
            })
            .finally(() => (this.loading = false))
        }}
        .icon=${ifDefined(this.wallet === 'walletConnect' ? 'walletConnectInvert' : undefined)}
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
          await ConnectorControllerUtil.connectExternal(connector)
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
      @click=${() => {
        this.loading = true
        this.error = false

        return ConnectorControllerUtil.connectSocial({
          social: this.wallet as SocialProvider,
          namespace: this.namespace,
          onOpenFarcaster() {
            ModalController.open({ view: 'ConnectingFarcaster' })
          },
          onConnect() {
            RouterController.push('Connect')
          }
        })
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
        await ConnectorControllerUtil.connectEmail({
          namespace: this.namespace,
          onOpen() {
            ModalController.open({ view: 'EmailLogin' })
          },
          onConnect() {
            RouterController.push('Connect')
          }
        })
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
