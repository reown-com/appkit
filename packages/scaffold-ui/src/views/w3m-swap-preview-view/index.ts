import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { NumberUtil } from '@reown/appkit-common'
import { ChainController, RouterController, SwapController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-text'
import '@reown/appkit-ui/wui-token-button'

import '../../partials/w3m-swap-details/index.js'
import styles from './styles.js'

@customElement('w3m-swap-preview-view')
export class W3mSwapPreviewView extends LitElement {
  public static override styles = styles

  private unsubscribe: ((() => void) | undefined)[] = []

  // -- State & Properties -------------------------------- //
  @state() private interval?: ReturnType<typeof setInterval>

  @state() private detailsOpen = true

  @state() private approvalTransaction = SwapController.state.approvalTransaction

  @state() private swapTransaction = SwapController.state.swapTransaction

  @state() private sourceToken = SwapController.state.sourceToken

  @state() private sourceTokenAmount = SwapController.state.sourceTokenAmount ?? ''

  @state() private sourceTokenPriceInUSD = SwapController.state.sourceTokenPriceInUSD

  @state() private balanceSymbol = ChainController.getAccountData()?.balanceSymbol

  @state() private toToken = SwapController.state.toToken

  @state() private toTokenAmount = SwapController.state.toTokenAmount ?? ''

  @state() private toTokenPriceInUSD = SwapController.state.toTokenPriceInUSD

  @state() private caipNetwork = ChainController.state.activeCaipNetwork

  @state() private inputError = SwapController.state.inputError

  @state() private loadingQuote = SwapController.state.loadingQuote

  @state() private loadingApprovalTransaction = SwapController.state.loadingApprovalTransaction

  @state() private loadingBuildTransaction = SwapController.state.loadingBuildTransaction

  @state() private loadingTransaction = SwapController.state.loadingTransaction

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()

    this.unsubscribe.push(
      ...[
        ChainController.subscribeChainProp('accountState', val => {
          if (val?.balanceSymbol !== this.balanceSymbol) {
            RouterController.goBack()
          }
        }),
        ChainController.subscribeKey('activeCaipNetwork', newCaipNetwork => {
          if (this.caipNetwork !== newCaipNetwork) {
            this.caipNetwork = newCaipNetwork
          }
        }),
        SwapController.subscribe(newState => {
          this.approvalTransaction = newState.approvalTransaction
          this.swapTransaction = newState.swapTransaction
          this.sourceToken = newState.sourceToken
          this.toToken = newState.toToken
          this.toTokenPriceInUSD = newState.toTokenPriceInUSD
          this.sourceTokenAmount = newState.sourceTokenAmount ?? ''
          this.toTokenAmount = newState.toTokenAmount ?? ''
          this.inputError = newState.inputError
          if (newState.inputError) {
            RouterController.goBack()
          }
          this.loadingQuote = newState.loadingQuote
          this.loadingApprovalTransaction = newState.loadingApprovalTransaction
          this.loadingBuildTransaction = newState.loadingBuildTransaction
          this.loadingTransaction = newState.loadingTransaction
        })
      ]
    )
  }

  public override firstUpdated() {
    SwapController.getTransaction()
    this.refreshTransaction()
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe?.())
    clearInterval(this.interval)
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" .padding=${['0', '4', '4', '4']} gap="3">
        ${this.templateSwap()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private refreshTransaction() {
    this.interval = setInterval(() => {
      if (!SwapController.getApprovalLoadingState()) {
        SwapController.getTransaction()
      }
    }, 10_000)
  }

  private templateSwap() {
    const sourceTokenText = `${NumberUtil.formatNumberToLocalString(
      parseFloat(this.sourceTokenAmount)
    )} ${this.sourceToken?.symbol}`
    const toTokenText = `${NumberUtil.formatNumberToLocalString(
      parseFloat(this.toTokenAmount)
    )} ${this.toToken?.symbol}`

    const sourceTokenValue = parseFloat(this.sourceTokenAmount) * this.sourceTokenPriceInUSD
    const toTokenValue = parseFloat(this.toTokenAmount) * this.toTokenPriceInUSD
    const sentPrice = NumberUtil.formatNumberToLocalString(sourceTokenValue)
    const receivePrice = NumberUtil.formatNumberToLocalString(toTokenValue)

    const loading =
      this.loadingQuote ||
      this.loadingBuildTransaction ||
      this.loadingTransaction ||
      this.loadingApprovalTransaction

    return html`
      <wui-flex flexDirection="column" alignItems="center" gap="4">
        <wui-flex class="preview-container" flexDirection="column" alignItems="flex-start" gap="4">
          <wui-flex
            class="preview-token-details-container"
            alignItems="center"
            justifyContent="space-between"
            gap="4"
          >
            <wui-flex flexDirection="column" alignItems="flex-start" gap="01">
              <wui-text variant="sm-regular" color="secondary">Send</wui-text>
              <wui-text variant="md-regular" color="primary">$${sentPrice}</wui-text>
            </wui-flex>
            <wui-token-button
              flexDirection="row-reverse"
              text=${sourceTokenText}
              imageSrc=${this.sourceToken?.logoUri}
            >
            </wui-token-button>
          </wui-flex>
          <wui-icon name="recycleHorizontal" color="default" size="md"></wui-icon>
          <wui-flex
            class="preview-token-details-container"
            alignItems="center"
            justifyContent="space-between"
            gap="4"
          >
            <wui-flex flexDirection="column" alignItems="flex-start" gap="01">
              <wui-text variant="sm-regular" color="secondary">Receive</wui-text>
              <wui-text variant="md-regular" color="primary">$${receivePrice}</wui-text>
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

        <wui-flex flexDirection="row" alignItems="center" justifyContent="center" gap="2">
          <wui-icon size="sm" color="default" name="info"></wui-icon>
          <wui-text variant="sm-regular" color="secondary">Review transaction carefully</wui-text>
        </wui-flex>

        <wui-flex
          class="action-buttons-container"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          gap="2"
        >
          <wui-button
            class="cancel-button"
            fullWidth
            size="lg"
            borderRadius="xs"
            variant="neutral-secondary"
            @click=${this.onCancelTransaction.bind(this)}
          >
            <wui-text variant="md-medium" color="secondary">Cancel</wui-text>
          </wui-button>
          <wui-button
            class="action-button"
            fullWidth
            size="lg"
            borderRadius="xs"
            variant="accent-primary"
            ?loading=${loading}
            ?disabled=${loading}
            @click=${this.onSendTransaction.bind(this)}
          >
            <wui-text variant="md-medium" color="invert"> ${this.actionButtonLabel()} </wui-text>
          </wui-button>
        </wui-flex>
      </wui-flex>
    `
  }

  private templateDetails() {
    if (!this.sourceToken || !this.toToken || this.inputError) {
      return null
    }

    return html`<w3m-swap-details .detailsOpen=${this.detailsOpen}></w3m-swap-details>`
  }

  private actionButtonLabel(): string {
    if (this.loadingApprovalTransaction) {
      return 'Approving...'
    }

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
