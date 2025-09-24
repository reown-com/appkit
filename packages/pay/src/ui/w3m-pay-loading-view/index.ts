import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import {
  AssetUtil,
  ChainController,
  ConnectionController,
  ConnectorController,
  ModalController,
  ThemeController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-loading-thumbnail'
import '@reown/appkit-ui/wui-text'
import '@reown/appkit-ui/wui-wallet-image'

import { PayController } from '../../controllers/PayController.js'
import styles from './styles.js'

// Define payment states
type PaymentState = 'in-progress' | 'completed' | 'error'

const EXCHANGE_STATUS_CHECK_INTERVAL = 4000

@customElement('w3m-pay-loading-view')
export class W3mPayLoadingView extends LitElement {
  public static override styles = styles

  // -- State & Properties -------------------------------- //
  @state() private loadingMessage = ''
  @state() private subMessage = ''
  @state() private paymentState: PaymentState = 'in-progress'
  private exchangeSubscription?: ReturnType<typeof setInterval>

  constructor() {
    super()
    this.paymentState = PayController.state.isPaymentInProgress ? 'in-progress' : 'completed'
    this.updateMessages()
    this.setupSubscription()
    this.setupExchangeSubscription()
  }

  public override disconnectedCallback() {
    clearInterval(this.exchangeSubscription)
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${['7', '5', '5', '5'] as const}
        gap="9"
      >
        <wui-flex justifyContent="center" alignItems="center"> ${this.getStateIcon()} </wui-flex>
        <wui-flex flexDirection="column" alignItems="center" gap="2">
          <wui-text align="center" variant="lg-medium" color="primary">
            ${this.loadingMessage}
          </wui-text>
          <wui-text align="center" variant="lg-regular" color="secondary">
            ${this.subMessage}
          </wui-text>
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  private updateMessages() {
    switch (this.paymentState) {
      case 'completed':
        this.loadingMessage = 'Payment completed'
        this.subMessage = 'Your transaction has been successfully processed'
        break
      case 'error':
        this.loadingMessage = 'Payment failed'
        this.subMessage = 'There was an error processing your transaction'
        break
      case 'in-progress':
      default:
        if (PayController.state.currentPayment?.type === 'exchange') {
          this.loadingMessage = 'Payment initiated'
          this.subMessage = `Please complete the payment on the exchange`
        } else {
          this.loadingMessage = 'Awaiting payment confirmation'
          this.subMessage = 'Please confirm the payment transaction in your wallet'
        }
        break
    }
  }

  private getStateIcon() {
    switch (this.paymentState) {
      case 'completed':
        return this.successTemplate()
      case 'error':
        return this.errorTemplate()
      case 'in-progress':
      default:
        return this.loaderTemplate()
    }
  }

  private setupExchangeSubscription() {
    if (PayController.state.currentPayment?.type !== 'exchange') {
      return
    }

    this.exchangeSubscription = setInterval(async () => {
      const exchangeId = PayController.state.currentPayment?.exchangeId
      const sessionId = PayController.state.currentPayment?.sessionId
      if (exchangeId && sessionId) {
        await PayController.updateBuyStatus(exchangeId, sessionId)
        if (PayController.state.currentPayment?.status === 'SUCCESS') {
          clearInterval(this.exchangeSubscription)
        }
      }
    }, EXCHANGE_STATUS_CHECK_INTERVAL)
  }

  private setupSubscription() {
    PayController.subscribeKey('isPaymentInProgress', (inProgress: boolean) => {
      if (!inProgress && this.paymentState === 'in-progress') {
        // Check for error state
        if (PayController.state.error || !PayController.state.currentPayment?.result) {
          this.paymentState = 'error'
        } else {
          this.paymentState = 'completed'
        }

        this.updateMessages()

        // Close the modal after 3 seconds for both completed and error states
        setTimeout(() => {
          if (ConnectionController.state.status === 'disconnected') {
            return
          }
          ModalController.close()
        }, 3000)
      }
    })

    // Subscribe to error state
    PayController.subscribeKey('error', (error: string | null) => {
      if (error && this.paymentState === 'in-progress') {
        this.paymentState = 'error'
        this.updateMessages()
      }
    })
  }

  private loaderTemplate() {
    const borderRadiusMaster = ThemeController.state.themeVariables['--w3m-border-radius-master']
    const radius = borderRadiusMaster ? parseInt(borderRadiusMaster.replace('px', ''), 10) : 4

    const iconSrc = this.getPaymentIcon()

    return html`
      <wui-flex justifyContent="center" alignItems="center" style="position: relative;">
        ${iconSrc
          ? html`<wui-wallet-image size="lg" imageSrc=${iconSrc}></wui-wallet-image>`
          : null}
        <wui-loading-thumbnail radius=${radius * 9}></wui-loading-thumbnail>
      </wui-flex>
    `
  }

  private getPaymentIcon(): string | undefined {
    const currentPayment = PayController.state.currentPayment

    if (!currentPayment) {
      return undefined
    }

    if (currentPayment.type === 'exchange') {
      const exchangeId = currentPayment.exchangeId
      if (exchangeId) {
        const exchange = PayController.getExchangeById(exchangeId)

        return exchange?.imageUrl
      }
    }

    if (currentPayment.type === 'wallet') {
      const walletIcon = ChainController.getAccountData()?.connectedWalletInfo?.icon
      if (walletIcon) {
        return walletIcon
      }

      // Fallback
      const chainNamespace = ChainController.state.activeChain
      if (!chainNamespace) {
        return undefined
      }

      const connectorId = ConnectorController.getConnectorId(chainNamespace)
      if (!connectorId) {
        return undefined
      }

      const connector = ConnectorController.getConnectorById(connectorId)
      if (!connector) {
        return undefined
      }

      return AssetUtil.getConnectorImage(connector)
    }

    return undefined
  }

  private successTemplate() {
    return html`<wui-icon size="xl" color="success" name="checkmark"></wui-icon>`
  }

  private errorTemplate() {
    return html`<wui-icon size="xl" color="error" name="close"></wui-icon>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-pay-loading-view': W3mPayLoadingView
  }
}
