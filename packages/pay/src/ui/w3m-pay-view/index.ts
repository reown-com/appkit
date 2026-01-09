/* eslint-disable no-console */
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { type CaipAddress, type ChainNamespace } from '@reown/appkit-common'
import {
  AssetUtil,
  ChainController,
  ConnectionController,
  ConnectorController,
  ModalController,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-icon-button'
import '@reown/appkit-ui/wui-icon-link'
import '@reown/appkit-ui/wui-image'
import '@reown/appkit-ui/wui-list-item'
import '@reown/appkit-ui/wui-loading-spinner'
import '@reown/appkit-ui/wui-loading-spinner'
import '@reown/appkit-ui/wui-network-image'
import '@reown/appkit-ui/wui-separator'
import '@reown/appkit-ui/wui-text'
import '@reown/appkit-ui/wui-wallet-image'

import { PayController } from '../../controllers/PayController.js'
import type { Exchange } from '../../types/exchange.js'
import { formatAmount, isPayWithWalletSupported, isTestnetAsset } from '../../utils/AssetUtil.js'
import { REOWN_TEST_EXCHANGE_ID } from '../../utils/ConstantsUtil.js'
import styles from './styles.js'

@customElement('w3m-pay-view')
export class W3mPayView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private amount = PayController.state.amount
  @state() private namespace: ChainNamespace | undefined = undefined
  @state() private paymentAsset = PayController.state.paymentAsset
  @state() private activeConnectorIds = ConnectorController.state.activeConnectorIds
  @state() private caipAddress: CaipAddress | undefined = undefined
  @state() private exchanges = PayController.state.exchanges
  @state() private isLoading = PayController.state.isLoading

  public constructor() {
    super()
    this.initializeNamespace()
    this.unsubscribe.push(PayController.subscribeKey('amount', val => (this.amount = val)))
    this.unsubscribe.push(
      ConnectorController.subscribeKey('activeConnectorIds', ids => (this.activeConnectorIds = ids))
    )
    this.unsubscribe.push(PayController.subscribeKey('exchanges', val => (this.exchanges = val)))
    this.unsubscribe.push(PayController.subscribeKey('isLoading', val => (this.isLoading = val)))

    PayController.fetchExchanges()
    PayController.setSelectedExchange(undefined)
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column">
        ${this.paymentDetailsTemplate()} ${this.paymentMethodsTemplate()}
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  private paymentMethodsTemplate() {
    return html`
      <wui-flex flexDirection="column" padding="3" gap="2" class="payment-methods-container">
        ${this.payWithWalletTemplate()} ${this.templateSeparator()}
        ${this.templateExchangeOptions()}
      </wui-flex>
    `
  }

  private initializeNamespace() {
    const namespace = ChainController.state.activeChain as ChainNamespace

    this.namespace = namespace
    this.caipAddress = ChainController.getAccountData(namespace)?.caipAddress
    this.unsubscribe.push(
      ChainController.subscribeChainProp(
        'accountState',
        accountState => {
          this.caipAddress = accountState?.caipAddress
        },
        namespace
      )
    )
  }

  private paymentDetailsTemplate() {
    const allNetworks = ChainController.getAllRequestedCaipNetworks()
    const targetNetwork = allNetworks.find(net => net.caipNetworkId === this.paymentAsset.network)

    return html`
      <wui-flex
        alignItems="center"
        justifyContent="space-between"
        .padding=${['6', '8', '6', '8'] as const}
        gap="2"
      >
        <wui-flex alignItems="center" gap="1">
          <wui-text variant="h1-regular" color="primary">
            ${formatAmount(this.amount || '0')}
          </wui-text>

          <wui-flex flexDirection="column">
            <wui-text variant="h6-regular" color="secondary">
              ${this.paymentAsset.metadata.symbol || 'Unknown'}
            </wui-text>
            <wui-text variant="md-medium" color="secondary"
              >on ${targetNetwork?.name || 'Unknown'}</wui-text
            >
          </wui-flex>
        </wui-flex>

        <wui-flex class="left-image-container">
          <wui-image
            src=${ifDefined(this.paymentAsset.metadata.logoURI)}
            class="token-image"
          ></wui-image>
          <wui-image
            src=${ifDefined(AssetUtil.getNetworkImage(targetNetwork))}
            class="chain-image"
          ></wui-image>
        </wui-flex>
      </wui-flex>
    `
  }

  private payWithWalletTemplate() {
    if (!isPayWithWalletSupported(this.paymentAsset.network)) {
      return html``
    }

    return this.caipAddress ? this.connectedWalletTemplate() : this.disconnectedWalletTemplate()
  }

  private connectedWalletTemplate() {
    const { name, image } = this.getWalletProperties({
      namespace: this.namespace
    })

    return html`
      <wui-flex flexDirection="column" gap="3">
        <wui-list-item
          type="secondary"
          boxColor="foregroundSecondary"
          @click=${this.onWalletPayment}
          .boxed=${false}
          ?chevron=${true}
          ?fullSize=${false}
          ?rounded=${true}
          data-testid="wallet-payment-option"
          imageSrc=${ifDefined(image)}
          imageSize="3xl"
        >
          <wui-text variant="lg-regular" color="primary">Pay with ${name}</wui-text>
        </wui-list-item>

        <wui-list-item
          type="secondary"
          icon="power"
          iconColor="error"
          @click=${this.onDisconnect}
          data-testid="disconnect-button"
          ?chevron=${false}
          boxColor="foregroundSecondary"
        >
          <wui-text variant="lg-regular" color="secondary">Disconnect</wui-text>
        </wui-list-item>
      </wui-flex>
    `
  }

  private disconnectedWalletTemplate() {
    return html`<wui-list-item
      type="secondary"
      boxColor="foregroundSecondary"
      variant="icon"
      iconColor="default"
      iconVariant="overlay"
      icon="wallet"
      @click=${this.onWalletPayment}
      ?chevron=${true}
      data-testid="wallet-payment-option"
    >
      <wui-text variant="lg-regular" color="primary">Pay with wallet</wui-text>
    </wui-list-item>`
  }

  private templateExchangeOptions() {
    if (this.isLoading) {
      return html`<wui-flex justifyContent="center" alignItems="center">
        <wui-loading-spinner size="md"></wui-loading-spinner>
      </wui-flex>`
    }

    const exchangesToShow = this.exchanges.filter(exchange => {
      if (isTestnetAsset(this.paymentAsset)) {
        return exchange.id === REOWN_TEST_EXCHANGE_ID
      }

      return exchange.id !== REOWN_TEST_EXCHANGE_ID
    })

    if (exchangesToShow.length === 0) {
      return html`<wui-flex justifyContent="center" alignItems="center">
        <wui-text variant="md-medium" color="primary">No exchanges available</wui-text>
      </wui-flex>`
    }

    return exchangesToShow.map(
      exchange => html`
        <wui-list-item
          type="secondary"
          boxColor="foregroundSecondary"
          @click=${() => this.onExchangePayment(exchange)}
          data-testid="exchange-option-${exchange.id}"
          ?chevron=${true}
          imageSrc=${ifDefined(exchange.imageUrl)}
        >
          <wui-text flexGrow="1" variant="lg-regular" color="primary">
            Pay with ${exchange.name}
          </wui-text>
        </wui-list-item>
      `
    )
  }

  private templateSeparator() {
    return html`<wui-separator text="or" bgColor="secondary"></wui-separator>`
  }

  private async onWalletPayment() {
    if (!this.namespace) {
      throw new Error('Namespace not found')
    }

    if (this.caipAddress) {
      RouterController.push('PayQuote')
    } else {
      await ConnectorController.connect()
      await ModalController.open({ view: 'PayQuote' })
    }
  }

  private onExchangePayment(exchange: Exchange) {
    PayController.setSelectedExchange(exchange)
    RouterController.push('PayQuote')
  }

  private async onDisconnect() {
    try {
      await ConnectionController.disconnect()
      await ModalController.open({ view: 'Pay' })
    } catch {
      console.error('Failed to disconnect')
      SnackController.showError('Failed to disconnect')
    }
  }

  private getWalletProperties({ namespace }: { namespace?: ChainNamespace }) {
    if (!namespace) {
      return {
        name: undefined,
        image: undefined
      }
    }

    const connectorId = this.activeConnectorIds[namespace]

    if (!connectorId) {
      return {
        name: undefined,
        image: undefined
      }
    }

    const connector = ConnectorController.getConnector({ id: connectorId, namespace })

    if (!connector) {
      return {
        name: undefined,
        image: undefined
      }
    }

    const connectorImage = AssetUtil.getConnectorImage(connector)

    return {
      name: connector.name,
      image: connectorImage
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-pay-view': W3mPayView
  }
}
