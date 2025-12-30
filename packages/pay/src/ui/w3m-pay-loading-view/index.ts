import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { type CaipAddress, type ChainNamespace, NumberUtil, ParseUtil } from '@reown/appkit-common'
import { AssetUtil, ChainController, ConnectorController } from '@reown/appkit-controllers'
import { UiHelperUtil, customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-image'
import '@reown/appkit-ui/wui-loading-spinner'
import '@reown/appkit-ui/wui-pulse'
import '@reown/appkit-ui/wui-separator'
import '@reown/appkit-ui/wui-text'
import { HelpersUtil } from '@reown/appkit-utils'

import { PayController } from '../../controllers/PayController.js'
import { formatAmount } from '../../utils/AssetUtil.js'
import { STEPS, type Step, TERMINAL_STATES } from './constants.js'
import styles from './styles.js'

// -- Types ------------------------------------------------- /
type PaymentStatus =
  | 'waiting'
  | 'pending'
  | 'success'
  | 'failure'
  | 'refund'
  | 'timeout'
  | 'submitted'

type StepStatus = 'completed' | 'pending' | 'failed'

interface StepV2 extends Step {
  status: StepStatus
}

// -- Constants --------------------------------------------- //
const STEP_COMPLETED_STATUSES: Record<string, PaymentStatus[]> = {
  received: ['pending', 'success', 'submitted'],
  processing: ['success', 'submitted'],
  sending: ['success', 'submitted']
}

const POLLING_INTERVAL_MS = 3000

@customElement('w3m-pay-loading-view')
export class W3mPayLoadingView extends LitElement {
  public static override styles = styles
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  private pollingInterval: NodeJS.Timeout | null = null

  // -- State & Properties -------------------------------- //
  @state() private paymentAsset = PayController.state.paymentAsset
  @state() private quoteStatus = PayController.state.quoteStatus
  @state() private quote = PayController.state.quote
  @state() private amount = PayController.state.amount
  @state() private namespace: ChainNamespace | undefined = undefined
  @state() private caipAddress: CaipAddress | undefined = undefined
  @state() private profileName: string | null = null
  @state() private activeConnectorIds = ConnectorController.state.activeConnectorIds
  @state() private selectedExchange = PayController.state.selectedExchange

  constructor() {
    super()
    this.initializeNamespace()
    this.unsubscribe.push(
      ...[
        PayController.subscribeKey('quoteStatus', val => (this.quoteStatus = val)),
        PayController.subscribeKey('quote', val => (this.quote = val)),
        ConnectorController.subscribeKey(
          'activeConnectorIds',
          ids => (this.activeConnectorIds = ids)
        ),
        PayController.subscribeKey('selectedExchange', val => (this.selectedExchange = val))
      ]
    )
  }

  public override connectedCallback() {
    super.connectedCallback()
    this.startPolling()
  }

  public override disconnectedCallback() {
    super.disconnectedCallback()
    this.stopPolling()
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" .padding=${['3', '0', '0', '0'] as const} gap="2">
        ${this.tokenTemplate()} ${this.paymentTemplate()} ${this.paymentLifecycleTemplate()}
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  private tokenTemplate() {
    const amount = formatAmount(this.amount || '0')
    const symbol = this.paymentAsset.metadata.symbol ?? 'Unknown'

    const allNetworks = ChainController.getAllRequestedCaipNetworks()
    const targetNetwork = allNetworks.find(net => net.caipNetworkId === this.paymentAsset.network)

    const hasTransactionFailed =
      this.quoteStatus === 'failure' ||
      this.quoteStatus === 'timeout' ||
      this.quoteStatus === 'refund'

    const hasTransactionSucceeded =
      this.quoteStatus === 'success' || this.quoteStatus === 'submitted'

    if (hasTransactionSucceeded) {
      return html`<wui-flex alignItems="center" justifyContent="center">
        <wui-flex justifyContent="center" alignItems="center" class="token-image success">
          <wui-icon name="checkmark" color="success" size="inherit"></wui-icon>
        </wui-flex>
      </wui-flex>`
    }

    if (hasTransactionFailed) {
      return html`<wui-flex alignItems="center" justifyContent="center">
        <wui-flex justifyContent="center" alignItems="center" class="token-image error">
          <wui-icon name="close" color="error" size="inherit"></wui-icon>
        </wui-flex>
      </wui-flex>`
    }

    return html`
      <wui-flex alignItems="center" justifyContent="center">
        <wui-flex class="token-image-container">
          <wui-pulse size="125px" rings="3" duration="4" opacity="0.5" variant="accent-primary">
            <wui-flex justifyContent="center" alignItems="center" class="token-image loading">
              <wui-icon name="paperPlaneTitle" color="accent-primary" size="inherit"></wui-icon>
            </wui-flex>
          </wui-pulse>

          <wui-flex
            justifyContent="center"
            alignItems="center"
            class="token-badge-container loading"
          >
            <wui-flex
              alignItems="center"
              justifyContent="center"
              gap="01"
              padding="1"
              class="token-badge"
            >
              <wui-image
                src=${ifDefined(AssetUtil.getNetworkImage(targetNetwork))}
                class="chain-image"
                size="mdl"
              ></wui-image>

              <wui-text variant="lg-regular" color="primary">${amount} ${symbol}</wui-text>
            </wui-flex>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `
  }

  private paymentTemplate() {
    return html`
      <wui-flex flexDirection="column" gap="2" .padding=${['0', '6', '0', '6'] as const}>
        ${this.renderPayment()}
        <wui-separator></wui-separator>
        ${this.renderWallet()}
      </wui-flex>
    `
  }

  private paymentLifecycleTemplate() {
    const stepsWithStatus = this.getStepsWithStatus()

    return html`
      <wui-flex flexDirection="column" padding="4" gap="2" class="payment-lifecycle-container">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">PAYMENT CYCLE</wui-text>

          ${this.renderPaymentCycleBadge()}
        </wui-flex>

        <wui-flex flexDirection="column" gap="5" .padding=${['2', '0', '2', '0'] as const}>
          ${stepsWithStatus.map(step => this.renderStep(step))}
        </wui-flex>
      </wui-flex>
    `
  }

  private renderPaymentCycleBadge() {
    const hasTransactionFailed =
      this.quoteStatus === 'failure' ||
      this.quoteStatus === 'timeout' ||
      this.quoteStatus === 'refund'

    const hasTransactionSucceeded =
      this.quoteStatus === 'success' || this.quoteStatus === 'submitted'

    if (hasTransactionFailed) {
      return html`
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge error"
          gap="1"
        >
          <wui-icon name="close" color="error" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="error">Failed</wui-text>
        </wui-flex>
      `
    }

    if (hasTransactionSucceeded) {
      return html`
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge success"
          gap="1"
        >
          <wui-icon name="checkmark" color="success" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="success">Completed</wui-text>
        </wui-flex>
      `
    }

    const timeEstimate = this.quote?.timeInSeconds ?? 0

    return html`
      <wui-flex alignItems="center" justifyContent="space-between" gap="3">
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge loading"
          gap="1"
        >
          <wui-icon name="clock" color="default" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="primary">Est. ${timeEstimate} sec</wui-text>
        </wui-flex>

        <wui-icon name="chevronBottom" color="default" size="xxs"></wui-icon>
      </wui-flex>
    `
  }

  private renderPayment() {
    const allNetworks = ChainController.getAllRequestedCaipNetworks()
    const targetNetwork = allNetworks.find(net => {
      const network = this.quote?.origin.currency.network

      if (!network) {
        return false
      }

      const { chainId } = ParseUtil.parseCaipNetworkId(network)

      return HelpersUtil.isLowerCaseMatch(net.id.toString(), chainId.toString())
    })

    const formatBigNumber = NumberUtil.formatNumber(this.quote?.origin.amount || '0', {
      decimals: this.quote?.origin.currency.metadata.decimals ?? 0
    }).toString()

    const formattedAmount = formatAmount(formatBigNumber)
    const symbol = this.quote?.origin.currency.metadata.symbol ?? 'Unknown'

    return html`
      <wui-flex
        alignItems="flex-start"
        justifyContent="space-between"
        .padding=${['3', '0', '3', '0'] as const}
      >
        <wui-text variant="lg-regular" color="secondary">Payment Method</wui-text>

        <wui-flex flexDirection="column" alignItems="flex-end" gap="1">
          <wui-flex alignItems="center" gap="01">
            <wui-text variant="lg-regular" color="primary">${formattedAmount}</wui-text>
            <wui-text variant="lg-regular" color="secondary">${symbol}</wui-text>
          </wui-flex>

          <wui-flex alignItems="center" gap="1">
            <wui-text variant="md-regular" color="secondary">on</wui-text>
            <wui-image
              src=${ifDefined(AssetUtil.getNetworkImage(targetNetwork))}
              size="xs"
            ></wui-image>
            <wui-text variant="md-regular" color="secondary">${targetNetwork?.name}</wui-text>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `
  }

  private renderWallet() {
    return html`
      <wui-flex
        alignItems="flex-start"
        justifyContent="space-between"
        .padding=${['3', '0', '3', '0'] as const}
      >
        <wui-text variant="lg-regular" color="secondary">Wallet</wui-text>

        ${this.renderWalletText()}
      </wui-flex>
    `
  }

  private renderWalletText() {
    const { image } = this.getWalletProperties({ namespace: this.namespace })

    const { address } = this.caipAddress ? ParseUtil.parseCaipAddress(this.caipAddress) : {}
    const exchangeName = this.selectedExchange?.name

    if (this.selectedExchange) {
      return html`
        <wui-flex alignItems="center" justifyContent="flex-end" gap="1">
          <wui-text variant="lg-regular" color="primary">${exchangeName}</wui-text>
          <wui-image src=${ifDefined(this.selectedExchange.imageUrl)} size="mdl"></wui-image>
        </wui-flex>
      `
    }

    return html`
      <wui-flex alignItems="center" justifyContent="flex-end" gap="1">
        <wui-text variant="lg-regular" color="primary">
          ${UiHelperUtil.getTruncateString({
            string: this.profileName || address || exchangeName || '',
            charsStart: this.profileName ? 16 : 4,
            charsEnd: this.profileName ? 0 : 6,
            truncate: this.profileName ? 'end' : 'middle'
          })}
        </wui-text>

        <wui-image src=${ifDefined(image)} size="mdl"></wui-image>
      </wui-flex>
    `
  }

  private getStepsWithStatus(): StepV2[] {
    const hasTransactionFailed =
      this.quoteStatus === 'failure' ||
      this.quoteStatus === 'timeout' ||
      this.quoteStatus === 'refund'

    if (hasTransactionFailed) {
      return STEPS.map(step => ({ ...step, status: 'failed' }))
    }

    return STEPS.map(step => {
      const completedStatuses = STEP_COMPLETED_STATUSES[step.id] ?? []
      const status = completedStatuses.includes(this.quoteStatus) ? 'completed' : 'pending'

      return { ...step, status }
    })
  }

  private renderStep({ title, icon, status }: StepV2) {
    const classes = {
      'step-icon-box': true,
      success: status === 'completed'
    }

    return html`
      <wui-flex alignItems="center" gap="3">
        <wui-flex justifyContent="center" alignItems="center" class="step-icon-container">
          <wui-icon name=${icon} color="default" size="mdl"></wui-icon>

          <wui-flex alignItems="center" justifyContent="center" class=${classMap(classes)}>
            ${this.renderStatusIndicator(status)}
          </wui-flex>
        </wui-flex>

        <wui-text variant="md-regular" color="primary">${title}</wui-text>
      </wui-flex>
    `
  }

  private renderStatusIndicator(status: StepStatus) {
    if (status === 'completed') {
      return html`<wui-icon size="sm" color="success" name="checkmark"></wui-icon>`
    }

    if (status === 'failed') {
      return html`<wui-icon size="sm" color="error" name="close"></wui-icon>`
    }

    if (status === 'pending') {
      return html`<wui-loading-spinner color="accent-primary" size="sm"></wui-loading-spinner>`
    }

    return null
  }

  private startPolling() {
    if (!this.pollingInterval) {
      this.fetchQuoteStatus()

      this.pollingInterval = setInterval(() => {
        this.fetchQuoteStatus()
      }, POLLING_INTERVAL_MS)
    }
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }

  private async fetchQuoteStatus() {
    const requestId = PayController.state.requestId

    if (!requestId || TERMINAL_STATES.includes(this.quoteStatus)) {
      this.stopPolling()
    } else {
      try {
        await PayController.fetchQuoteStatus({ requestId })

        if (TERMINAL_STATES.includes(this.quoteStatus)) {
          this.stopPolling()
        }
      } catch {
        this.stopPolling()
      }
    }
  }

  private initializeNamespace() {
    const namespace = ChainController.state.activeChain as ChainNamespace

    this.namespace = namespace
    this.caipAddress = ChainController.getAccountData(namespace)?.caipAddress
    this.profileName = ChainController.getAccountData(namespace)?.profileName ?? null
    this.unsubscribe.push(
      ChainController.subscribeChainProp(
        'accountState',
        accountState => {
          this.caipAddress = accountState?.caipAddress
          this.profileName = accountState?.profileName ?? null
        },
        namespace
      )
    )
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
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-pay-loading-view': W3mPayLoadingView
  }
}
