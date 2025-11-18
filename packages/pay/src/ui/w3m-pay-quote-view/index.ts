import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { type CaipAddress, type ChainNamespace, ParseUtil } from '@reown/appkit-common'
import {
  AssetUtil,
  ChainController,
  ConnectorController,
  CoreHelperUtil,
  ModalController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-text'
import '@reown/appkit-ui/wui-wallet-switch'

import { PayController } from '../../controllers/PayController.js'
import '../../partials/w3m-pay-fees-skeleton/index.js'
import '../../partials/w3m-pay-fees/index.js'
import '../../partials/w3m-pay-options-disabled/index.js'
import '../../partials/w3m-pay-options-skeleton/index.js'
import '../../partials/w3m-pay-options/index.js'
import { PAYMENT_OPTIONS } from './mocks.js'
import styles from './styles.js'

const NAMESPACE_ICONS = {
  eip155: 'ethereum',
  solana: 'solana',
  bip122: 'bitcoin',
  ton: 'ton'
} as const

const NAMESPACE_LABELS = {
  eip155: { icon: NAMESPACE_ICONS.eip155, label: 'EVM' },
  solana: { icon: NAMESPACE_ICONS.solana, label: 'Solana' },
  bip122: { icon: NAMESPACE_ICONS.bip122, label: 'Bitcoin' },
  ton: { icon: NAMESPACE_ICONS.ton, label: 'Ton' }
} as const

@customElement('w3m-pay-quote-view')
export class W3mPayQuoteView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private profileName = ChainController.getAccountData()?.profileName
  @state() private paymentAsset = PayController.state.paymentAsset
  @state() private namespace: ChainNamespace | undefined = undefined
  @state() private caipAddress: CaipAddress | undefined = undefined
  @state() private activeConnectorIds = ConnectorController.state.activeConnectorIds
  @state() private selectedPaymentAsset?: CaipAddress
  @state() private isQuoteLoading = false
  @state() private isTokensLoading = true

  public constructor() {
    super()
    this.initializeNamespace()
    this.unsubscribe.push(
      PayController.subscribeKey('paymentAsset', val => {
        this.paymentAsset = val
      })
    )
    this.unsubscribe.push(
      ConnectorController.subscribeKey(
        'activeConnectorIds',
        newActiveConnectorIds => (this.activeConnectorIds = newActiveConnectorIds)
      )
    )
  }

  public override disconnectedCallback() {
    super.disconnectedCallback()
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column">
        ${this.profileTemplate()}

        <wui-flex
          flexDirection="column"
          gap="4"
          class="payment-methods-container"
          .padding=${['4', '4', '5', '4'] as const}
        >
          ${this.paymentOptionsTemplate()} ${this.amountWithFeeTemplate()}

          <wui-flex
            alignItems="center"
            justifyContent="space-between"
            .padding=${['1', '0', '1', '0'] as const}
          >
            <wui-separator></wui-separator>
          </wui-flex>

          ${this.paymentActionsTemplate()}
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private profileTemplate() {
    const address = CoreHelperUtil.getPlainAddress(this.caipAddress)

    const { name, image } = this.getWalletProperties({ namespace: this.namespace })

    const { icon: chainIcon, label: chainLabel } =
      NAMESPACE_LABELS[this.namespace as keyof typeof NAMESPACE_LABELS] ?? {}

    return html`
      <wui-flex
        .padding=${['4', '3', '4', '3'] as const}
        alignItems="center"
        justifyContent="space-between"
        gap="2"
      >
        <wui-wallet-switch
          profileName=${this.profileName}
          address=${ifDefined(address)}
          imageSrc=${ifDefined(image)}
          alt=${ifDefined(name)}
          @click=${this.onConnectOtherWallet.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>

        <wui-wallet-switch
          profileName=${ifDefined(chainLabel)}
          address=${ifDefined(address)}
          icon=${ifDefined(chainIcon)}
          iconSize="xs"
          .enableGreenCircle=${false}
          alt=${ifDefined(chainLabel)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>
      </wui-flex>
    `
  }

  private initializeNamespace() {
    const paymentAsset = this.paymentAsset

    if (paymentAsset) {
      const { chainNamespace } = ParseUtil.parseCaipNetworkId(paymentAsset.network)

      this.namespace = chainNamespace
      this.caipAddress = ChainController.getAccountData(chainNamespace)?.caipAddress
      this.unsubscribe.push(
        ChainController.subscribeChainProp(
          'accountState',
          accountState => {
            this.caipAddress = accountState?.caipAddress
            this.profileName = accountState?.profileName
          },
          this.namespace
        )
      )
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

  private paymentOptionsTemplate() {
    return html`
      <wui-flex flexDirection="column" gap="2">
        <wui-text variant="sm-regular" color="secondary">CHOOSE PAYMENT OPTION</wui-text>

        <wui-flex class="pay-options-container">
          ${this.isTokensLoading
            ? html`<w3m-pay-options-disabled
                @click=${this.onConnectOtherWallet.bind(this)}
              ></w3m-pay-options-disabled>`
            : html`<w3m-pay-options
                .options=${PAYMENT_OPTIONS.slice(0, 2)}
                .selectedPaymentAsset=${ifDefined(this.selectedPaymentAsset)}
                .onSelect=${this.onSelectPaymentOption.bind(this)}
              ></w3m-pay-options>`}
        </wui-flex>
      </wui-flex>
    `
  }

  private amountWithFeeTemplate() {
    return html`
      ${this.isQuoteLoading
        ? html`<w3m-pay-fees-skeleton></w3m-pay-fees-skeleton>`
        : html`<w3m-pay-fees></w3m-pay-fees>`}
    `
  }

  private paymentActionsTemplate() {
    const isLoading = this.isQuoteLoading || this.isTokensLoading

    return html`
      <wui-flex alignItems="center" justifyContent="space-between">
        <wui-flex flexDirection="column" gap="1">
          <wui-text variant="md-regular" color="secondary">Order Total</wui-text>

          ${isLoading
            ? html`<wui-shimmer width="58px" height="32px" variant="light"></wui-shimmer>`
            : html`<wui-flex alignItems="center" gap="01">
                <wui-text variant="h4-regular" color="primary">20.30</wui-text>
                <wui-text variant="lg-regular" color="secondary">USDC</wui-text>
              </wui-flex>`}
        </wui-flex>

        <wui-button
          size="lg"
          variant="accent-primary"
          ?loading=${isLoading}
          ?disabled=${isLoading}
          @click=${this.onPay.bind(this)}
        >
          Pay
          ${isLoading
            ? null
            : html`<wui-icon
                name="arrowRight"
                color="inherit"
                size="sm"
                slot="iconRight"
              ></wui-icon>`}
        </wui-button>
      </wui-flex>
    `
  }

  private onSelectPaymentOption(selectedPaymentAsset: CaipAddress) {
    this.selectedPaymentAsset = selectedPaymentAsset
  }

  private async onConnectOtherWallet() {
    await ConnectorController.connect({ namespace: this.namespace })
    await ModalController.open({ view: 'PayQuote' })
  }

  private onPay() {
    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-pay-quote-view': W3mPayQuoteView
  }
}
