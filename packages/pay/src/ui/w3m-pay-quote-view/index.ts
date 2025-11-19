import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import {
  type Balance,
  type CaipAddress,
  type ChainNamespace,
  ParseUtil
} from '@reown/appkit-common'
import {
  type AccountState,
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
import { HelpersUtil } from '@reown/appkit-utils'

import { PayController } from '../../controllers/PayController.js'
import '../../partials/w3m-pay-fees-skeleton/index.js'
import '../../partials/w3m-pay-fees/index.js'
import '../../partials/w3m-pay-options-disabled/index.js'
import '../../partials/w3m-pay-options-skeleton/index.js'
import '../../partials/w3m-pay-options/index.js'
import type { PaymentAssetWithAmount } from '../../types/options.js'
import { formatBalanceToPaymentAsset } from '../../utils/AssetUtil.js'
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
  @state() private selectedPaymentAsset = PayController.state.selectedPaymentAsset
  @state() private isQuoteLoading = false
  @state() private isTokensLoading = PayController.state.isLoadingTokenBalances
  @state() private tokenBalances = PayController.state.tokenBalances

  public constructor() {
    super()
    this.unsubscribe.push(
      PayController.subscribeKey('paymentAsset', val => (this.paymentAsset = val))
    )
    this.unsubscribe.push(
      PayController.subscribeKey('tokenBalances', val => this.onTokenBalancesChanged(val))
    )
    this.unsubscribe.push(
      PayController.subscribeKey('isLoadingTokenBalances', val => (this.isTokensLoading = val))
    )
    this.unsubscribe.push(
      ConnectorController.subscribeKey(
        'activeConnectorIds',
        newActiveConnectorIds => (this.activeConnectorIds = newActiveConnectorIds)
      )
    )
    this.unsubscribe.push(
      PayController.subscribeKey('selectedPaymentAsset', val => (this.selectedPaymentAsset = val))
    )
    this.initializeNamespace()
    this.fetchTokens()
  }

  public override disconnectedCallback() {
    super.disconnectedCallback()
    this.resetState()
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
          ${this.paymentOptionsViewTemplate()} ${this.amountWithFeeTemplate()}

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
          accountState => this.onAccountStateChanged(accountState),
          this.namespace
        )
      )
    }
  }

  private async fetchTokens() {
    if (this.caipAddress && this.namespace) {
      const allNetworks = ChainController.getAllRequestedCaipNetworks()
      const targetNetwork = allNetworks.find(net => net.caipNetworkId === this.paymentAsset.network)

      await PayController.fetchTokens({
        caipAddress: this.caipAddress,
        caipNetwork: targetNetwork,
        namespace: this.namespace
      })

      // eslint-disable-next-line no-console
      console.log('FETCHED TOKENS >>', PayController.state.tokenBalances)
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

  private paymentOptionsViewTemplate() {
    return html`
      <wui-flex flexDirection="column" gap="2">
        <wui-text variant="sm-regular" color="secondary">CHOOSE PAYMENT OPTION</wui-text>
        <wui-flex class="pay-options-container">${this.paymentOptionsTemplate()}</wui-flex>
      </wui-flex>
    `
  }

  private paymentOptionsTemplate() {
    const paymentAssets = this.getPaymentAssetFromTokenBalances()

    if (this.isTokensLoading) {
      return html`<w3m-pay-options-skeleton></w3m-pay-options-skeleton>`
    }

    if (paymentAssets.length === 0) {
      return html`<w3m-pay-options-disabled
        @connectOtherWallet=${this.onConnectOtherWallet.bind(this)}
      ></w3m-pay-options-disabled>`
    }

    return html`<w3m-pay-options
      .options=${paymentAssets}
      .selectedPaymentAsset=${ifDefined(this.selectedPaymentAsset)}
      .onSelect=${(paymentAsset: PaymentAssetWithAmount) =>
        PayController.setSelectedPaymentAsset(paymentAsset)}
    ></w3m-pay-options>`
  }

  private amountWithFeeTemplate() {
    if (this.isQuoteLoading || !this.selectedPaymentAsset) {
      return html`<w3m-pay-fees-skeleton></w3m-pay-fees-skeleton>`
    }

    return html`<w3m-pay-fees></w3m-pay-fees>`
  }

  private paymentActionsTemplate() {
    const isLoading = this.isQuoteLoading || this.isTokensLoading
    const isDisabled = this.isQuoteLoading || this.isTokensLoading || !this.selectedPaymentAsset

    return html`
      <wui-flex alignItems="center" justifyContent="space-between">
        <wui-flex flexDirection="column" gap="1">
          <wui-text variant="md-regular" color="secondary">Order Total</wui-text>

          ${isLoading || isDisabled
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
          ?disabled=${isDisabled}
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

  private getPaymentAssetFromTokenBalances() {
    if (!this.namespace) {
      return []
    }

    const balances = this.tokenBalances[this.namespace] ?? []
    const paymentOptions = balances
      .map(balance => {
        try {
          return formatBalanceToPaymentAsset(balance)
        } catch (err) {
          return null
        }
      })
      .filter((option): option is PaymentAssetWithAmount => Boolean(option))

    return paymentOptions
  }

  private onTokenBalancesChanged(tokenBalances: Partial<Record<ChainNamespace, Balance[]>>) {
    this.tokenBalances = tokenBalances
    // eslint-disable-next-line no-console
    console.log('TOKEN BALANCES >>', tokenBalances)

    const [paymentAsset] = this.getPaymentAssetFromTokenBalances()

    if (paymentAsset) {
      PayController.setSelectedPaymentAsset(paymentAsset)
    }
  }

  private async onConnectOtherWallet() {
    await ConnectorController.connect({ namespace: this.namespace })
    await ModalController.open({ view: 'PayQuote' })
  }

  private onAccountStateChanged(accountState: AccountState | undefined) {
    const { address: oldAddress } = this.caipAddress
      ? ParseUtil.parseCaipAddress(this.caipAddress)
      : {}

    this.caipAddress = accountState?.caipAddress
    this.profileName = accountState?.profileName

    if (oldAddress) {
      const { address: newAddress } = this.caipAddress
        ? ParseUtil.parseCaipAddress(this.caipAddress)
        : {}

      if (!newAddress) {
        ModalController.close()
      } else if (!HelpersUtil.isLowerCaseMatch(newAddress, oldAddress)) {
        this.resetState()
        this.fetchTokens()
      }
    }
  }

  private async onPay() {
    const allNetworks = ChainController.getAllRequestedCaipNetworks()
    const targetNetwork = allNetworks.find(
      net => net.caipNetworkId === this.selectedPaymentAsset?.network
    )

    if (!targetNetwork) {
      throw new Error('Target network not found')
    }

    await ChainController.switchActiveNetwork(targetNetwork)
  }

  private resetState() {
    PayController.setSelectedPaymentAsset(null)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-pay-quote-view': W3mPayQuoteView
  }
}
