import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import {
  AssetController,
  ModalController,
  OnRampController,
  OptionsController,
  OptionsStateController
} from '@reown/appkit-controllers'
import type { PaymentCurrency } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-list-item'
import '@reown/appkit-ui/wui-text'

import '../../partials/w3m-legal-checkbox/index.js'
import styles from './styles.js'

@customElement('w3m-onramp-fiat-select-view')
export class W3mOnrampFiatSelectView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() public selectedCurrency = OnRampController.state.paymentCurrency
  @state() public currencies = OnRampController.state.paymentCurrencies
  @state() private currencyImages = AssetController.state.currencyImages
  @state() private checked = OptionsStateController.state.isLegalCheckboxChecked

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        OnRampController.subscribe(val => {
          this.selectedCurrency = val.paymentCurrency
          this.currencies = val.paymentCurrencies
        }),
        AssetController.subscribeKey('currencyImages', val => (this.currencyImages = val)),
        OptionsStateController.subscribeKey('isLegalCheckboxChecked', val => {
          this.checked = val
        })
      ]
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const { termsConditionsUrl, privacyPolicyUrl } = OptionsController.state

    const legalCheckbox = OptionsController.state.features?.legalCheckbox

    const legalUrl = termsConditionsUrl || privacyPolicyUrl
    const showLegalCheckbox = Boolean(legalUrl) && Boolean(legalCheckbox)

    const disabled = showLegalCheckbox && !this.checked

    return html`
      <w3m-legal-checkbox></w3m-legal-checkbox>
      <wui-flex
        flexDirection="column"
        .padding=${['0', '3', '3', '3']}
        gap="2"
        class=${ifDefined(disabled ? 'disabled' : undefined)}
      >
        ${this.currenciesTemplate(disabled)}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private currenciesTemplate(disabled = false) {
    return this.currencies.map(
      currency => html`
        <wui-list-item
          imageSrc=${ifDefined(this.currencyImages?.[currency.id])}
          @click=${() => this.selectCurrency(currency)}
          variant="image"
          tabIdx=${ifDefined(disabled ? -1 : undefined)}
        >
          <wui-text variant="md-medium" color="primary">${currency.id}</wui-text>
        </wui-list-item>
      `
    )
  }

  private selectCurrency(currency: PaymentCurrency) {
    if (!currency) {
      return
    }

    OnRampController.setPaymentCurrency(currency)
    ModalController.close()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-onramp-fiat-select-view': W3mOnrampFiatSelectView
  }
}
