import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { type CaipNetworkId } from '@reown/appkit-common'
import {
  AccountController,
  AssetUtil,
  ChainController,
  ConstantsUtil,
  CoreHelperUtil,
  RouterController,
  SendController,
  SnackController,
  SwapController
} from '@reown/appkit-controllers'
import { BalanceUtil } from '@reown/appkit-controllers/utils'
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
  @state() private token = SendController.state.token

  @state() private sendTokenAmount = SendController.state.sendTokenAmount

  @state() private receiverAddress = SendController.state.receiverAddress

  @state() private receiverProfileName = SendController.state.receiverProfileName

  @state() private loading = SendController.state.loading

  @state() private params = RouterController.state.data?.send

  @state() private address = AccountController.state.address

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
    // Only load balances and network price if a token is set, else they will be loaded in the select token view
    if (this.token && !this.params) {
      this.fetchBalances()
      this.fetchNetworkPrice()
    }

    this.unsubscribe.push(
      ...[
        AccountController.subscribeKey('caipAddress', val => {
          this.address = CoreHelperUtil.getPlainAddress(val)
        }),
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

  public override async firstUpdated() {
    await this.handleSendParameters()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    this.getMessage()

    const isReadOnly = Boolean(this.params)
    if (!this.address) {
      throw new Error('w3m-wallet-send-view: No account connected')
    }

    return html` <wui-flex flexDirection="column" .padding=${['0', '4', '4', '4'] as const}>
      <wui-flex class="inputContainer" gap="2" flexDirection="column">
        <w3m-input-token
          .token=${this.token}
          .sendTokenAmount=${this.sendTokenAmount}
          ?readOnly=${isReadOnly}
        ></w3m-input-token>
        <wui-icon-box size="md" variant="secondary" icon="arrowBottom"></wui-icon-box>
        <w3m-input-address
          ?readOnly=${isReadOnly}
          .value=${this.receiverProfileName ? this.receiverProfileName : this.receiverAddress}
        ></w3m-input-address>
      </wui-flex>
      <wui-flex .margin=${['4', '0', '0', '0'] as const}>
        <wui-button
          @click=${this.onButtonClick.bind(this)}
          ?disabled=${!this.message.startsWith('Preview Send')}
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
  private async fetchBalances() {
    await SendController.fetchTokenBalance()
    SendController.fetchNetworkBalance()
  }

  private async fetchNetworkPrice() {
    await SwapController.getNetworkTokenPrice()
  }

  private onButtonClick() {
    RouterController.push('WalletSendPreview', {
      send: this.params
    })
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

  async handleSendParameters() {
    this.loading = true

    if (!this.params) {
      this.loading = false

      return
    }

    const amount = Number(this.params.amount)

    if (isNaN(amount)) {
      SnackController.showError('Invalid amount')
      this.loading = false

      return
    }

    const { namespace, chainId, assetAddress } = this.params

    if (!ConstantsUtil.SEND_PARAMS_SUPPORTED_CHAINS.includes(namespace)) {
      SnackController.showError(`Chain "${namespace}" is not supported for send parameters`)
      this.loading = false

      return
    }

    const caipNetworkId: CaipNetworkId = `${namespace}:${chainId}`

    try {
      const { balance, name, symbol, decimals } = await BalanceUtil.fetchERC20Balance({
        caipAddress: `${caipNetworkId}:${this.address}`,
        assetAddress,
        caipNetworkId
      })

      if (!name || !symbol || !decimals || !balance) {
        SnackController.showError('Token not found')

        return
      }

      SendController.setToken({
        name,
        symbol,
        chainId: caipNetworkId,
        address: `${caipNetworkId}:${assetAddress}`,
        value: 0,
        price: 0,
        quantity: {
          decimals: decimals.toString(),
          numeric: balance.toString()
        },
        iconUrl: AssetUtil.getTokenImage(symbol) ?? ''
      })
      SendController.setTokenAmount(amount)
      SendController.setReceiverAddress(this.params.to)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load token information:', err)
      SnackController.showError('Failed to load token information')
    } finally {
      this.loading = false
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-send-view': W3mWalletSendView
  }
}
