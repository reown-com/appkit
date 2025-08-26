import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import type { Balance } from '@reown/appkit-common'
import type { SendContext } from '@reown/appkit-controllers'
import { RouterController } from '@reown/appkit-controllers'
import { sendActor } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon-box'

import '../../partials/w3m-input-address/index.js'
import '../../partials/w3m-input-token/index.js'
import styles from './styles.js'

@customElement('w3m-wallet-send-view')
export class W3mWalletSendView extends LitElement {
  public static override styles = styles

  // -- State & Properties -------------------------------- //
  @state() private message = 'Preview Send'
  @state() private buttonDisabled = true
  @state() private loading = false
  @state() private canSend = false
  @state() private token?: Balance
  @state() private sendTokenAmount?: number
  @state() private receiverAddress?: string
  @state() private receiverProfileName?: string

  private unsubscribe: (() => void)[] = []

  public constructor() {
    super()

    // Initialize from current actor state
    const snapshot = sendActor.getSnapshot()
    this.updateButtonState(snapshot)

    // Subscribe to actor state changes
    this.unsubscribe.push(
      sendActor.subscribe(actorSnapshot => {
        this.updateButtonState(actorSnapshot)
        this.requestUpdate()
      }).unsubscribe
    )
  }

  public override disconnectedCallback() {
    super.disconnectedCallback()
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Private ------------------------------------------- //
  private isReadyToSend(context: SendContext): boolean {
    return Boolean(
      context.selectedToken &&
        context.sendAmount &&
        context.sendAmount > 0 &&
        context.receiverAddress &&
        context.sendAmount <= Number(context.selectedToken.quantity.numeric)
    )
  }

  private updateButtonState(
    snapshot: typeof sendActor extends { getSnapshot(): infer T } ? T : never
  ) {
    this.token = snapshot.context.selectedToken
    this.sendTokenAmount = snapshot.context.sendAmount
    this.receiverAddress = snapshot.context.receiverAddress
    this.receiverProfileName = snapshot.context.receiverProfileName

    if (snapshot.matches('active')) {
      this.message = 'Loading Balances...'
    } else if (snapshot.matches('sending')) {
      this.message = 'Sending...'
    } else if (snapshot.matches('resolvingENS')) {
      this.message = 'Resolving...'
    } else if (snapshot.matches('success')) {
      this.message = 'Transaction Sent'
    } else if (!snapshot.context.selectedToken) {
      this.message = 'Select Token'
    } else if (!snapshot.context.sendAmount) {
      this.message = 'Enter Amount'
    } else if (snapshot.context.sendAmount <= 0) {
      this.message = 'Enter Valid Amount'
    } else if (
      snapshot.context.selectedToken &&
      snapshot.context.sendAmount > Number(snapshot.context.selectedToken.quantity.numeric)
    ) {
      this.message = 'Insufficient Balance'
    } else if (!snapshot.context.receiverAddress) {
      this.message = 'Enter Address'
    } else if (this.isReadyToSend(snapshot.context)) {
      this.message = 'Preview Send'
    } else if (snapshot.context.error) {
      this.message = 'Retry'
    } else {
      this.message = 'Complete Form'
    }

    // Update button state
    const isFormComplete = this.isReadyToSend(snapshot.context)
    const isProcessing =
      snapshot.matches('active') || snapshot.matches('sending') || snapshot.matches('resolvingENS')

    this.buttonDisabled =
      isProcessing ||
      (!isFormComplete && ((snapshot as any).matches('preparing') || snapshot.matches('idle')))
    this.loading = snapshot.context.loading || isProcessing
    this.canSend =
      isFormComplete && ((snapshot as any).matches('preparing') || snapshot.matches('idle'))
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html` <wui-flex flexDirection="column" .padding=${['0', '4', '4', '4'] as const}>
      <wui-flex class="inputContainer" gap="2" flexDirection="column">
        <w3m-input-token
          .token=${this.token}
          .sendTokenAmount=${this.sendTokenAmount}
        ></w3m-input-token>
        <wui-icon-box size="md" variant="secondary" icon="arrowBottom"></wui-icon-box>
        <w3m-input-address
          .value=${this.receiverProfileName ? this.receiverProfileName : this.receiverAddress}
        ></w3m-input-address>
      </wui-flex>
      <wui-flex .margin=${['4', '0', '0', '0'] as const}>
        <wui-button
          @click=${this.onButtonClick.bind(this)}
          ?disabled=${this.buttonDisabled}
          size="lg"
          variant="accent-primary"
          ?loading=${this.loading}
          fullWidth
        >
          ${this.message}
        </wui-button>
      </wui-flex>
    </wui-flex>`
  }

  // -- Private ------------------------------------------- //
  private onButtonClick() {
    const snapshot = sendActor.getSnapshot()

    if (this.canSend) {
      RouterController.push('WalletSendPreview')
    } else if (!snapshot.context.selectedToken) {
      RouterController.push('WalletSendSelectToken')
    } else if (snapshot.context.error) {
      sendActor.send({ type: 'RESET_FORM' })
    } else if (snapshot.matches('success')) {
      sendActor.send({ type: 'FETCH_BALANCES' })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-send-view': W3mWalletSendView
  }
}
