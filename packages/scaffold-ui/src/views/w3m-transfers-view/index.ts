import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { type CaipAddress, type ChainNamespace, ParseUtil } from '@reown/appkit-common'
import {
  ChainController,
  ConnectionControllerUtil,
  ModalController,
  RouterController,
  SnackController,
  TransfersController,
  type TransfersToken
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-image'
import '@reown/appkit-ui/wui-input-text'
import '@reown/appkit-ui/wui-text'

import '../../partials/w3m-swap-input-skeleton/index.js'
import '../../partials/w3m-transfers-input/index.js'
import styles from './styles.js'

// -- Constants ----------------------------------------- //
const CHAIN_LABELS: Partial<Record<ChainNamespace, { label: string }>> = {
  eip155: { label: 'Connect EVM Wallet' },
  solana: { label: 'Connect Solana Wallet' },
  bip122: { label: 'Connect Bitcoin Wallet' },
  ton: { label: 'Connect TON Wallet' }
}

@customElement('w3m-transfers-view')
export class W3mTransfersView extends LitElement {
  public static override styles = styles

  private unsubscribe: (() => void)[] = []

  // Subscribe to TransfersController state
  @state() private quoteLoading = TransfersController.state.quoteLoading

  @state() private quote = TransfersController.state.quote

  @state() private quoteError = TransfersController.state.quoteError

  @state() private sourceToken: TransfersToken | undefined = TransfersController.state.sourceToken

  @state() private toToken: TransfersToken | undefined = TransfersController.state.toToken

  @state() private toTokenAmount = TransfersController.state.toTokenAmount

  @state() private recipientAddress = TransfersController.state.recipientAddress

  @state() private caipAddress: CaipAddress | undefined

  public constructor() {
    super()

    this.unsubscribe.push(
      TransfersController.subscribe(newState => {
        this.quoteLoading = newState.quoteLoading
        this.quote = newState.quote
        this.quoteError = newState.quoteError
        this.sourceToken = newState.sourceToken
        this.toToken = newState.toToken
        this.toTokenAmount = newState.toTokenAmount
        this.recipientAddress = newState.recipientAddress

        if (newState.quoteError) {
          console.log('Quote error:', newState.quoteError)
          SnackController.showError(newState.quoteError)
        }
      })
    )
  }

  public override async firstUpdated() {
    if (this.sourceToken) {
      const { chainNamespace } = ParseUtil.parseCaipNetworkId(this.sourceToken.caipNetworkId)
      this.caipAddress = ChainController.getAccountData(chainNamespace)?.caipAddress

      this.unsubscribe.push(
        ChainController.subscribeChainProp(
          'accountState',
          val => {
            this.caipAddress = val?.caipAddress
          },
          chainNamespace
        )
      )

      this.fetchQuote()
    }
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  public override render() {
    return html`
      <wui-flex flexDirection="column" .padding=${['0', '4', '4', '4'] as const} gap="3">
        ${this.quoteLoading ? this.templateLoading() : this.templateTransfer()}
      </wui-flex>
    `
  }

  private async fetchQuote() {
    let user: string | undefined

    if (this.sourceToken && this.toToken && this.toTokenAmount && this.recipientAddress) {
      if (this.caipAddress) {
        const { address } = ParseUtil.parseCaipAddress(this.caipAddress)
        user = address
      }

      const quote = await TransfersController.fetchQuote({
        user,
        sourceToken: this.sourceToken,
        toToken: this.toToken,
        recipient: this.recipientAddress,
        amount: this.toTokenAmount
      })

      console.log('Quote received:', quote)
    }
  }

  private templateTransfer() {
    return html`
      <wui-flex flexDirection="column" gap="3">
        <wui-flex
          flexDirection="column"
          alignItems="center"
          gap="2"
          class="transfer-inputs-container"
        >
          ${this.templateSourceToken()} ${this.templateToToken()}
        </wui-flex>
        ${this.quote ? this.templateDetails() : null} ${this.templateActionButton()}
      </wui-flex>
    `
  }

  private templateLoading() {
    return html`
      <wui-flex flexDirection="column" gap="4">
        <wui-flex flexDirection="column" alignItems="center" gap="2" class="swap-inputs-container">
          <w3m-swap-input-skeleton target="sourceToken"></w3m-swap-input-skeleton>
          <w3m-swap-input-skeleton target="toToken"></w3m-swap-input-skeleton>
        </wui-flex>
        ${this.templateActionButton()}
      </wui-flex>
    `
  }

  private templateSourceToken() {
    return html`<w3m-transfers-input
      .value=${ifDefined(this.quote?.origin.amountFormatted)}
      .disabled=${true}
      target="sourceToken"
      .token=${this.sourceToken}
    ></w3m-transfers-input>`
  }

  private templateToToken() {
    return html`<w3m-transfers-input
      .value=${this.toTokenAmount}
      .disabled=${true}
      target="toToken"
      .token=${this.toToken}
    ></w3m-transfers-input>`
  }

  private templateDetails() {
    if (!this.quote) {
      return null
    }

    return html`
      <wui-flex flexDirection="column" gap="2" class="details-container">
        ${this.templateTimeEstimate()} ${this.templateFees()}
      </wui-flex>
    `
  }

  private templateTimeEstimate() {
    if (!this.quote?.timeEstimate) {
      return null
    }

    const totalSeconds = this.quote.timeEstimate
    let timeText = ''

    if (totalSeconds < 60) {
      // Show seconds only if less than 60 seconds
      timeText = `~${totalSeconds}s`
    } else {
      // Show minutes and seconds for 60+ seconds
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      timeText = seconds > 0 ? `~${minutes}m ${seconds}s` : `~${minutes}m`
    }

    return html`
      <wui-flex
        justifyContent="space-between"
        alignItems="center"
        class="details-row"
        .padding=${['3', '4', '3', '4'] as const}
      >
        <wui-flex alignItems="center" gap="2">
          <wui-icon size="sm" color="default" name="clock"></wui-icon>
          <wui-text variant="sm-regular" color="secondary">Estimated time</wui-text>
        </wui-flex>
        <wui-text variant="sm-regular" color="primary">${timeText}</wui-text>
      </wui-flex>
    `
  }

  private templateFees() {
    if (!this.quote?.fees || this.quote.fees.length === 0) {
      return null
    }

    return html`
      <wui-flex flexDirection="column" gap="1">
        ${this.quote.fees.map(
          fee => html`
            <wui-flex
              justifyContent="space-between"
              alignItems="center"
              class="details-row"
              .padding=${['3', '4', '3', '4'] as const}
            >
              <wui-flex alignItems="center" gap="2">
                <wui-image
                  class="fee-token-image"
                  src=${ifDefined(fee.currency.logoUri)}
                ></wui-image>
                <wui-text variant="sm-regular" color="primary">${fee.label}</wui-text>
              </wui-flex>
              <wui-flex flexDirection="column" alignItems="flex-end" gap="0">
                <wui-text variant="sm-regular" color="primary">
                  ${fee.amountFormatted} ${fee.currency.symbol}
                </wui-text>
                ${fee.amountUsd
                  ? html`<wui-text variant="sm-regular" color="secondary">
                      $${fee.amountUsd}
                    </wui-text>`
                  : null}
              </wui-flex>
            </wui-flex>
          `
        )}
      </wui-flex>
    `
  }

  private templateActionButton() {
    const { label, loading, disabled, onClick } = this.getActionState()

    return html` <wui-flex gap="2">
      <wui-button
        data-testid="transfer-action-button"
        class="action-button"
        fullWidth
        size="lg"
        borderRadius="xs"
        variant="accent-primary"
        ?loading=${loading}
        ?disabled=${disabled}
        @click=${onClick}
      >
        ${label}
      </wui-button>
    </wui-flex>`
  }

  private onTransferPreview() {
    if (this.quote?.requestId) {
      RouterController.push('TransfersConfirmation')
    }
  }

  private async onConnect(namespace: ChainNamespace) {
    await ConnectionControllerUtil.connect({ namespace })
    await ModalController.open({ view: 'Transfers' })
  }

  private getActionState() {
    if (this.quoteError) {
      return {
        label: 'Choose another token',
        disabled: true,
        loading: false,
        onClick: this.noop
      }
    }

    if (!this.sourceToken) {
      return {
        label: 'Select token',
        disabled: true,
        loading: false,
        onClick: this.noop
      }
    }

    if (!this.caipAddress) {
      const { chainNamespace } = ParseUtil.parseCaipNetworkId(this.sourceToken.caipNetworkId)

      return {
        label: CHAIN_LABELS[chainNamespace]?.label ?? 'Connect Wallet',
        disabled: false,
        loading: false,
        onClick: () => this.onConnect(chainNamespace)
      }
    }

    if (!this.recipientAddress) {
      return {
        label: 'Invalid recipient',
        disabled: true,
        loading: false,
        onClick: this.noop
      }
    }

    if (this.quoteLoading) {
      return {
        label: 'Loading quote...',
        disabled: true,
        loading: true,
        onClick: this.noop
      }
    }

    return {
      label: 'Confirm',
      disabled: false,
      loading: false,
      onClick: () => this.onTransferPreview()
    }
  }

  private noop() {}
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-transfers-view': W3mTransfersView
  }
}
