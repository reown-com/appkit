import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import type { Balance } from '@reown/appkit-common'
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
  private updateButtonState(
    snapshot: typeof sendActor extends { getSnapshot(): infer T } ? T : never
  ) {
    // Sync state properties with XState actor context
    this.token = snapshot.context.selectedToken
    this.sendTokenAmount = snapshot.context.sendAmount
    this.receiverAddress = snapshot.context.receiverAddress
    this.receiverProfileName = snapshot.context.receiverProfileName

    // Update button message based on state
    if (snapshot.matches('error')) {
      this.message = 'Retry'
    } else if (snapshot.matches('sending')) {
      this.message = 'Sending...'
    } else if (snapshot.matches({ formEntry: 'resolvingENS' })) {
      this.message = 'Resolving...'
    } else if (!snapshot.context.selectedToken) {
      this.message = 'Select Token'
    } else if (!snapshot.context.sendAmount) {
      this.message = 'Add Amount'
    } else if (!snapshot.context.receiverAddress) {
      this.message = 'Add Address'
    } else if (snapshot.context.validationErrors.amount) {
      this.message = 'Insufficient Funds'
    } else if (snapshot.context.validationErrors.address) {
      this.message = 'Invalid Address'
    } else if (snapshot.context.validationErrors.token) {
      this.message = 'Invalid Token'
    } else if (snapshot.matches('readyToSend')) {
      this.message = 'Preview Send'
    }

    // Update button state
    this.buttonDisabled = !snapshot.matches('readyToSend') || snapshot.context.loading
    this.loading = snapshot.context.loading
    this.canSend = snapshot.matches('readyToSend')
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
    if (this.canSend) {
      RouterController.push('WalletSendPreview')
    } else {
      // Handle different button states
      const snapshot = sendActor.getSnapshot()

      if (!snapshot.context.selectedToken) {
        RouterController.push('WalletSendSelectToken')
      } else if (snapshot.matches('error')) {
        sendActor.send({ type: 'RETRY_SEND' })
      }
      // Other cases are handled by form validation in the machine
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-send-view': W3mWalletSendView
  }
}
