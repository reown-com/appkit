import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import {
  ChainController,
  EventsController,
  OptionsController,
  RouterController,
  getPreferredAccountType
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-list-description'
import '@reown/appkit-ui/wui-list-token'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import styles from './styles.js'

@customElement('w3m-account-tokens-widget')
export class W3mAccountTokensWidget extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private tokenBalance = ChainController.getAccountData()?.tokenBalance

  @state() private remoteFeatures = OptionsController.state.remoteFeatures

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        ChainController.subscribeChainProp('accountState', val => {
          this.tokenBalance = val?.tokenBalance
        }),
        OptionsController.subscribeKey('remoteFeatures', val => {
          this.remoteFeatures = val
        })
      ]
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`${this.tokenTemplate()}`
  }

  // -- Private ------------------------------------------- //
  private tokenTemplate() {
    if (this.tokenBalance && this.tokenBalance?.length > 0) {
      return html`<wui-flex class="contentContainer" flexDirection="column" gap="2">
        ${this.tokenItemTemplate()}
      </wui-flex>`
    }

    return html` <wui-flex flexDirection="column">
      ${this.onRampTemplate()}
      <wui-list-description
        @click=${this.onReceiveClick.bind(this)}
        text="Receive funds"
        description="Scan the QR code and receive funds"
        icon="qrCode"
        iconColor="fg-200"
        iconBackgroundColor="fg-200"
        data-testid="w3m-account-receive-button"
      ></wui-list-description
    ></wui-flex>`
  }

  private onRampTemplate() {
    if (this.remoteFeatures?.onramp) {
      return html`<wui-list-description
        @click=${this.onBuyClick.bind(this)}
        text="Buy Crypto"
        description="Easy with card or bank account"
        icon="card"
        iconColor="success-100"
        iconBackgroundColor="success-100"
        tag="popular"
        data-testid="w3m-account-onramp-button"
      ></wui-list-description>`
    }

    return html``
  }

  private tokenItemTemplate() {
    return this.tokenBalance?.map(
      token =>
        html`<wui-list-token
          tokenName=${token.name}
          tokenImageUrl=${token.iconUrl}
          tokenAmount=${token.quantity.numeric}
          tokenValue=${token.value}
          tokenCurrency=${token.symbol}
        ></wui-list-token>`
    )
  }

  private onReceiveClick() {
    RouterController.push('WalletReceive')
  }

  private onBuyClick() {
    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_BUY_CRYPTO',
      properties: {
        isSmartAccount:
          getPreferredAccountType(ChainController.state.activeChain) ===
          W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
      }
    })
    RouterController.push('OnRampProviders')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-tokens-widget': W3mAccountTokensWidget
  }
}
