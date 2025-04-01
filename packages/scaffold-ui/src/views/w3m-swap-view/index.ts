import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { NumberUtil } from '@reown/appkit-common'
import {
  AccountController,
  ChainController,
  CoreHelperUtil,
  EventsController,
  ModalController,
  RouterController,
  SwapController,
  type SwapInputTarget,
  type SwapToken
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-text'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import '../../partials/w3m-swap-details/index.js'
import '../../partials/w3m-swap-input-skeleton/index.js'
import '../../partials/w3m-swap-input/index.js'
import styles from './styles.js'

@customElement('w3m-swap-view')
export class W3mSwapView extends LitElement {
  public static override styles = styles

  private unsubscribe: ((() => void) | undefined)[] = []

  // -- State & Properties -------------------------------- //
  @state() private interval?: ReturnType<typeof setInterval>

  @state() private detailsOpen = false

  @state() private caipNetworkId = ChainController.state.activeCaipNetwork?.caipNetworkId

  @state() private initialized = SwapController.state.initialized

  @state() private loadingQuote = SwapController.state.loadingQuote

  @state() private loadingPrices = SwapController.state.loadingPrices

  @state() private loadingTransaction = SwapController.state.loadingTransaction

  @state() private sourceToken = SwapController.state.sourceToken

  @state() private sourceTokenAmount = SwapController.state.sourceTokenAmount

  @state() private sourceTokenPriceInUSD = SwapController.state.sourceTokenPriceInUSD

  @state() private toToken = SwapController.state.toToken

  @state() private toTokenAmount = SwapController.state.toTokenAmount

  @state() private toTokenPriceInUSD = SwapController.state.toTokenPriceInUSD

  @state() private inputError = SwapController.state.inputError

  @state() private gasPriceInUSD = SwapController.state.gasPriceInUSD

  @state() private fetchError = SwapController.state.fetchError

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    ChainController.subscribeKey('activeCaipNetwork', newCaipNetwork => {
      if (this.caipNetworkId !== newCaipNetwork?.caipNetworkId) {
        this.caipNetworkId = newCaipNetwork?.caipNetworkId
        SwapController.resetState()
        SwapController.initializeState()
      }
    })
    this.unsubscribe.push(
      ...[
        ModalController.subscribeKey('open', isOpen => {
          if (!isOpen) {
            SwapController.resetState()
          }
        }),
        RouterController.subscribeKey('view', newRoute => {
          if (!newRoute.includes('Swap')) {
            SwapController.resetValues()
          }
        }),
        SwapController.subscribe(newState => {
          this.initialized = newState.initialized
          this.loadingQuote = newState.loadingQuote
          this.loadingPrices = newState.loadingPrices
          this.loadingTransaction = newState.loadingTransaction
          this.sourceToken = newState.sourceToken
          this.sourceTokenAmount = newState.sourceTokenAmount
          this.sourceTokenPriceInUSD = newState.sourceTokenPriceInUSD
          this.toToken = newState.toToken
          this.toTokenAmount = newState.toTokenAmount
          this.toTokenPriceInUSD = newState.toTokenPriceInUSD
          this.inputError = newState.inputError
          this.gasPriceInUSD = newState.gasPriceInUSD
          this.fetchError = newState.fetchError
        })
      ]
    )
  }

  public override firstUpdated() {
    SwapController.initializeState()
    this.watchTokensAndValues()
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe?.())
    clearInterval(this.interval)
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" .padding=${['0', 'l', 'l', 'l']} gap="s">
        ${this.initialized ? this.templateSwap() : this.templateLoading()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private watchTokensAndValues() {
    this.interval = setInterval(() => {
      SwapController.getNetworkTokenPrice()
      SwapController.getMyTokensWithBalance()
      SwapController.swapTokens()
    }, 10_000)
  }

  private templateSwap() {
    return html`
      <wui-flex flexDirection="column" gap="s">
        <wui-flex flexDirection="column" alignItems="center" gap="xs" class="swap-inputs-container">
          ${this.templateTokenInput('sourceToken', this.sourceToken)}
          ${this.templateTokenInput('toToken', this.toToken)} ${this.templateReplaceTokensButton()}
        </wui-flex>
        ${this.templateDetails()} ${this.templateActionButton()}
      </wui-flex>
    `
  }

  private actionButtonLabel(): string {
    if (this.fetchError) {
      return 'Swap'
    }

    if (!this.sourceToken || !this.toToken) {
      return 'Select token'
    }

    if (!this.sourceTokenAmount) {
      return 'Enter amount'
    }

    if (this.inputError) {
      return this.inputError
    }

    return 'Review swap'
  }

  private templateReplaceTokensButton() {
    return html`
      <wui-flex class="replace-tokens-button-container">
        <button @click=${this.onSwitchTokens.bind(this)}>
          <wui-icon name="recycleHorizontal" color="fg-250" size="lg"></wui-icon>
        </button>
      </wui-flex>
    `
  }

  private templateLoading() {
    return html`
      <wui-flex flexDirection="column" gap="l">
        <wui-flex flexDirection="column" alignItems="center" gap="xs" class="swap-inputs-container">
          <w3m-swap-input-skeleton target="sourceToken"></w3m-swap-input-skeleton>
          <w3m-swap-input-skeleton target="toToken"></w3m-swap-input-skeleton>
          ${this.templateReplaceTokensButton()}
        </wui-flex>
        ${this.templateActionButton()}
      </wui-flex>
    `
  }

  private templateTokenInput(target: SwapInputTarget, token?: SwapToken) {
    const myToken = SwapController.state.myTokensWithBalance?.find(
      ct => ct?.address === token?.address
    )
    const amount = target === 'toToken' ? this.toTokenAmount : this.sourceTokenAmount
    const price = target === 'toToken' ? this.toTokenPriceInUSD : this.sourceTokenPriceInUSD
    const marketValue = NumberUtil.parseLocalStringToNumber(amount) * price

    return html`<w3m-swap-input
      .value=${target === 'toToken' ? this.toTokenAmount : this.sourceTokenAmount}
      .disabled=${target === 'toToken'}
      .onSetAmount=${this.handleChangeAmount.bind(this)}
      target=${target}
      .token=${token}
      .balance=${myToken?.quantity?.numeric}
      .price=${myToken?.price}
      .marketValue=${marketValue}
      .onSetMaxValue=${this.onSetMaxValue.bind(this)}
    ></w3m-swap-input>`
  }

  private onSetMaxValue(target: SwapInputTarget, balance: string | undefined) {
    const token = target === 'sourceToken' ? this.sourceToken : this.toToken
    const isNetworkToken = token?.address === ChainController.getActiveNetworkTokenAddress()
    let value = '0'

    if (!balance) {
      value = '0'
      this.handleChangeAmount(target, value)

      return
    }

    if (!this.gasPriceInUSD) {
      value = balance
      this.handleChangeAmount(target, value)

      return
    }

    const amountOfTokenGasRequires = NumberUtil.bigNumber(this.gasPriceInUSD.toFixed(5)).div(
      this.sourceTokenPriceInUSD
    )
    const maxValue = isNetworkToken
      ? NumberUtil.bigNumber(balance).minus(amountOfTokenGasRequires)
      : NumberUtil.bigNumber(balance)

    this.handleChangeAmount(target, maxValue.gt(0) ? maxValue.toFixed(20) : '0')
  }

  private templateDetails() {
    if (!this.sourceToken || !this.toToken || this.inputError) {
      return null
    }

    return html`<w3m-swap-details .detailsOpen=${this.detailsOpen}></w3m-swap-details>`
  }

  private handleChangeAmount(target: SwapInputTarget, value: string) {
    SwapController.clearError()
    if (target === 'sourceToken') {
      SwapController.setSourceTokenAmount(value)
    } else {
      SwapController.setToTokenAmount(value)
    }
    this.onDebouncedGetSwapCalldata()
  }

  private templateActionButton() {
    const haveNoTokenSelected = !this.toToken || !this.sourceToken
    const haveNoAmount = !this.sourceTokenAmount
    const loading = this.loadingQuote || this.loadingPrices || this.loadingTransaction
    const disabled = loading || haveNoTokenSelected || haveNoAmount || this.inputError

    return html` <wui-flex gap="xs">
      <wui-button
        data-testid="swap-action-button"
        class="action-button"
        fullWidth
        size="lg"
        borderRadius="xs"
        variant=${haveNoTokenSelected ? 'neutral' : 'main'}
        .loading=${loading}
        .disabled=${disabled}
        @click=${this.onSwapPreview.bind(this)}
      >
        ${this.actionButtonLabel()}
      </wui-button>
    </wui-flex>`
  }

  private onDebouncedGetSwapCalldata = CoreHelperUtil.debounce(async () => {
    await SwapController.swapTokens()
  }, 200)

  private onSwitchTokens() {
    SwapController.switchTokens()
  }

  private async onSwapPreview() {
    if (this.fetchError) {
      await SwapController.swapTokens()
    }
    EventsController.sendEvent({
      type: 'track',
      event: 'INITIATE_SWAP',
      properties: {
        network: this.caipNetworkId || '',
        swapFromToken: this.sourceToken?.symbol || '',
        swapToToken: this.toToken?.symbol || '',
        swapFromAmount: this.sourceTokenAmount || '',
        swapToAmount: this.toTokenAmount || '',
        isSmartAccount:
          AccountController.state.preferredAccountType ===
          W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
      }
    })
    RouterController.push('SwapPreview')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-swap-view': W3mSwapView
  }
}
