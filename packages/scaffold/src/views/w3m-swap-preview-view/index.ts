import { UiHelperUtil, customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'
import {
  AccountController,
  NetworkController,
  RouterController,
  SwapController,
  ConstantsUtil
} from '@web3modal/core'
import { state } from 'lit/decorators.js'

@customElement('w3m-swap-preview-view')
export class W3mSwapPreviewView extends LitElement {
  public static override styles = styles

  private unsubscribe: ((() => void) | undefined)[] = []

  // -- State & Properties -------------------------------- //
  @state() private detailsOpen = true

  @state() private approvalTransaction = SwapController.state.approvalTransaction

  @state() private swapTransaction = SwapController.state.swapTransaction

  @state() private sourceToken = SwapController.state.sourceToken

  @state() private sourceTokenAmount = SwapController.state.sourceTokenAmount ?? ''

  @state() private sourceTokenPriceInUSD = SwapController.state.sourceTokenPriceInUSD

  @state() private toToken = SwapController.state.toToken

  @state() private toTokenAmount = SwapController.state.toTokenAmount ?? ''

  @state() private toTokenPriceInUSD = SwapController.state.toTokenPriceInUSD

  @state() private caipNetwork = NetworkController.state.caipNetwork

  @state() private transactionLoading = SwapController.state.transactionLoading

  @state() private balanceSymbol = AccountController.state.balanceSymbol

  @state() private gasPriceInUSD = SwapController.state.gasPriceInUSD

  @state() private priceImpact = SwapController.state.priceImpact

  @state() private maxSlippage = SwapController.state.maxSlippage

  @state() private providerFee = SwapController.state.providerFee

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()

    this.unsubscribe.push(
      ...[
        AccountController.subscribeKey('balanceSymbol', newBalanceSymbol => {
          if (this.balanceSymbol !== newBalanceSymbol) {
            RouterController.goBack()
            // Maybe reset state as well?
          }
        }),
        NetworkController.subscribeKey('caipNetwork', newCaipNetwork => {
          if (this.caipNetwork !== newCaipNetwork) {
            this.caipNetwork = newCaipNetwork
          }
        }),
        SwapController.subscribe(newState => {
          this.approvalTransaction = newState.approvalTransaction
          this.swapTransaction = newState.swapTransaction
          this.sourceToken = newState.sourceToken
          this.gasPriceInUSD = newState.gasPriceInUSD
          this.toToken = newState.toToken
          this.transactionLoading = newState.transactionLoading
          this.gasPriceInUSD = newState.gasPriceInUSD
          this.toTokenPriceInUSD = newState.toTokenPriceInUSD
          this.sourceTokenAmount = newState.sourceTokenAmount ?? ''
          this.toTokenAmount = newState.toTokenAmount ?? ''
          this.priceImpact = newState.priceImpact
          this.maxSlippage = newState.maxSlippage
          this.providerFee = newState.providerFee
        })
      ]
    )
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" padding="l" gap="s">${this.templateSwap()}</wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private templateSwap() {
    const sourceTokenText = `${UiHelperUtil.formatNumberToLocalString(
      parseFloat(this.sourceTokenAmount)
    )} ${this.sourceToken?.symbol}`
    const toTokenText = `${UiHelperUtil.formatNumberToLocalString(
      parseFloat(this.toTokenAmount)
    )} ${this.toToken?.symbol}`

    const sourceTokenValue = parseFloat(this.sourceTokenAmount) * this.sourceTokenPriceInUSD
    const toTokenValue =
      parseFloat(this.toTokenAmount) * this.toTokenPriceInUSD - (this.gasPriceInUSD || 0)
    const sentPrice = UiHelperUtil.formatNumberToLocalString(sourceTokenValue)
    const receivePrice = UiHelperUtil.formatNumberToLocalString(toTokenValue)

    return html`
      <wui-flex flexDirection="column" alignItems="center" gap="l">
        <wui-flex class="preview-container" flexDirection="column" alignItems="flex-start" gap="l">
          <wui-flex
            class="preview-token-details-container"
            alignItems="center"
            justifyContent="space-between"
            gap="l"
          >
            <wui-flex flexDirection="column" alignItems="flex-start" gap="4xs">
              <wui-text variant="small-400" color="fg-150">Send</wui-text>
              <wui-text variant="paragraph-400" color="fg-100">$${sentPrice}</wui-text>
            </wui-flex>
            <wui-token-button
              flexDirection="row-reverse"
              text=${sourceTokenText}
              imageSrc=${this.sourceToken?.logoUri}
            >
            </wui-token-button>
          </wui-flex>
          <wui-icon name="recycleHorizontal" color="fg-200" size="md"></wui-icon>
          <wui-flex
            class="preview-token-details-container"
            alignItems="center"
            justifyContent="space-between"
            gap="l"
          >
            <wui-flex flexDirection="column" alignItems="flex-start" gap="4xs">
              <wui-text variant="small-400" color="fg-150">Receive</wui-text>
              <wui-text variant="paragraph-400" color="fg-100">$${receivePrice}</wui-text>
            </wui-flex>
            <wui-token-button
              flexDirection="row-reverse"
              text=${toTokenText}
              imageSrc=${this.toToken?.logoUri}
            >
            </wui-token-button>
          </wui-flex>
        </wui-flex>

        ${this.templateDetails()}

        <wui-flex flexDirection="row" alignItems="center" justifyContent="center" gap="xs">
          <wui-icon size="sm" color="fg-200" name="infoCircle"></wui-icon>
          <wui-text variant="small-400" color="fg-200">Review transaction carefully</wui-text>
        </wui-flex>

        <wui-flex
          class="action-buttons-container"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          gap="xs"
        >
          <button
            class="cancel-button"
            ?disabled=${this.transactionLoading}
            @click=${this.onCancelTransaction.bind(this)}
          >
            <wui-text variant="paragraph-600" color="fg-200">Cancel</wui-text>
          </button>
          <button
            class="swap-button"
            ?disabled=${this.transactionLoading}
            @click=${this.onSendTransaction.bind(this)}
          >
            ${this.transactionLoading
              ? html`<wui-loading-spinner color="inverse-100"></wui-loading-spinner>`
              : html`<wui-text variant="paragraph-600" color="inverse-100">
                  ${this.actionButtonLabel()}
                </wui-text>`}
          </button>
        </wui-flex>
      </wui-flex>
    `
  }

  private templateDetails() {
    const toTokenSwappedAmount =
      this.sourceTokenPriceInUSD && this.toTokenPriceInUSD
        ? (1 / this.toTokenPriceInUSD) * this.sourceTokenPriceInUSD
        : 0

    return html`
      <w3m-swap-details
        detailsOpen=${this.detailsOpen}
        sourceTokenSymbol=${this.sourceToken?.symbol}
        sourceTokenPrice=${this.sourceTokenPriceInUSD}
        toTokenSymbol=${this.toToken?.symbol}
        toTokenSwappedAmount=${toTokenSwappedAmount}
        gasPriceInUSD=${UiHelperUtil.formatNumberToLocalString(this.gasPriceInUSD, 3)}
        .priceImpact=${this.priceImpact}
        slippageRate=${ConstantsUtil.CONVERT_SLIPPAGE_TOLERANCE}
        .maxSlippage=${this.maxSlippage}
        providerFee=${this.providerFee}
      ></w3m-swap-details>
    `
  }

  private actionButtonLabel(): string {
    if (this.approvalTransaction) {
      return 'Approve'
    }

    return 'Swap'
  }

  private onCancelTransaction() {
    RouterController.goBack()
  }

  private onSendTransaction() {
    if (this.approvalTransaction) {
      SwapController.sendTransactionForApproval(this.approvalTransaction)
    } else {
      SwapController.sendTransactionForSwap(this.swapTransaction)
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-swap-preview-view': W3mSwapPreviewView
  }
}
