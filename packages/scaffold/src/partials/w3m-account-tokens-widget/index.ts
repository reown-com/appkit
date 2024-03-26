import { AccountController, RouterController } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'
import { state } from 'lit/decorators.js'

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

  public override firstUpdated() {
    AccountController.fetchTokenBalance()
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
      ></wui-list-description
      ><wui-list-description
        @click=${this.onReceiveClick.bind(this)}
        text="Receive funds"
        description="Transfer tokens on your wallet"
        icon="arrowBottomCircle"
        iconColor="fg-200"
        iconBackgroundColor="fg-200"
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
    RouterController.push('OnRampProviders')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-tokens-widget': W3mAccountTokensWidget
  }
}
