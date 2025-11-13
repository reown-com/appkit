/* eslint-disable no-console */
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { type CaipAddress, type ChainNamespace, ParseUtil } from '@reown/appkit-common'
import {
  AssetUtil,
  ChainController,
  ConnectionControllerUtil,
  ConnectorController,
  type Exchange,
  ModalController,
  NetworkUtil,
  RouterController,
  SnackController,
  type TransferStatus,
  TransfersController,
  type TransfersToken
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-image'
import '@reown/appkit-ui/wui-input-text'
import '@reown/appkit-ui/wui-list-item'
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

const EXPECTED_STATUSES: TransferStatus['status'][] = ['pending', 'submitted', 'success']

@customElement('w3m-transfers-view')
export class W3mTransfersView extends LitElement {
  public static override styles = styles

  private unsubscribe: (() => void)[] = []

  @state() private methods = TransfersController.state.methods

  @state() private exchanges = TransfersController.state.exchanges

  @state() private exchangesLoading = TransfersController.state.exchangesLoading

  @state() private quoteLoading = TransfersController.state.quoteLoading

  @state() private quote = TransfersController.state.quote

  @state() private quoteError = TransfersController.state.quoteError

  @state() private polling = TransfersController.state.polling

  @state() private pollingStatus: TransferStatus['status'] = 'waiting'

  @state() private network = ChainController.state.activeCaipNetwork

  @state() private sourceToken: TransfersToken | undefined = TransfersController.state.sourceToken

  @state() private toToken: TransfersToken | undefined = TransfersController.state.toToken

  @state() private toTokenAmount = TransfersController.state.toTokenAmount

  @state() private recipientAddress = TransfersController.state.recipientAddress

  @state() private caipAddress: CaipAddress | undefined

  @state() private activeConnectorIds = ConnectorController.state.activeConnectorIds

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        TransfersController.subscribe(newState => {
          this.methods = newState.methods
          this.quoteLoading = newState.quoteLoading
          this.exchanges = newState.exchanges
          this.exchangesLoading = newState.exchangesLoading
          this.quoteError = newState.quoteError
          this.sourceToken = newState.sourceToken
          this.toToken = newState.toToken
          this.toTokenAmount = newState.toTokenAmount
          this.recipientAddress = newState.recipientAddress
          this.polling = newState.polling

          if (newState.quoteError) {
            SnackController.showError(newState.quoteError)
          }
        }),
        TransfersController.subscribeKey('quote', val => {
          this.quote = val
          this.fetchExchanges()
        }),
        ChainController.subscribeKey('activeCaipNetwork', val => {
          this.network = val
        }),
        ConnectorController.subscribeKey('activeConnectorIds', ids => {
          this.activeConnectorIds = ids
        })
      ]
    )
  }

  public override firstUpdated() {
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
    let user: string | undefined = undefined

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
        ${this.quote ? this.templateDetails() : null} ${this.templateExchanges()}
        ${this.templateWallet()}
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

  private templateExchanges() {
    if (!this.methods.includes('cex') || !this.sourceToken) {
      return null
    }

    if (this.exchangesLoading) {
      return html`<wui-flex flexDirection="column" alignItems="center" gap="4" padding="4">
        <wui-text variant="lg-medium" align="center" color="primary">
          Loading exchanges...
        </wui-text>
      </wui-flex>`
    }

    return this.exchanges.length > 0
      ? this.exchanges.map(
          exchange =>
            html`<wui-list-item
              @click=${() => this.onExchangeClick(exchange)}
              chevron
              variant="image"
              imageSrc=${exchange.imageUrl}
            >
              <wui-text variant="md-regular" color="primary"> Pay with ${exchange.name} </wui-text>
            </wui-list-item>`
        )
      : html`<wui-flex flexDirection="column" alignItems="center" gap="4" padding="4">
          <wui-text variant="lg-medium" align="center" color="primary">
            No exchanges support this asset on this network
          </wui-text>
        </wui-flex>`
  }

  private templateWallet() {
    if (!this.sourceToken || !this.methods.includes('wallet')) {
      return null
    }

    const { label, loading, disabled, onClick } = this.getActionState()

    if (disabled) {
      return null
    }

    const { chainNamespace } = ParseUtil.parseCaipNetworkId(this.sourceToken.caipNetworkId)

    const connectorId = this.activeConnectorIds[chainNamespace] ?? ''
    const connector = ConnectorController.getConnector({
      id: connectorId,
      namespace: chainNamespace
    })
    const connectorImage = AssetUtil.getConnectorImage(connector)

    return html`<wui-list-item
      variant="icon"
      iconVariant="overlay"
      ?rounded=${true}
      @click=${onClick}
      ?chevron=${true}
      ?loading=${loading}
      icon=${ifDefined(connectorImage ? undefined : 'wallet')}
      imageSrc=${ifDefined(connectorImage)}
      data-testid="transfers-wallet-payment-option"
    >
      <wui-text variant="md-regular" color="primary">${label}</wui-text>
    </wui-list-item>`
  }

  private async onExchangeClick({ id: exchangeId }: Exchange) {
    if (this.sourceToken && this.quote) {
      const exchangeResult = await TransfersController.handlePayWithExchange({
        exchangeId,
        asset: this.sourceToken,
        amount: this.quote.origin.amountFormatted,
        recipient: this.quote.depositAddress
      })

      await TransfersController.pollStatus(this.quote.requestId, {
        expectedStatuses: EXPECTED_STATUSES,
        onStatusChange: status => {
          if (status !== 'timeout') {
            exchangeResult?.popupWindow.close()
          }

          this.onStatusChange(status)
        },
        maxPollingAttempts: 30,
        pollingInterval: 6000
      })
    }
  }

  private async fetchExchanges() {
    if (this.quote && this.sourceToken && this.methods.includes('cex')) {
      await TransfersController.fetchExchanges({
        asset: this.sourceToken,
        amount: this.quote.origin.amountFormatted
      })
    }
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

  private async onTransfer() {
    try {
      if (!this.quote?.requestId) {
        throw new Error('No quote request ID')
      }

      if (!this.sourceToken) {
        throw new Error('No source token')
      }

      const { chainNamespace: sourceChainNamespace } = ParseUtil.parseCaipNetworkId(
        this.sourceToken.caipNetworkId
      )

      console.log('this.quote.destination.amountFormatted', {
        namespace: sourceChainNamespace,
        token: this.sourceToken,
        recipient: this.quote.depositAddress,
        amount: this.quote.destination.amountFormatted
      })
      await TransfersController.sendToken({
        namespace: sourceChainNamespace,
        token: this.sourceToken,
        recipient: this.quote.depositAddress,
        amount: this.quote.origin.amountFormatted
      })

      console.log('EXECUTED TX!')
      await TransfersController.pollStatus(this.quote.requestId, {
        expectedStatuses: EXPECTED_STATUSES,
        onStatusChange: this.onStatusChange.bind(this)
      })

      console.log('POLLING STATUS!')
    } catch (err) {
      const errMessage =
        err instanceof Error ? err.message : 'Failed to send transaction. Please try again.'
      SnackController.showError(errMessage)
    }
  }

  private onStatusChange(status: TransferStatus['status']) {
    this.pollingStatus = status
    console.log('ON STATUS CHANGE!', status)
    if (EXPECTED_STATUSES.includes(status)) {
      console.log('PUSHING TO CONFIRMATION!')
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

    if (this.pollingStatus === 'timeout') {
      return {
        label: 'Transfer failed',
        disabled: true,
        loading: false,
        onClick: this.noop
      }
    }

    if (this.polling) {
      return {
        label: 'Confirming...',
        disabled: false,
        loading: true,
        onClick: this.noop
      }
    }

    if (this.quoteLoading) {
      return {
        label: 'Loading quote...',
        disabled: false,
        loading: true,
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

    if (this.network?.caipNetworkId !== this.sourceToken.caipNetworkId) {
      const toNetwork = ChainController.getCaipNetworkById(this.sourceToken.caipNetworkId)

      if (!toNetwork) {
        throw new Error('Network not found')
      }

      return {
        label: `Switch to ${toNetwork.name}`,
        disabled: false,
        loading: false,
        onClick: () => NetworkUtil.onSwitchNetwork({ network: toNetwork })
      }
    }

    const { chainNamespace: sourceChainNamespace } = ParseUtil.parseCaipNetworkId(
      this.sourceToken.caipNetworkId
    )
    const connectorId = this.activeConnectorIds[sourceChainNamespace] ?? ''
    const connector = ConnectorController.getConnector({
      id: connectorId,
      namespace: sourceChainNamespace
    })

    return {
      label: `Pay with ${connector?.name ?? 'Wallet'}`,
      disabled: false,
      loading: false,
      onClick: () => this.onTransfer()
    }
  }

  private noop() {
    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-transfers-view': W3mTransfersView
  }
}
