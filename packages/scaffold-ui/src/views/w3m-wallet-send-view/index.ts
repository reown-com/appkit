import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import {
  ChainController,
  ConnectionController,
  ConnectorControllerUtil,
  CoreHelperUtil,
  RouterController,
  SendController,
  SwapController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon-box'
import '@reown/appkit-ui/wui-separator'

import '../../partials/w3m-input-address/index.js'
import '../../partials/w3m-input-token/index.js'
import styles from './styles.js'

const SEND_BUTTON_MESSAGE = {
  INSUFFICIENT_FUNDS: 'Insufficient Funds',
  INCORRECT_VALUE: 'Incorrect Value',
  INVALID_ADDRESS: 'Invalid Address',
  ADD_ADDRESS: 'Add Address',
  ADD_AMOUNT: 'Add Amount',
  SELECT_TOKEN: 'Select Token',
  PREVIEW_SEND: 'Preview Send'
} as const

type SendButtonMessage = (typeof SEND_BUTTON_MESSAGE)[keyof typeof SEND_BUTTON_MESSAGE]

@customElement('w3m-wallet-send-view')
export class W3mWalletSendView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private token = SendController.state.token

  @state() private sendTokenAmount = SendController.state.sendTokenAmount

  @state() private receiverAddress = SendController.state.receiverAddress

  @state() private receiverProfileName = SendController.state.receiverProfileName

  @state() private loading = SendController.state.loading

  @state() private message: SendButtonMessage = SEND_BUTTON_MESSAGE.PREVIEW_SEND

  @state() private disconnecting = false

  public constructor() {
    super()
    // Only load balances and network price if a token is set, else they will be loaded in the select token view
    if (this.token) {
      this.fetchBalances()
      this.fetchNetworkPrice()
    }

    this.unsubscribe.push(
      ...[
        SendController.subscribe(val => {
          this.token = val.token
          this.sendTokenAmount = val.sendTokenAmount
          this.receiverAddress = val.receiverAddress
          this.receiverProfileName = val.receiverProfileName
          this.loading = val.loading
        })
      ]
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    this.getMessage()

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
      ${this.buttonTemplate()}
    </wui-flex>`
  }

  // -- Private ------------------------------------------- //
  private async fetchBalances() {
    await SendController.fetchTokenBalance()
    SendController.fetchNetworkBalance()
  }

  private async fetchNetworkPrice() {
    await SwapController.getNetworkTokenPrice()
  }

  private onButtonClick() {
    RouterController.push('WalletSendPreview')
  }

  private onFundWalletClick() {
    RouterController.push('FundWallet', {
      redirectView: 'WalletSend'
    })
  }

  private async onConnectDifferentWalletClick() {
    try {
      this.disconnecting = true
      ConnectionController.setDisconnectReason(
        ConnectorControllerUtil.DISCONNECT_REASON.CHOOSE_DIFFERENT_WALLET
      )
      await ConnectionController.disconnect()
    } finally {
      this.disconnecting = false
      RouterController.push('Connect', {
        redirectView: 'WalletSend'
      })
    }
  }

  private getMessage() {
    this.message = SEND_BUTTON_MESSAGE.PREVIEW_SEND

    if (
      this.receiverAddress &&
      !CoreHelperUtil.isAddress(this.receiverAddress, ChainController.state.activeChain)
    ) {
      this.message = SEND_BUTTON_MESSAGE.INVALID_ADDRESS
    }

    if (!this.receiverAddress) {
      this.message = SEND_BUTTON_MESSAGE.ADD_ADDRESS
    }

    if (
      this.sendTokenAmount &&
      this.token &&
      this.sendTokenAmount > Number(this.token.quantity.numeric)
    ) {
      this.message = SEND_BUTTON_MESSAGE.INSUFFICIENT_FUNDS
    }

    if (!this.sendTokenAmount) {
      this.message = SEND_BUTTON_MESSAGE.ADD_AMOUNT
    }

    if (this.sendTokenAmount && this.token?.price) {
      const value = this.sendTokenAmount * this.token.price
      if (!value) {
        this.message = SEND_BUTTON_MESSAGE.INCORRECT_VALUE
      }
    }

    if (!this.token) {
      this.message = SEND_BUTTON_MESSAGE.SELECT_TOKEN
    }
  }

  private buttonTemplate() {
    const isDisabled = !this.message.startsWith(SEND_BUTTON_MESSAGE.PREVIEW_SEND)
    const isInsufficientBalance = this.message === SEND_BUTTON_MESSAGE.INSUFFICIENT_FUNDS

    if (isInsufficientBalance) {
      return html`
        <wui-flex .margin=${['4', '0', '0', '0'] as const} flexDirection="column" gap="4">
          <wui-button
            @click=${this.onFundWalletClick.bind(this)}
            size="lg"
            variant="accent-secondary"
            fullWidth
          >
            Fund Wallet
          </wui-button>

          <wui-separator data-testid="wui-separator" text="or"></wui-separator>

          <wui-button
            @click=${this.onConnectDifferentWalletClick.bind(this)}
            size="lg"
            variant="neutral-secondary"
            fullWidth
            ?loading=${this.disconnecting}
          >
            Connect a different wallet
          </wui-button>
        </wui-flex>
      `
    }

    return html`<wui-flex .margin=${['4', '0', '0', '0'] as const}>
      <wui-button
        @click=${this.onButtonClick.bind(this)}
        ?disabled=${isDisabled}
        size="lg"
        variant="accent-primary"
        ?loading=${this.loading}
        fullWidth
      >
        ${this.message}
      </wui-button>
    </wui-flex>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-send-view': W3mWalletSendView
  }
}
