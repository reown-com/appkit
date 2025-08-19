import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

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
  @state() private variant: 'main' | 'accent' | 'neutral' = 'neutral'
  @state() private canSend = false

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
    // Update button message based on state
    if (snapshot.matches('error')) {
      this.message = 'Retry'
      this.variant = 'accent'
    } else if (snapshot.matches('sending')) {
      this.message = 'Sending...'
      this.variant = 'main'
    } else if (snapshot.matches({ formEntry: 'resolvingENS' })) {
      this.message = 'Resolving...'
      this.variant = 'neutral'
    } else if (!snapshot.context.selectedToken) {
      this.message = 'Select Token'
      this.variant = 'neutral'
    } else if (!snapshot.context.sendAmount) {
      this.message = 'Add Amount'
      this.variant = 'neutral'
    } else if (!snapshot.context.receiverAddress) {
      this.message = 'Add Address'
      this.variant = 'neutral'
    } else if (snapshot.context.validationErrors.amount) {
      this.message = 'Insufficient Funds'
      this.variant = 'neutral'
    } else if (snapshot.context.validationErrors.address) {
      this.message = 'Invalid Address'
      this.variant = 'neutral'
    } else if (snapshot.context.validationErrors.token) {
      this.message = 'Invalid Token'
      this.variant = 'neutral'
    } else if (snapshot.matches('readyToSend')) {
      this.message = 'Preview Send'
      this.variant = 'main'
    }

    // Update button state
    this.buttonDisabled = !snapshot.matches('readyToSend') || snapshot.context.loading
    this.loading = snapshot.context.loading
    this.canSend = snapshot.matches('readyToSend')
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html` <wui-flex flexDirection="column" .padding=${['0', 'l', 'l', 'l'] as const}>
      <wui-flex class="inputContainer" gap="xs" flexDirection="column">
        <w3m-input-token></w3m-input-token>
        <wui-icon-box
          size="inherit"
          backgroundColor="fg-300"
          iconSize="lg"
          iconColor="fg-250"
          background="opaque"
          icon="arrowBottom"
        ></wui-icon-box>
        <w3m-input-address></w3m-input-address>
      </wui-flex>
      <wui-flex .margin=${['l', '0', '0', '0'] as const}>
        <wui-button
          @click=${this.onButtonClick.bind(this)}
          ?disabled=${this.buttonDisabled}
          size="lg"
          variant=${this.variant}
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
