import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import type { Balance, CaipNetwork } from '@reown/appkit-common'
import { ChainController, RouterController, SnackController } from '@reown/appkit-controllers'
import { sendActor } from '@reown/appkit-controllers'
import { UiHelperUtil, customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-preview-item'
import '@reown/appkit-ui/wui-text'

import '../../partials/w3m-wallet-send-details/index.js'
import styles from './styles.js'

@customElement('w3m-wallet-send-preview-view')
export class W3mWalletSendPreviewView extends LitElement {
  public static override styles = styles

  // -- State & Properties -------------------------------- //
  @state() private token?: Balance
  @state() public sendTokenAmount?: number
  @state() private receiverAddress?: string
  @state() private receiverProfileName?: string
  @state() private receiverProfileImageUrl?: string
  @state() private caipNetwork = ChainController.state.activeCaipNetwork
  @state() private loading = false
  @state() private formattedAmount = '0'

  private unsubscribe: (() => void)[] = []

  public constructor() {
    super()

    // Initialize from current actor state
    const snapshot = sendActor.getSnapshot()
    this.updatePreviewState(snapshot)

    // Subscribe to actor state changes
    this.unsubscribe.push(
      sendActor.subscribe(actorSnapshot => {
        this.updatePreviewState(actorSnapshot)
        this.requestUpdate()
      }).unsubscribe
    )

    // Also subscribe to network changes
    this.unsubscribe.push(
      ChainController.subscribeKey('activeCaipNetwork', val => {
        this.caipNetwork = val
        this.requestUpdate()
      })
    )
  }

  public override disconnectedCallback() {
    super.disconnectedCallback()
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Private ------------------------------------------- //
  private updatePreviewState(
    snapshot: typeof sendActor extends { getSnapshot(): infer T } ? T : never
  ) {
    this.token = snapshot.context.selectedToken
    this.sendTokenAmount = snapshot.context.sendAmount
    this.receiverAddress = snapshot.context.receiverAddress || ''
    this.receiverProfileName = snapshot.context.receiverProfileName
    this.receiverProfileImageUrl = snapshot.context.receiverProfileImageUrl
    this.loading = snapshot.context.loading

    // Calculate formatted amount
    this.formattedAmount = snapshot.context.sendAmount
      ? String(UiHelperUtil.roundNumber(snapshot.context.sendAmount, 6, 5))
      : '0'
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html` <wui-flex flexDirection="column" .padding=${['0', '4', '4', '4'] as const}>
      <wui-flex gap="2" flexDirection="column" .padding=${['0', '2', '0', '2'] as const}>
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-flex flexDirection="column" gap="01">
            <wui-text variant="sm-regular" color="secondary">Send</wui-text>
            ${this.sendValueTemplate()}
          </wui-flex>
          <wui-preview-item
            text="${this.formattedAmount} ${this.token?.symbol || ''}"
            .imageSrc=${this.token?.iconUrl}
          ></wui-preview-item>
        </wui-flex>
        <wui-flex>
          <wui-icon color="default" size="md" name="arrowBottom"></wui-icon>
        </wui-flex>
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="sm-regular" color="secondary">To</wui-text>
          <wui-preview-item
            text="${this.receiverProfileName
              ? UiHelperUtil.getTruncateString({
                  string: this.receiverProfileName,
                  charsStart: 20,
                  charsEnd: 0,
                  truncate: 'end'
                })
              : UiHelperUtil.getTruncateString({
                  string: this.receiverAddress ? this.receiverAddress : '',
                  charsStart: 4,
                  charsEnd: 4,
                  truncate: 'middle'
                })}"
            address=${this.receiverAddress ?? ''}
            .imageSrc=${this.receiverProfileImageUrl ?? undefined}
            .isAddress=${true}
          ></wui-preview-item>
        </wui-flex>
      </wui-flex>
      <wui-flex flexDirection="column" .padding=${['6', '0', '0', '0'] as const}>
        <w3m-wallet-send-details
          .caipNetwork=${this.caipNetwork as unknown as CaipNetwork | undefined}
          .receiverAddress=${this.receiverAddress || ''}
        ></w3m-wallet-send-details>
        <wui-flex justifyContent="center" gap="1" .padding=${['3', '0', '0', '0'] as const}>
          <wui-icon size="sm" color="default" name="warningCircle"></wui-icon>
          <wui-text variant="sm-regular" color="secondary">Review transaction carefully</wui-text>
        </wui-flex>
        <wui-flex justifyContent="center" gap="3" .padding=${['4', '0', '0', '0'] as const}>
          <wui-button
            class="cancelButton"
            @click=${this.onCancelClick.bind(this)}
            size="lg"
            variant="neutral-secondary"
          >
            Cancel
          </wui-button>
          <wui-button
            class="sendButton"
            @click=${this.onSendClick.bind(this)}
            size="lg"
            variant="accent-primary"
            .loading=${this.loading}
          >
            Send
          </wui-button>
        </wui-flex>
      </wui-flex></wui-flex
    >`
  }

  // -- Private ------------------------------------------- //
  private sendValueTemplate() {
    if (this.token && this.sendTokenAmount) {
      const price = this.token.price
      const totalValue = price * this.sendTokenAmount

      return html`<wui-text variant="md-regular" color="primary"
        >$${totalValue.toFixed(2)}</wui-text
      >`
    }

    return null
  }

  private onSendClick() {
    const snapshot = sendActor.getSnapshot()

    if (!snapshot.matches('readyToSend')) {
      SnackController.showError('Please complete the form before sending')

      return
    }

    // Send transaction event to XState machine
    sendActor.send({ type: 'SEND_TRANSACTION' })
  }

  private onCancelClick() {
    RouterController.goBack()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-send-preview-view': W3mWalletSendPreviewView
  }
}
