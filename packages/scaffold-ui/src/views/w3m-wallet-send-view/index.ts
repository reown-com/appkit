import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'

import {
  ChainController,
  CoreHelperUtil,
  RouterController,
  SendController,
  SwapController
} from '@reown/appkit-controllers'
import type { SendInputArguments } from '@reown/appkit-controllers'
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

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property({ type: Object }) initialParams = RouterController.state.data?.send

  @state() private token = SendController.state.token

  @state() private sendTokenAmount = SendController.state.sendTokenAmount

  @state() private receiverAddress = SendController.state.receiverAddress

  @state() private receiverProfileName = SendController.state.receiverProfileName

  @state() private loading = SendController.state.loading

  @state() private message:
    | 'Preview Send'
    | 'Select Token'
    | 'Add Address'
    | 'Add Amount'
    | 'Insufficient Funds'
    | 'Incorrect Value'
    | 'Invalid Address' = 'Preview Send'

  public constructor() {
    super()
    this.fetchNetworkPrice()
    this.fetchBalances()
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

  public override async firstUpdated() {
    await this.handleSendParameters()
    this.fetchBalances()
    this.fetchNetworkPrice()
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    this.getMessage()

    return html` <wui-flex flexDirection="column" .padding=${['0', 'l', 'l', 'l'] as const}>
      <wui-flex class="inputContainer" gap="xs" flexDirection="column">
        <w3m-input-token
          .token=${this.token}
          .sendTokenAmount=${this.sendTokenAmount}
        ></w3m-input-token>
        <wui-icon-box
          size="inherit"
          backgroundColor="fg-300"
          iconSize="lg"
          iconColor="fg-250"
          background="opaque"
          icon="arrowBottom"
        ></wui-icon-box>
        <w3m-input-address
          .value=${this.receiverProfileName ? this.receiverProfileName : this.receiverAddress}
        ></w3m-input-address>
      </wui-flex>
      <wui-flex .margin=${['l', '0', '0', '0'] as const}>
        <wui-button
          @click=${this.onButtonClick.bind(this)}
          ?disabled=${!this.message.startsWith('Preview Send')}
          size="lg"
          variant="main"
          ?loading=${this.loading}
          fullWidth
        >
          ${this.message}
        </wui-button>
      </wui-flex>
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

  private async handleSendParameters() {
    if (!this.initialParams) return

    await this.waitForTokens()

    await this.setSendParameters(this.initialParams)
  }

  private async waitForTokens() {
    if (SendController.state.tokenBalances && SendController.state.tokenBalances.length > 0) {
      return
    }

    const waitForTokens = new Promise<void>(resolve => {
      const unsubscribe = SendController.subscribeKey('tokenBalances', tokens => {
        if (tokens && tokens.length > 0) {
          unsubscribe?.()
          resolve()
        }
      })

      setTimeout(() => {
        unsubscribe?.()
        resolve()
      }, 5000)
    })

    await waitForTokens
  }

  private async setSendParameters({ amount, fromToken, recipient }: SendInputArguments) {
    if (fromToken) {
      const token = await this.findTokenBySymbol(fromToken)
      if (token) SendController.setToken(token)
    }

    if (amount && !isNaN(Number(amount))) {
      SendController.setTokenAmount(Number(amount))
    }

    if (recipient) {
      SendController.setReceiverAddress(recipient)
    }
  }

  private async findTokenBySymbol(symbol: string) {
    const allTokens = SendController.state.tokenBalances || []
    return allTokens.find(token => token.symbol.toLowerCase() === symbol.toLowerCase())
  }

  private getMessage() {
    this.message = 'Preview Send'

    if (
      this.receiverAddress &&
      !CoreHelperUtil.isAddress(this.receiverAddress, ChainController.state.activeChain)
    ) {
      this.message = 'Invalid Address'
    }

    if (!this.receiverAddress) {
      this.message = 'Add Address'
    }

    if (
      this.sendTokenAmount &&
      this.token &&
      this.sendTokenAmount > Number(this.token.quantity.numeric)
    ) {
      this.message = 'Insufficient Funds'
    }

    if (!this.sendTokenAmount) {
      this.message = 'Add Amount'
    }

    if (this.sendTokenAmount && this.token?.price) {
      const value = this.sendTokenAmount * this.token.price
      if (!value) {
        this.message = 'Incorrect Value'
      }
    }

    if (!this.token) {
      this.message = 'Select Token'
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-send-view': W3mWalletSendView
  }
}
