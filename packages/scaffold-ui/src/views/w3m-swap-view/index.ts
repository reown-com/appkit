import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'

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
import { CaipNetworksUtil } from '@reown/appkit-utils'
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
  @property({ type: Object }) initialParams = RouterController.state.data?.swapParams

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
    this.handleSwapParameters()
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe?.())
    clearInterval(this.interval)
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" .padding=${['0', 'l', 'l', 'l'] as const} gap="s">
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
      .disabled=${Boolean(target === 'toToken')}
      .onSetAmount=${this.handleChangeAmount.bind(this)}
      target=${target}
      .token=${token}
      .balance=${myToken?.quantity?.numeric}
      .price=${Number(myToken?.price || 0)}
      .marketValue=${(marketValue || 0).toString()}
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
    const loading = Boolean(this.loadingQuote || this.loadingPrices || this.loadingTransaction)
    const disabled = Boolean(loading || haveNoTokenSelected || haveNoAmount || this.inputError)

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

  private onSwapPreview() {
    if (this.fetchError) {
      SwapController.swapTokens()

      return
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

  /**
   * Processes token and amount parameters for swap
   */
  private async handleSwapParameters(): Promise<void> {
    // Get URL search parameters
    const toTokenSymbol = this.initialParams?.toToken
    const sourceTokenSymbol = this.initialParams?.sourceToken
    const amount = this.initialParams?.amount
    const chainId = this.initialParams?.chainId

    if (!toTokenSymbol || !sourceTokenSymbol || !amount || !chainId) {
      return
    }

    await this.handleChainSwitch(chainId)

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

    // Set tokens and amount
    await this.setSwapParameters(sourceTokenSymbol, toTokenSymbol, amount)
  }

  /**
   * Sets the swap parameters based on URL parameters
   * @param sourceTokenSymbol - The symbol of the source token
   * @param toTokenSymbol - The symbol of the destination token
   * @param amount - The amount to swap
   */
  private async setSwapParameters(
    sourceTokenSymbol: string | null,
    toTokenSymbol: string | null,
    amount: string | null
  ): Promise<void> {
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

    // Find source token by symbol
    if (sourceTokenSymbol) {
      const allTokens = [
        ...(SwapController.state.tokens || []),
        ...(SwapController.state.myTokensWithBalance || [])
      ]

      const sourceToken = allTokens.find(
        token => token.symbol.toLowerCase() === sourceTokenSymbol.toLowerCase()
      )

      if (sourceToken) {
        SwapController.setSourceToken(sourceToken)
      }
    }

    // Find destination token by symbol
    if (toTokenSymbol) {
      const allTokens = [
        ...(SwapController.state.tokens || []),
        ...(SwapController.state.myTokensWithBalance || [])
      ]

      const toToken = allTokens.find(
        token => token.symbol.toLowerCase() === toTokenSymbol.toLowerCase()
      )

      if (toToken) {
        SwapController.setToToken(toToken)
      }
    }

    // Set amount if provided
    if (amount && sourceTokenSymbol) {
      SwapController.setSourceTokenAmount(amount)
    }

    // Trigger swap calculation
    if (sourceTokenSymbol && toTokenSymbol && amount) {
      await SwapController.swapTokens()
    }

    // Clear the URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    urlParams.delete('sourceToken')
    urlParams.delete('toToken')
    urlParams.delete('amount')
    window.history.replaceState({}, '', window.location.pathname)
  }

  /**
   * Handles switching to the appropriate chain based on chainId
   * @param chainId - The chain ID to switch to
   */
  private async handleChainSwitch(chainId: string): Promise<void> {
    // Get requested networks to find the one with matching chainId
    const requestedNetworks = ChainController.getAllRequestedCaipNetworks()
    const targetNetwork = requestedNetworks.find(network => {
      return network.id.toString() === chainId
    })

    // If no matching network found, return
    if (!targetNetwork) {
      return
    }

    CaipNetworksUtil.onSwitchNetwork(targetNetwork)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-swap-view': W3mSwapView
  }
}
