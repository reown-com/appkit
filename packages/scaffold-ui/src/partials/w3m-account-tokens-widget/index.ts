import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import type { ChainNamespace } from '@reown/appkit-common'
import {
  AccountController,
  ChainController,
  EventsController,
  RouterController
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
  @state() private tokenBalance = AccountController.state.tokenBalance

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        AccountController.subscribe(val => {
          this.tokenBalance = val.tokenBalance
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
      return html`<wui-flex class="contentContainer" flexDirection="column" gap="xs">
        ${this.tokenItemTemplate()}
      </wui-flex>`
    }

    return html` <wui-flex flexDirection="column" gap="xs"
      ><wui-list-description
        @click=${this.onBuyClick.bind(this)}
        text="Buy Crypto"
        description="Easy with card or bank account"
        icon="card"
        iconColor="success-100"
        iconBackgroundColor="success-100"
        tag="popular"
        data-testid="buy-crypto"
      ></wui-list-description
      ><wui-list-description
        @click=${this.onReceiveClick.bind(this)}
        text="Receive funds"
        description="Transfer tokens on your wallet"
        icon="arrowBottomCircle"
        iconColor="fg-200"
        iconBackgroundColor="fg-200"
        data-testid="receive-funds"
      ></wui-list-description
    ></wui-flex>`
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
    const activeChainNamespace = ChainController.state.activeChain as ChainNamespace

    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_BUY_CRYPTO',
      properties: {
        isSmartAccount:
          AccountController.state.preferredAccountTypes?.[activeChainNamespace] ===
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
