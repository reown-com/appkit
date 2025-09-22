import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'

import { type CaipAddress, type CaipNetwork, NumberUtil } from '@reown/appkit-common'
import {
  ChainController,
  CoreHelperUtil,
  EventsController,
  ModalController,
  RouterController,
  SwapController,
  type SwapInputTarget,
  type SwapToken,
  getPreferredAccountType
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-icon-box'
import '@reown/appkit-ui/wui-text'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import type { SwapInputArguments } from '../../../../controllers/dist/types/src/controllers/SwapController.js'
import '../../partials/w3m-swap-details/index.js'
import '../../partials/w3m-swap-input-skeleton/index.js'
import '../../partials/w3m-swap-input/index.js'
import styles from './styles.js'

interface OnCaipAddressChangeParams {
  newCaipAddress?: CaipAddress
  resetSwapState: boolean
  initializeSwapState: boolean
}

interface OnCaipNetworkChangeParams {
  newCaipNetwork?: CaipNetwork
  resetSwapState: boolean
  initializeSwapState: boolean
}

@customElement('w3m-swap-view')
export class W3mSwapView extends LitElement {
  public static override styles = styles

  private unsubscribe: ((() => void) | undefined)[] = []

  // -- State & Properties -------------------------------- //
  @property({ type: Object }) initialParams = RouterController.state.data?.swap

  @state() private interval?: ReturnType<typeof setInterval>

  @state() private detailsOpen = false

  @state() private caipAddress = ChainController.getAccountData()?.caipAddress

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

  @state() private fetchError = SwapController.state.fetchError

  @state() private lastTokenPriceUpdate = 0

  private minTokenPriceUpdateInterval = 10_000

  // -- Lifecycle ----------------------------------------- //
  private subscribe({
    resetSwapState,
    initializeSwapState
  }: {
    resetSwapState: boolean
    initializeSwapState: boolean
  }) {
    return () => {
      ChainController.subscribeKey('activeCaipNetwork', newCaipNetwork =>
        this.onCaipNetworkChange({
          newCaipNetwork,
          resetSwapState,
          initializeSwapState
        })
      )
      ChainController.subscribeChainProp('accountState', val => {
        this.onCaipAddressChange({
          newCaipAddress: val?.caipAddress,
          resetSwapState,
          initializeSwapState
        })
      })
    }
  }
  public constructor() {
    super()
    this.subscribe({ resetSwapState: true, initializeSwapState: false })()
    this.unsubscribe.push(
      ...[
        this.subscribe({ resetSwapState: false, initializeSwapState: true }),
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
          this.fetchError = newState.fetchError

          if (newState.sourceToken && newState.toToken) {
            this.watchTokensAndValues()
          }
        })
      ]
    )
  }

  public override async firstUpdated() {
    SwapController.initializeState()
    this.watchTokensAndValues()
    await this.handleSwapParameters()
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe?.())
    clearInterval(this.interval)
    document?.removeEventListener('visibilitychange', this.visibilityChangeHandler)
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" .padding=${['0', '4', '4', '4'] as const} gap="3">
        ${this.initialized ? this.templateSwap() : this.templateLoading()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //

  private visibilityChangeHandler = () => {
    if (document?.hidden) {
      clearInterval(this.interval)
      this.interval = undefined
    } else {
      this.startTokenPriceInterval()
    }
  }

  private subscribeToVisibilityChange() {
    document?.removeEventListener('visibilitychange', this.visibilityChangeHandler)
    document?.addEventListener('visibilitychange', this.visibilityChangeHandler)
  }

  private startTokenPriceInterval = () => {
    if (
      this.interval &&
      Date.now() - this.lastTokenPriceUpdate < this.minTokenPriceUpdateInterval
    ) {
      return
    }

    // Quick fetch tokens and values if last update is more than 10 seconds ago
    if (
      this.lastTokenPriceUpdate &&
      Date.now() - this.lastTokenPriceUpdate > this.minTokenPriceUpdateInterval
    ) {
      this.fetchTokensAndValues()
    }
    clearInterval(this.interval)
    this.interval = setInterval(() => {
      this.fetchTokensAndValues()
    }, this.minTokenPriceUpdateInterval)
  }

  private watchTokensAndValues = () => {
    // Only fetch tokens and values if source and to token are set
    if (!this.sourceToken || !this.toToken) {
      return
    }

    this.subscribeToVisibilityChange()
    this.startTokenPriceInterval()
  }

  private fetchTokensAndValues() {
    SwapController.getNetworkTokenPrice()
    SwapController.getMyTokensWithBalance()
    SwapController.swapTokens()
    this.lastTokenPriceUpdate = Date.now()
  }

  private templateSwap() {
    return html`
      <wui-flex flexDirection="column" gap="3">
        <wui-flex flexDirection="column" alignItems="center" gap="2" class="swap-inputs-container">
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
        <wui-icon-box
          @click=${this.onSwitchTokens.bind(this)}
          icon="recycleHorizontal"
          size="md"
          variant="default"
        ></wui-icon-box>
      </wui-flex>
    `
  }

  private templateLoading() {
    return html`
      <wui-flex flexDirection="column" gap="4">
        <wui-flex flexDirection="column" alignItems="center" gap="2" class="swap-inputs-container">
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
    const maxValue = NumberUtil.bigNumber(balance || '0')
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

    return html` <wui-flex gap="2">
      <wui-button
        data-testid="swap-action-button"
        class="action-button"
        fullWidth
        size="lg"
        borderRadius="xs"
        variant="accent-primary"
        ?loading=${Boolean(loading)}
        ?disabled=${Boolean(disabled)}
        @click=${this.onSwapPreview.bind(this)}
      >
        ${this.actionButtonLabel()}
      </wui-button>
    </wui-flex>`
  }

  private onDebouncedGetSwapCalldata = CoreHelperUtil.debounce(async () => {
    await SwapController.swapTokens()
  }, 200)

  private async onSwitchTokens() {
    await SwapController.switchTokens()
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
          getPreferredAccountType(ChainController.state.activeChain) ===
          W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
      }
    })
    RouterController.push('SwapPreview')
  }
  /**
   * Processes token and amount parameters for swap
   */
  private async handleSwapParameters(): Promise<void> {
    if (!this.initialParams) {
      return
    }

    // Wait for initialization to complete
    if (!SwapController.state.initialized) {
      const waitForInitialization = new Promise<void>(resolve => {
        const unsubscribe = SwapController.subscribeKey('initialized', initialized => {
          if (initialized) {
            unsubscribe?.()
            resolve()
          }
        })
      })
      await waitForInitialization
    }

    await this.setSwapParameters(this.initialParams)
  }

  /**
   * Sets the swap parameters based on URL parameters
   * @param sourceTokenSymbol - The symbol of the source token
   * @param toTokenSymbol - The symbol of the destination token
   * @param amount - The amount to swap
   */
  private async setSwapParameters({
    amount,
    fromToken,
    toToken
  }: Omit<SwapInputArguments, 'caipNetworkId'>): Promise<void> {
    // Wait for token list to be available
    if (!SwapController.state.tokens || !SwapController.state.myTokensWithBalance) {
      const waitForTokens = new Promise<void>(resolve => {
        const unsubscribe = SwapController.subscribeKey('myTokensWithBalance', tokens => {
          if (tokens && tokens.length > 0) {
            unsubscribe?.()
            resolve()
          }
        })

        // Set a timeout to resolve anyway after 5 seconds
        setTimeout(() => {
          unsubscribe?.()
          resolve()
        }, 5000)
      })

      await waitForTokens
    }

    const allTokens = [
      ...(SwapController.state.tokens || []),
      ...(SwapController.state.myTokensWithBalance || [])
    ]

    // Find source token by symbol
    if (fromToken) {
      const token = allTokens.find(t => t.symbol.toLowerCase() === fromToken.toLowerCase())

      if (token) {
        SwapController.setSourceToken(token)
      }
    }

    // Find destination token by symbol
    if (toToken) {
      const token = allTokens.find(t => t.symbol.toLowerCase() === toToken.toLowerCase())

      if (token) {
        SwapController.setToToken(token)
      }
    }

    // Set amount if provided
    if (amount && !isNaN(Number(amount))) {
      SwapController.setSourceTokenAmount(amount)
    }
  }

  private onCaipAddressChange({
    newCaipAddress,
    resetSwapState,
    initializeSwapState
  }: OnCaipAddressChangeParams) {
    if (this.caipAddress !== newCaipAddress) {
      this.caipAddress = newCaipAddress

      if (resetSwapState) {
        SwapController.resetState()
      }

      if (initializeSwapState) {
        SwapController.initializeState()
      }
    }
  }

  private onCaipNetworkChange({
    newCaipNetwork,
    resetSwapState,
    initializeSwapState
  }: OnCaipNetworkChangeParams) {
    if (this.caipNetworkId !== newCaipNetwork?.caipNetworkId) {
      this.caipNetworkId = newCaipNetwork?.caipNetworkId

      if (resetSwapState) {
        SwapController.resetState()
      }

      if (initializeSwapState) {
        SwapController.initializeState()
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-swap-view': W3mSwapView
  }
}
