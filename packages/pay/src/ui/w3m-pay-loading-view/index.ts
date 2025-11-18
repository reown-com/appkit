import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { AssetUtil, ChainController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-image'
import '@reown/appkit-ui/wui-loading-spinner'
import '@reown/appkit-ui/wui-pulse'
import '@reown/appkit-ui/wui-separator'
import '@reown/appkit-ui/wui-text'

import { PayController } from '../../controllers/PayController.js'
import { STEPS, type Step } from './mocks.js'
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

@customElement('w3m-pay-loading-view')
export class W3mPayLoadingView extends LitElement {
  public static override styles = styles
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private paymentAsset = PayController.state.paymentAsset
  @state() private paymentStatus: PaymentStatus = 'failure'

  constructor() {
    super()
    this.unsubscribe.push(() => null)
  }

  public override disconnectedCallback() {
    super.disconnectedCallback()
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
    const allNetworks = ChainController.getAllRequestedCaipNetworks()
    const targetNetwork = allNetworks.find(net => net.caipNetworkId === this.paymentAsset.network)

    return html`
      <wui-flex alignItems="center" justifyContent="center">
        <wui-flex class="token-image-container">
          <wui-pulse size="125px" rings="3" duration="4" opacity="0.5" variant="accent-primary">
            <wui-flex justifyContent="center" alignItems="center" class="token-image">
              <wui-icon name="paperPlaneTitle" color="accent-primary" size="inherit"></wui-icon>
            </wui-flex>
          </wui-pulse>

          <wui-flex justifyContent="center" alignItems="center" class="token-badge-container">
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

              <wui-text variant="lg-regular" color="primary">20 USDC</wui-text>
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

        ${this.renderPayment()}
      </wui-flex>
    `
  }

  private paymentLifecycleTemplate() {
    const stepsWithStatus = this.getStepsWithStatus()
    const completedCount = stepsWithStatus.filter(({ status }) => status === 'completed').length

    const totalSteps = STEPS.length

    return html`
      <wui-flex flexDirection="column" padding="4" gap="2" class="payment-lifecycle-container">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">PAYMENT CYCLE</wui-text>

          <wui-flex justifyContent="center" alignItems="center" class="payment-step-badge">
            <wui-text variant="sm-regular" color="primary">
              ${completedCount}/${totalSteps}
            </wui-text>
          </wui-flex>
        </wui-flex>

        <wui-flex flexDirection="column" gap="5" .padding=${['2', '0', '2', '0'] as const}>
          ${stepsWithStatus.map(step => this.renderStep(step))}
        </wui-flex>
      </wui-flex>
    `
  }

  private renderPayment() {
    const allNetworks = ChainController.getAllRequestedCaipNetworks()
    const targetNetwork = allNetworks.find(net => net.caipNetworkId === this.paymentAsset.network)

    return html`
      <wui-flex
        alignItems="flex-start"
        justifyContent="space-between"
        .padding=${['3', '0', '3', '0'] as const}
      >
        <wui-text variant="lg-regular" color="secondary">Paying</wui-text>

        <wui-flex flexDirection="column" alignItems="flex-end" gap="1">
          <wui-flex alignItems="center" gap="01">
            <wui-text variant="lg-regular" color="primary">20</wui-text>
            <wui-text variant="lg-regular" color="secondary">USDC</wui-text>
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

  private getStepsWithStatus(): StepV2[] {
    const isError =
      this.paymentStatus === 'failure' ||
      this.paymentStatus === 'timeout' ||
      this.paymentStatus === 'refund'

    if (isError) {
      return STEPS.map(step => ({ ...step, status: 'failed' }))
    }

    return STEPS.map(step => {
      const completedStatuses = STEP_COMPLETED_STATUSES[step.id] ?? []
      const status = completedStatuses.includes(this.paymentStatus) ? 'completed' : 'pending'

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
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-pay-loading-view': W3mPayLoadingView
  }
}
