import { customElement, formatNumberToLocalString } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'
import {
  AccountController,
  NetworkController,
  RouterController,
  ConvertController,
  ConstantsUtil
} from '@web3modal/core'
import { state } from 'lit/decorators.js'

@customElement('w3m-convert-preview-view')
export class W3mConvertPreviewView extends LitElement {
  public static override styles = styles

  private unsubscribe: ((() => void) | undefined)[] = []

  // -- State & Properties -------------------------------- //
  @state() private detailsOpen = true

  @state() private approvalTransaction = ConvertController.state.approvalTransaction

  @state() private convertTransaction = ConvertController.state.convertTransaction

  @state() private sourceToken = ConvertController.state.sourceToken

  @state() private sourceTokenAmount = ConvertController.state.sourceTokenAmount ?? ''

  @state() private sourceTokenPriceInUSD = ConvertController.state.sourceTokenPriceInUSD

  @state() private toToken = ConvertController.state.toToken

  @state() private toTokenAmount = ConvertController.state.toTokenAmount ?? ''

  @state() private toTokenPriceInUSD = ConvertController.state.toTokenPriceInUSD

  @state() private caipNetwork = NetworkController.state.caipNetwork

  @state() private transactionLoading = ConvertController.state.transactionLoading

  @state() private balanceSymbol = AccountController.state.balanceSymbol

  @state() private gasPriceInUSD = ConvertController.state.gasPriceInUSD

  @state() private priceImpact = ConvertController.state.priceImpact

  @state() private maxSlippage = ConvertController.state.maxSlippage

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
        ConvertController.subscribe(newState => {
          this.approvalTransaction = newState.approvalTransaction
          this.convertTransaction = newState.convertTransaction
          this.sourceToken = newState.sourceToken
          this.gasPriceInUSD = newState.gasPriceInUSD
          this.toToken = newState.toToken
          this.transactionLoading = newState.transactionLoading
          this.gasPriceInUSD = newState.gasPriceInUSD
          this.transactionLoading = newState.transactionLoading
          this.toTokenPriceInUSD = newState.toTokenPriceInUSD
          this.sourceTokenAmount = newState.sourceTokenAmount ?? ''
          this.toTokenAmount = newState.toTokenAmount ?? ''
          this.priceImpact = newState.priceImpact
          this.maxSlippage = newState.maxSlippage
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
    const sourceTokenText = `${formatNumberToLocalString(parseFloat(this.sourceTokenAmount))} ${this
      .sourceToken?.symbol}`
    const toTokenText = `${formatNumberToLocalString(parseFloat(this.toTokenAmount))} ${this.toToken
      ?.symbol}`

    const sourceTokenValue = parseFloat(this.sourceTokenAmount) * this.sourceTokenPriceInUSD
    const toTokenValue =
      parseFloat(this.toTokenAmount) * this.toTokenPriceInUSD - (this.gasPriceInUSD || 0)
    const sentPrice = formatNumberToLocalString(sourceTokenValue)
    const receivePrice = formatNumberToLocalString(toTokenValue)

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
            class="convert-button"
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
    const toTokenConvertedAmount =
      this.sourceTokenPriceInUSD && this.toTokenPriceInUSD
        ? (1 / this.toTokenPriceInUSD) * this.sourceTokenPriceInUSD
        : 0

    return html`
      <w3m-convert-details
        detailsOpen=${this.detailsOpen}
        sourceTokenSymbol=${this.sourceToken?.symbol}
        sourceTokenPrice=${this.sourceTokenPriceInUSD}
        toTokenSymbol=${this.toToken?.symbol}
        toTokenConvertedAmount=${toTokenConvertedAmount}
        gasPriceInUSD=${formatNumberToLocalString(this.gasPriceInUSD, 3)}
        .priceImpact=${this.priceImpact}
        slippageRate=${ConstantsUtil.CONVERT_SLIPPAGE_TOLERANCE}
        .maxSlippage=${this.maxSlippage}
      ></w3m-convert-details>
    `
  }

  private actionButtonLabel(): string {
    if (this.approvalTransaction) {
      return 'Approve'
    }

    return 'Convert'
  }

  private onCancelTransaction() {
    RouterController.goBack()
  }

  private onSendTransaction() {
    if (this.approvalTransaction) {
      ConvertController.sendTransactionForApproval(this.approvalTransaction)
    } else {
      ConvertController.sendTransactionForConvert(this.convertTransaction)
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-convert-preview-view': W3mConvertPreviewView
  }
}
