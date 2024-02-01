import { AccountController, ModalController } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import styles from './styles.js'

type CoinbaseNetwork = {
  name: string
  display_name: string
  chain_id: string
  contract_address: string
}

type PaymentLimits = {
  id: string
  min: string
  max: string
}

type PaymentCurrency = {
  id: string
  payment_method_limits: PaymentLimits[]
}

type PurchaseCurrency = {
  id: string
  name: string
  symbol: string
  networks: CoinbaseNetwork[]
}

@customElement('w3m-onramp-widget')
export class W3mOnrampWidget extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public disabled? = false

  @state() private connected = AccountController.state.isConnected

  @state() private loading = ModalController.state.loading

  @state() private paymentCurrencies: PaymentCurrency[] = []

  @state() private purchaseCurrencies: PurchaseCurrency[] = []

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        AccountController.subscribeKey('isConnected', val => {
          this.connected = val
        }),
        ModalController.subscribeKey('loading', val => {
          this.loading = val
        })
      ]
    )
  }

  public override disconnectedCallback() {
    for (const unsubscribe of this.unsubscribe) {
      unsubscribe()
    }
  }

  public override firstUpdated() {
    this.fetchOptions()
  }

  private fetchOptions() {
    this.purchaseCurrencies = [
      {
        id: '2b92315d-eab7-5bef-84fa-089a131333f5',
        name: 'USD Coin',
        symbol: 'USDC',
        networks: [
          {
            name: 'ethereum-mainnet',
            display_name: 'Ethereum',
            chain_id: '1',
            contract_address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
          },
          {
            name: 'polygon-mainnet',
            display_name: 'Polygon',
            chain_id: '137',
            contract_address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
          }
        ]
      }
    ]

    this.paymentCurrencies = [
      {
        id: 'USD',
        payment_method_limits: [
          {
            id: 'card',
            min: '10.00',
            max: '7500.00'
          },
          {
            id: 'ach_bank_account',
            min: '10.00',
            max: '25000.00'
          }
        ]
      }
    ]
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" justifyContent="center" alignItems="center">
        <wui-flex flexDirection="column" alignItems="center" gap="xs">
          <wui-input-text type="number">
            <wui-flex
              class="currency-container"
              justifyContent="space-between"
              alignItems="center"
              gap="xxs"
            >
              <wui-image
                src=https://upload.wikimedia.org/wikipedia/commons/8/88/United-states_flag_icon_round.svg
              ></wui-image>
              <wui-text color="fg-100">
                ${this.paymentCurrencies[0]?.id}
              </wui-text>
            </wui-flex>
          </wui-input-text>
          <wui-input-text type="number" size="md">
            <wui-flex
              class="currency-container"
              justifyContent="space-between"
              alignItems="center"
              gap="xxs"
            >
              <wui-image
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Circle_USDC_Logo.svg/1024px-Circle_USDC_Logo.svg.png"
              ></wui-image>
              <wui-text color="fg-100">
                ${this.purchaseCurrencies[0]?.symbol}
              </wui-text>
            </wui-flex>
          </wui-input-text>
          <wui-flex justifyContent="space-evenly" class="amounts-container" gap="xs">
            ${[100, 250, 500, 1000].map(
              amount =>
                html`<wui-button variant="accentBg" size="md" fullWidth>${amount}</wui-button>`
            )}
          </wui-flex>
          ${this.templateButton()}
        </wui-flex>
      </wui-flex>
    `
  }

  private templateButton() {
    return this.connected
      ? html`<wui-button @click=${this.onClick.bind(this)} variant="fill" fullWidth>
          Get quotes
        </wui-button>`
      : html`<w3m-connect-button fullWidth></w3m-connect-button>`
  }

  // -- Private ------------------------------------------- //
  private onClick() {
    if (!this.loading) {
      ModalController.open({ view: 'OnRampProviders' })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-onramp-widget': W3mOnrampWidget
  }
}
