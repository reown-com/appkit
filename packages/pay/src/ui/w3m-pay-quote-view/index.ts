import { LitElement, type PropertyValues, html } from 'lit'
import { state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import {
  type Balance,
  type CaipAddress,
  type CaipNetwork,
  type CaipNetworkId,
  type ChainNamespace,
  NumberUtil,
  ParseUtil
} from '@reown/appkit-common'
import {
  type AccountState,
  AssetUtil,
  ChainController,
  ConnectorController,
  CoreHelperUtil,
  ModalController,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-text'
import '@reown/appkit-ui/wui-wallet-switch'
import { HelpersUtil } from '@reown/appkit-utils'

import { PayController } from '../../controllers/PayController.js'
import '../../partials/w3m-pay-fees-skeleton/index.js'
import '../../partials/w3m-pay-fees/index.js'
import '../../partials/w3m-pay-options-empty/index.js'
import '../../partials/w3m-pay-options-skeleton/index.js'
import '../../partials/w3m-pay-options/index.js'
import type { PaymentAssetWithAmount } from '../../types/options.js'
import { formatAmount, formatBalanceToPaymentAsset } from '../../utils/AssetUtil.js'
import { getTransactionsSteps, getTransferStep } from '../../utils/PaymentUtil.js'
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
  @state() private profileName: string | null = null
  @state() private paymentAsset = PayController.state.paymentAsset
  @state() private namespace: ChainNamespace | undefined = undefined
  @state() private caipAddress: CaipAddress | undefined = undefined
  @state() private amount = PayController.state.amount
  @state() private recipient = PayController.state.recipient
  @state() private activeConnectorIds = ConnectorController.state.activeConnectorIds
  @state() private selectedPaymentAsset = PayController.state.selectedPaymentAsset
  @state() private selectedExchange = PayController.state.selectedExchange
  @state() private isFetchingQuote = PayController.state.isFetchingQuote
  @state() private quoteError = PayController.state.quoteError
  @state() private quote = PayController.state.quote
  @state() private isFetchingTokenBalances = PayController.state.isFetchingTokenBalances
  @state() private tokenBalances = PayController.state.tokenBalances
  @state() private isPaymentInProgress = PayController.state.isPaymentInProgress
  @state() private exchangeUrlForQuote = PayController.state.exchangeUrlForQuote
  @state() private completedTransactionsCount = 0

  public constructor() {
    super()
    this.unsubscribe.push(
      PayController.subscribeKey('paymentAsset', val => (this.paymentAsset = val))
    )
    this.unsubscribe.push(
      PayController.subscribeKey('tokenBalances', val => this.onTokenBalancesChanged(val))
    )
    this.unsubscribe.push(
      PayController.subscribeKey(
        'isFetchingTokenBalances',
        val => (this.isFetchingTokenBalances = val)
      )
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
    this.unsubscribe.push(
      PayController.subscribeKey('isFetchingQuote', val => (this.isFetchingQuote = val))
    )
    this.unsubscribe.push(PayController.subscribeKey('quoteError', val => (this.quoteError = val)))
    this.unsubscribe.push(PayController.subscribeKey('quote', val => (this.quote = val)))
    this.unsubscribe.push(PayController.subscribeKey('amount', val => (this.amount = val)))
    this.unsubscribe.push(PayController.subscribeKey('recipient', val => (this.recipient = val)))
    this.unsubscribe.push(
      PayController.subscribeKey('isPaymentInProgress', val => (this.isPaymentInProgress = val))
    )
    this.unsubscribe.push(
      PayController.subscribeKey('selectedExchange', val => (this.selectedExchange = val))
    )
    this.unsubscribe.push(
      PayController.subscribeKey('exchangeUrlForQuote', val => (this.exchangeUrlForQuote = val))
    )
    this.resetQuoteState()
    this.initializeNamespace()
    this.fetchTokens()
  }

  public override disconnectedCallback() {
    super.disconnectedCallback()
    this.resetAssetsState()
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  public override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties)

    const shouldFetchQuote = changedProperties.has('selectedPaymentAsset')

    if (shouldFetchQuote) {
      this.fetchQuote()
    }
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
    if (this.selectedExchange) {
      const amount = NumberUtil.formatNumber(this.quote?.origin.amount, {
        decimals: this.quote?.origin.currency.metadata.decimals ?? 0
      }).toString()

      return html`
        <wui-flex
          .padding=${['4', '3', '4', '3'] as const}
          alignItems="center"
          justifyContent="space-between"
          gap="2"
        >
          <wui-text variant="lg-regular" color="secondary">Paying with</wui-text>

          ${this.quote
            ? html`<wui-text variant="lg-regular" color="primary">
                ${NumberUtil.bigNumber(amount, { safe: true }).round(6).toString()}
                ${this.quote.origin.currency.metadata.symbol}
              </wui-text>`
            : html`<wui-shimmer width="80px" height="18px" variant="light"></wui-shimmer>`}
        </wui-flex>
      `
    }

    const address = CoreHelperUtil.getPlainAddress(this.caipAddress) ?? ''

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
          profileName=${ifDefined(this.profileName)}
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
          @click=${this.onConnectOtherWallet.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>
      </wui-flex>
    `
  }

  private initializeNamespace() {
    const namespace = ChainController.state.activeChain as ChainNamespace

    this.namespace = namespace
    this.caipAddress = ChainController.getAccountData(namespace)?.caipAddress
    this.profileName = ChainController.getAccountData(namespace)?.profileName ?? null
    this.unsubscribe.push(
      ChainController.subscribeChainProp(
        'accountState',
        accountState => this.onAccountStateChanged(accountState),
        namespace
      )
    )
  }

  private async fetchTokens() {
    if (this.namespace) {
      let caipNetwork: CaipNetwork | undefined = undefined

      if (this.caipAddress) {
        const { chainId, chainNamespace } = ParseUtil.parseCaipAddress(this.caipAddress)
        const caipNetworkId = `${chainNamespace}:${chainId}` as CaipNetworkId
        const allNetworks = ChainController.getAllRequestedCaipNetworks()
        caipNetwork = allNetworks.find(net => net.caipNetworkId === caipNetworkId)
      }

      await PayController.fetchTokens({
        caipAddress: this.caipAddress,
        caipNetwork,
        namespace: this.namespace
      })
    }
  }

  private fetchQuote() {
    if (this.amount && this.recipient && this.selectedPaymentAsset && this.paymentAsset) {
      const { address } = this.caipAddress ? ParseUtil.parseCaipAddress(this.caipAddress) : {}

      PayController.fetchQuote({
        amount: this.amount.toString(),
        address,
        sourceToken: this.selectedPaymentAsset,
        toToken: this.paymentAsset,
        recipient: this.recipient
      })
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

    // eslint-disable-next-line no-console
    if (this.isFetchingTokenBalances) {
      return html`<w3m-pay-options-skeleton></w3m-pay-options-skeleton>`
    }

    if (paymentAssets.length === 0) {
      return html`<w3m-pay-options-empty
        @connectOtherWallet=${this.onConnectOtherWallet.bind(this)}
      ></w3m-pay-options-empty>`
    }

    const classes = {
      disabled: this.isFetchingQuote
    }

    return html`<w3m-pay-options
      class=${classMap(classes)}
      .options=${paymentAssets}
      .selectedPaymentAsset=${ifDefined(this.selectedPaymentAsset)}
      .onSelect=${this.onSelectedPaymentAssetChanged.bind(this)}
    ></w3m-pay-options>`
  }

  private amountWithFeeTemplate() {
    if (this.isFetchingQuote || !this.selectedPaymentAsset || this.quoteError) {
      return html`<w3m-pay-fees-skeleton></w3m-pay-fees-skeleton>`
    }

    return html`<w3m-pay-fees></w3m-pay-fees>`
  }

  private paymentActionsTemplate() {
    const isLoading = this.isFetchingQuote || this.isFetchingTokenBalances
    const isDisabled =
      this.isFetchingQuote ||
      this.isFetchingTokenBalances ||
      !this.selectedPaymentAsset ||
      Boolean(this.quoteError)

    const amount = NumberUtil.formatNumber(this.quote?.origin.amount ?? 0, {
      decimals: this.quote?.origin.currency.metadata.decimals ?? 0
    }).toString()

    if (this.selectedExchange) {
      if (isLoading || isDisabled) {
        return html`
          <wui-shimmer width="100%" height="48px" variant="light" ?rounded=${true}></wui-shimmer>
        `
      }

      return html`<wui-button
        size="lg"
        fullWidth
        variant="accent-secondary"
        @click=${this.onPayWithExchange.bind(this)}
      >
        ${`Continue in ${this.selectedExchange.name}`}

        <wui-icon name="arrowRight" color="inherit" size="sm" slot="iconRight"></wui-icon>
      </wui-button>`
    }

    return html`
      <wui-flex alignItems="center" justifyContent="space-between">
        <wui-flex flexDirection="column" gap="1">
          <wui-text variant="md-regular" color="secondary">Order Total</wui-text>

          ${isLoading || isDisabled
            ? html`<wui-shimmer width="58px" height="32px" variant="light"></wui-shimmer>`
            : html`<wui-flex alignItems="center" gap="01">
                <wui-text variant="h4-regular" color="primary">${formatAmount(amount)}</wui-text>

                <wui-text variant="lg-regular" color="secondary">
                  ${this.quote?.origin.currency.metadata.symbol || 'Unknown'}
                </wui-text>
              </wui-flex>`}
        </wui-flex>

        ${this.actionButtonTemplate({ isLoading, isDisabled })}
      </wui-flex>
    `
  }

  private actionButtonTemplate(params: { isLoading: boolean; isDisabled: boolean }) {
    const allTransactionSteps = getTransactionsSteps(this.quote)

    const { isLoading, isDisabled } = params

    let label = 'Pay'

    const isApprovalRequired =
      allTransactionSteps.length > 1 && this.completedTransactionsCount === 0

    if (isApprovalRequired) {
      label = 'Approve'
    }

    return html`
      <wui-button
        size="lg"
        variant="accent-primary"
        ?loading=${isLoading || this.isPaymentInProgress}
        ?disabled=${isDisabled || this.isPaymentInProgress}
        @click=${() => {
          if (allTransactionSteps.length > 0) {
            this.onSendTransactions()
          } else {
            this.onTransfer()
          }
        }}
      >
        ${label}
        ${isLoading
          ? null
          : html`<wui-icon
              name="arrowRight"
              color="inherit"
              size="sm"
              slot="iconRight"
            ></wui-icon>`}
      </wui-button>
    `
  }

  private getPaymentAssetFromTokenBalances() {
    if (!this.namespace) {
      return []
    }

    const balances = this.tokenBalances[this.namespace] ?? []

    const paymentOptionsWithFormattedBalances = balances
      .map(balance => {
        try {
          return formatBalanceToPaymentAsset(balance)
        } catch (err) {
          return null
        }
      })
      .filter((option): option is PaymentAssetWithAmount => Boolean(option))

    const paymentOptionsToShow = paymentOptionsWithFormattedBalances.filter(option => {
      const { chainId: optionChainId } = ParseUtil.parseCaipNetworkId(option.network)
      const { chainId: paymentAssetChainId } = ParseUtil.parseCaipNetworkId(
        this.paymentAsset.network
      )

      if (HelpersUtil.isLowerCaseMatch(option.asset, this.paymentAsset.asset)) {
        return true
      }

      if (this.selectedExchange) {
        return !HelpersUtil.isLowerCaseMatch(
          optionChainId.toString(),
          paymentAssetChainId.toString()
        )
      }

      return true
    })

    return paymentOptionsToShow
  }

  private onTokenBalancesChanged(tokenBalances: Partial<Record<ChainNamespace, Balance[]>>) {
    this.tokenBalances = tokenBalances

    const [paymentAsset] = this.getPaymentAssetFromTokenBalances()

    if (paymentAsset) {
      PayController.setSelectedPaymentAsset(paymentAsset)
    }
  }

  private async onConnectOtherWallet() {
    await ConnectorController.connect()
    await ModalController.open({ view: 'PayQuote' })
  }

  private onAccountStateChanged(accountState: AccountState | undefined) {
    const { address: oldAddress } = this.caipAddress
      ? ParseUtil.parseCaipAddress(this.caipAddress)
      : {}

    this.caipAddress = accountState?.caipAddress
    this.profileName = accountState?.profileName ?? null

    if (oldAddress) {
      const { address: newAddress } = this.caipAddress
        ? ParseUtil.parseCaipAddress(this.caipAddress)
        : {}

      if (!newAddress) {
        ModalController.close()
      } else if (!HelpersUtil.isLowerCaseMatch(newAddress, oldAddress)) {
        this.resetAssetsState()
        this.resetQuoteState()
        this.fetchTokens()
      }
    }
  }

  private onSelectedPaymentAssetChanged(paymentAsset: PaymentAssetWithAmount | null) {
    if (!this.isFetchingQuote) {
      PayController.setSelectedPaymentAsset(paymentAsset)
    }
  }

  private async onTransfer() {
    const transferStep = getTransferStep(this.quote)

    if (transferStep) {
      // This is just a sanity check to ensure the quote asset is the same as the selected payment asset
      const isQuoteAssetSameAsSelectedPaymentAsset = HelpersUtil.isLowerCaseMatch(
        this.selectedPaymentAsset?.asset,
        transferStep.deposit.currency
      )

      if (!isQuoteAssetSameAsSelectedPaymentAsset) {
        throw new Error('Quote asset is not the same as the selected payment asset')
      }

      const currentAmount = this.selectedPaymentAsset?.amount ?? '0'
      const amountToTransfer = NumberUtil.formatNumber(transferStep.deposit.amount, {
        decimals: this.selectedPaymentAsset?.metadata.decimals ?? 0
      }).toString()

      const hasEnoughFunds = NumberUtil.bigNumber(currentAmount).gte(amountToTransfer)

      if (!hasEnoughFunds) {
        SnackController.showError('Insufficient funds')

        return
      }

      if (this.quote && this.selectedPaymentAsset && this.caipAddress && this.namespace) {
        const { address: fromAddress } = ParseUtil.parseCaipAddress(this.caipAddress)

        await PayController.onTransfer({
          chainNamespace: this.namespace,
          fromAddress,
          toAddress: transferStep.deposit.receiver,
          amount: amountToTransfer,
          paymentAsset: this.selectedPaymentAsset
        })

        PayController.setRequestId(transferStep.requestId)
        RouterController.push('PayLoading')
      }
    }
  }

  private async onSendTransactions() {
    const currentAmount = this.selectedPaymentAsset?.amount ?? '0'
    const amountToSwap = NumberUtil.formatNumber(this.quote?.origin.amount ?? 0, {
      decimals: this.selectedPaymentAsset?.metadata.decimals ?? 0
    }).toString()

    const hasEnoughFunds = NumberUtil.bigNumber(currentAmount).gte(amountToSwap)

    if (!hasEnoughFunds) {
      SnackController.showError('Insufficient funds')

      return
    }

    const allTransactionSteps = getTransactionsSteps(this.quote)

    const [transactionStep] = getTransactionsSteps(this.quote, this.completedTransactionsCount)

    if (transactionStep && this.namespace) {
      await PayController.onSendTransaction({
        namespace: this.namespace as ChainNamespace,
        transactionStep
      })

      this.completedTransactionsCount += 1

      const hasCompletedAllTransactions =
        this.completedTransactionsCount === allTransactionSteps.length

      if (hasCompletedAllTransactions) {
        PayController.setRequestId(transactionStep.requestId)
        RouterController.push('PayLoading')
      }
    }
  }

  private onPayWithExchange() {
    if (this.exchangeUrlForQuote) {
      const popupWindow = CoreHelperUtil.returnOpenHref(
        '',
        'popupWindow',
        'scrollbar=yes,width=480,height=720'
      )

      if (!popupWindow) {
        throw new Error('Could not create popup window')
      }

      popupWindow.location.href = this.exchangeUrlForQuote

      const transactionStep = getTransferStep(this.quote)

      if (transactionStep) {
        PayController.setRequestId(transactionStep.requestId)
      }

      PayController.initiatePayment()
      RouterController.push('PayLoading')
    }
  }

  private resetAssetsState() {
    PayController.setSelectedPaymentAsset(null)
  }

  private resetQuoteState() {
    PayController.resetQuoteState()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-pay-quote-view': W3mPayQuoteView
  }
}
