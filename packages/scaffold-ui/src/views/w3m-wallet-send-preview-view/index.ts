import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { ConstantsUtil as CommonConstantsUtil, ErrorUtil } from '@reown/appkit-common'
import {
  AppKitError,
  ChainController,
  EventsController,
  RouterController,
  SendController,
  SnackController
} from '@reown/appkit-controllers'
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

  @state() private params = RouterController.state.data?.send

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
    return html` <wui-flex flexDirection="column" .padding=${['0', '4', '4', '4'] as const}>
      <wui-flex gap="2" flexDirection="column" .padding=${['0', '2', '0', '2'] as const}>
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-flex flexDirection="column" gap="01">
            <wui-text variant="sm-regular" color="secondary">Send</wui-text>
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
          .caipNetwork=${this.caipNetwork}
          .receiverAddress=${this.receiverAddress}
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
    if (!this.params && this.token && this.sendTokenAmount) {
      const price = this.token.price
      const totalValue = price * this.sendTokenAmount

      return html`<wui-text variant="md-regular" color="primary"
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
      if (this.params) {
        RouterController.reset('WalletSendConfirmed')
      } else {
        SnackController.showSuccess('Transaction started')
        RouterController.replace('Account')
      }
    } catch (error) {
      let errMessage = 'Failed to send transaction. Please try again.'

      const isUserRejectedRequestError =
        error instanceof AppKitError &&
        error.originalName === ErrorUtil.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST

      if (
        ChainController.state.activeChain === CommonConstantsUtil.CHAIN.SOLANA ||
        isUserRejectedRequestError
      ) {
        if (error instanceof Error) {
          errMessage = error.message
        }
      }

      EventsController.sendEvent({
        type: 'track',
        event: isUserRejectedRequestError ? 'SEND_REJECTED' : 'SEND_ERROR',
        properties: SendController.getSdkEventProperties(error)
      })

      SnackController.showError(errMessage)
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
