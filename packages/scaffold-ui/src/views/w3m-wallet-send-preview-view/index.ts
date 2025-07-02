import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import {
  ChainController,
  EventsController,
  RouterController,
  SendController,
  SnackController,
  getPreferredAccountType
} from '@reown/appkit-controllers'
import { UiHelperUtil, customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-preview-item'
import '@reown/appkit-ui/wui-text'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import '../../partials/w3m-wallet-send-details/index.js'
import styles from './styles.js'

@customElement('w3m-wallet-send-preview-view')
export class W3mWalletSendPreviewView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private token = SendController.state.token

  @state() private sendTokenAmount = SendController.state.sendTokenAmount

  @state() private receiverAddress = SendController.state.receiverAddress

  @state() private receiverProfileName = SendController.state.receiverProfileName

  @state() private receiverProfileImageUrl = SendController.state.receiverProfileImageUrl

  @state() private caipNetwork = ChainController.state.activeCaipNetwork

  @state() private loading = SendController.state.loading

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        SendController.subscribe(val => {
          this.token = val.token
          this.sendTokenAmount = val.sendTokenAmount
          this.receiverAddress = val.receiverAddress
          this.receiverProfileName = val.receiverProfileName
          this.receiverProfileImageUrl = val.receiverProfileImageUrl
          this.loading = val.loading
        }),
        ChainController.subscribeKey('activeCaipNetwork', val => (this.caipNetwork = val))
      ]
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html` <wui-flex flexDirection="column" .padding=${['0', 'l', 'l', 'l'] as const}>
      <wui-flex gap="xs" flexDirection="column" .padding=${['0', 'xs', '0', 'xs'] as const}>
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-flex flexDirection="column" gap="4xs">
            <wui-text variant="small-400" color="fg-150">Send</wui-text>
            ${this.sendValueTemplate()}
          </wui-flex>
          <wui-preview-item
            text="${this.sendTokenAmount
              ? UiHelperUtil.roundNumber(this.sendTokenAmount, 6, 5)
              : 'unknown'} ${this.token?.symbol}"
            .imageSrc=${this.token?.iconUrl}
          ></wui-preview-item>
        </wui-flex>
        <wui-flex>
          <wui-icon color="fg-200" size="md" name="arrowBottom"></wui-icon>
        </wui-flex>
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="small-400" color="fg-150">To</wui-text>
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
      <wui-flex flexDirection="column" .padding=${['xxl', '0', '0', '0'] as const}>
        <w3m-wallet-send-details
          .caipNetwork=${this.caipNetwork}
          .receiverAddress=${this.receiverAddress}
        ></w3m-wallet-send-details>
        <wui-flex justifyContent="center" gap="xxs" .padding=${['s', '0', '0', '0'] as const}>
          <wui-icon size="sm" color="fg-200" name="warningCircle"></wui-icon>
          <wui-text variant="small-400" color="fg-200">Review transaction carefully</wui-text>
        </wui-flex>
        <wui-flex justifyContent="center" gap="s" .padding=${['l', '0', '0', '0'] as const}>
          <wui-button
            class="cancelButton"
            @click=${this.onCancelClick.bind(this)}
            size="lg"
            variant="neutral"
          >
            Cancel
          </wui-button>
          <wui-button
            class="sendButton"
            @click=${this.onSendClick.bind(this)}
            size="lg"
            variant="main"
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

      return html`<wui-text variant="paragraph-400" color="fg-100"
        >$${totalValue.toFixed(2)}</wui-text
      >`
    }

    return null
  }

  async onSendClick() {
    if (!this.sendTokenAmount || !this.receiverAddress) {
      SnackController.showError('Please enter a valid amount and receiver address')

      return
    }

    try {
      await SendController.sendToken()
      SnackController.showSuccess('Transaction started')
      RouterController.replace('Account')
    } catch (error) {
      SnackController.showError('Failed to send transaction. Please try again.')
      // eslint-disable-next-line no-console
      console.error('SendController:sendToken - failed to send transaction', error)

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      EventsController.sendEvent({
        type: 'track',
        event: 'SEND_ERROR',
        properties: {
          message: errorMessage,
          isSmartAccount:
            getPreferredAccountType(ChainController.state.activeChain) ===
            W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,
          token: this.token?.symbol || '',
          amount: this.sendTokenAmount,
          network: ChainController.state.activeCaipNetwork?.caipNetworkId || ''
        }
      })
    }
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
