import { customElement, formatNumberToLocalString } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'
import {
  ConvertController,
  RouterController,
  CoreHelperUtil,
  NetworkController,
  ModalController,
  ConstantsUtil
} from '@web3modal/core'
import { NumberUtil } from '@web3modal/common'
import type { TokenInfo } from '@web3modal/core/src/utils/ConvertApiUtil.js'

type Target = 'sourceToken' | 'toToken'

@customElement('w3m-convert-view')
export class W3mConvertView extends LitElement {
  public static override styles = styles

  private unsubscribe: ((() => void) | undefined)[] = []

  // -- State & Properties -------------------------------- //
  @state() private interval?: NodeJS.Timeout

  @state() private detailsOpen = false

  @state() private caipNetworkId = NetworkController.state.caipNetwork?.id

  @state() private initialized = ConvertController.state.initialized

  @state() private loading = ConvertController.state.loading

  @state() private loadingPrices = ConvertController.state.loadingPrices

  @state() private sourceToken = ConvertController.state.sourceToken

  @state() private sourceTokenAmount = ConvertController.state.sourceTokenAmount

  @state() private sourceTokenPriceInUSD = ConvertController.state.sourceTokenPriceInUSD

  @state() private toToken = ConvertController.state.toToken

  @state() private toTokenAmount = ConvertController.state.toTokenAmount

  @state() private toTokenPriceInUSD = ConvertController.state.toTokenPriceInUSD

  @state() private inputError = ConvertController.state.inputError

  @state() private gasPriceInUSD = ConvertController.state.gasPriceInUSD

  @state() private priceImpact = ConvertController.state.priceImpact

  @state() private maxSlippage = ConvertController.state.maxSlippage

  @state() private transactionLoading = ConvertController.state.transactionLoading

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()

    NetworkController.subscribeKey('caipNetwork', newCaipNetwork => {
      if (this.caipNetworkId !== newCaipNetwork?.id) {
        this.caipNetworkId = newCaipNetwork?.id
        ConvertController.resetTokens()
        ConvertController.resetValues()
        ConvertController.initializeState()
      }
    })

    this.unsubscribe.push(
      ...[
        ModalController.subscribeKey('open', isOpen => {
          if (!isOpen) {
            ConvertController.resetValues()
          }
        }),
        RouterController.subscribeKey('view', newRoute => {
          if (!newRoute.includes('Convert')) {
            ConvertController.resetValues()
          }
        }),
        ConvertController.subscribeKey('sourceToken', newSourceToken => {
          this.sourceToken = newSourceToken
        }),
        ConvertController.subscribeKey('toToken', newToToken => {
          this.toToken = newToToken
        }),
        ConvertController.subscribe(newState => {
          this.initialized = newState.initialized
          this.loading = newState.loading
          this.loadingPrices = newState.loadingPrices
          this.transactionLoading = newState.transactionLoading
          this.sourceToken = newState.sourceToken
          this.sourceTokenAmount = newState.sourceTokenAmount
          this.sourceTokenPriceInUSD = newState.sourceTokenPriceInUSD
          this.toToken = newState.toToken
          this.toTokenAmount = newState.toTokenAmount
          this.toTokenPriceInUSD = newState.toTokenPriceInUSD
          this.inputError = newState.inputError
          this.gasPriceInUSD = newState.gasPriceInUSD
          this.priceImpact = newState.priceImpact
          this.maxSlippage = newState.maxSlippage
        })
      ]
    )

    this.watchTokensAndValues()
  }

  public override firstUpdated() {
    if (!this.initialized) {
      ConvertController.initializeState()
    }
  }

  public override disconnectedCallback() {
    ConvertController.setLoading(false)
    this.unsubscribe.forEach(unsubscribe => unsubscribe?.())
    clearInterval(this.interval)
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" padding="l" gap="s">
        ${this.initialized ? this.templateSwap() : this.templateLoading()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private watchTokensAndValues() {
    this.interval = setInterval(() => {
      ConvertController.getNetworkTokenPrice()
      ConvertController.getMyTokensWithBalance()
      ConvertController.refreshConvertValues()
    }, 5000)
  }

  private templateSwap() {
    return html`
      <wui-flex flexDirection="column" gap="l">
        <wui-flex
          flexDirection="column"
          alignItems="center"
          gap="xs"
          class="convert-inputs-container"
        >
          ${this.templateTokenInput('sourceToken', this.sourceToken)}
          ${this.templateTokenInput('toToken', this.toToken)} ${this.templateReplaceTokensButton()}
        </wui-flex>
        ${this.templateDetails()} ${this.templateActionButton()}
      </wui-flex>
    `
  }

  private actionButtonLabel(): string {
    if (this.inputError) {
      return this.inputError
    }

    return 'Review convert'
  }

  private templateReplaceTokensButton() {
    return html`
      <button class="replace-tokens-button" @click=${this.onSwitchTokens.bind(this)}>
        <wui-icon name="recycleHorizontal" color="fg-250" size="lg"></wui-icon>
      </button>
    `
  }

  private templateLoading() {
    return html`<wui-flex
      flexGrow="1"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      .padding=${['3xl', 'xl', '3xl', 'xl'] as const}
      gap="xl"
    >
      <wui-icon-box
        backgroundColor="glass-005"
        background="gray"
        iconColor="fg-200"
        icon="swapHorizontalRoundedBold"
        size="lg"
        ?border=${true}
        borderColor="wui-color-bg-125"
      ></wui-icon-box>

      <wui-loading-hexagon></wui-loading-hexagon>
    </wui-flex>`
  }

  private templateTokenInput(target: Target, token?: TokenInfo) {
    const myToken = ConvertController.state.myTokensWithBalance?.[token?.address ?? '']
    const amount = target === 'toToken' ? this.toTokenAmount : this.sourceTokenAmount
    const price = target === 'toToken' ? this.toTokenPriceInUSD : this.sourceTokenPriceInUSD
    let value = parseFloat(amount) * price

    if (target === 'toToken') {
      value -= this.gasPriceInUSD || 0
    }

    return html`<w3m-convert-input
      .value=${target === 'toToken' ? this.toTokenAmount : this.sourceTokenAmount}
      ?disabled=${this.loading && target === 'toToken'}
      .onSetAmount=${this.handleChangeAmount.bind(this)}
      target=${target}
      .token=${token}
      .balance=${myToken?.balance}
      .price=${this.sourceTokenPriceInUSD}
      .marketValue=${isNaN(value) ? '' : formatNumberToLocalString(value)}
      .onSetMaxValue=${this.onSetMaxValue.bind(this)}
    ></w3m-convert-input>`
  }

  private onSetMaxValue(target: Target, balance: string | undefined) {
    const token = target === 'sourceToken' ? this.sourceToken : this.toToken
    const isNetworkToken = token?.address === ConstantsUtil.NATIVE_TOKEN_ADDRESS

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

    const amountOfTokenGasRequires = NumberUtil.bigNumber(this.gasPriceInUSD.toFixed(5)).dividedBy(
      this.sourceTokenPriceInUSD
    )
    const maxValue = isNetworkToken
      ? NumberUtil.bigNumber(balance).minus(amountOfTokenGasRequires)
      : NumberUtil.bigNumber(balance)

    this.handleChangeAmount(target, maxValue.isGreaterThan(0) ? maxValue.toFixed(20) : '0')
  }

  private templateDetails() {
    if (this.loading || this.inputError) {
      return null
    }

    if (!this.sourceToken || !this.toToken || !this.sourceTokenAmount || !this.toTokenAmount) {
      return null
    }

    const toTokenConvertedAmount =
      this.sourceTokenPriceInUSD && this.toTokenPriceInUSD
        ? (1 / this.toTokenPriceInUSD) * this.sourceTokenPriceInUSD
        : 0

    return html`
      <w3m-convert-details
        .detailsOpen=${this.detailsOpen}
        sourceTokenSymbol=${this.sourceToken?.symbol}
        sourceTokenPrice=${this.sourceTokenPriceInUSD}
        toTokenSymbol=${this.toToken?.symbol}
        toTokenConvertedAmount=${toTokenConvertedAmount}
        gasPriceInUSD=${this.gasPriceInUSD}
        .priceImpact=${this.priceImpact}
        slippageRate=${0.5}
        .maxSlippage=${this.maxSlippage}
      ></w3m-convert-details>
    `
  }

  private handleChangeAmount(target: Target, value: string) {
    ConvertController.clearError()
    if (target === 'sourceToken') {
      ConvertController.setSourceTokenAmount(value)
    } else {
      ConvertController.setToTokenAmount(value)
    }
    this.onDebouncedGetSwapCalldata()
  }

  private templateActionButton() {
    const haveNoTokenSelected = !this.toToken || !this.sourceToken
    const loading = this.loading || this.loadingPrices || this.transactionLoading

    return html` <wui-flex gap="xs">
      <wui-button
        class="action-button"
        ?fullWidth=${true}
        size="lg"
        borderRadius="xs"
        variant=${haveNoTokenSelected ? 'shade' : 'fill'}
        .loading=${loading}
        .disabled=${loading || haveNoTokenSelected || this.inputError}
        @click=${this.onConvertPreview}
      >
        ${this.actionButtonLabel()}
      </wui-button>
    </wui-flex>`
  }

  private onDebouncedGetSwapCalldata = CoreHelperUtil.debounce(async () => {
    await ConvertController.convertTokens()
  }, 500)

  private onSwitchTokens() {
    ConvertController.switchTokens()
  }

  private onConvertPreview() {
    RouterController.push('ConvertPreview')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-convert-view': W3mConvertView
  }
}
