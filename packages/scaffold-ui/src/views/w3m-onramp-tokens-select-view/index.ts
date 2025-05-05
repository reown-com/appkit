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
import type { PurchaseCurrency } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-list-item'
import '@reown/appkit-ui/wui-text'

import '../../partials/w3m-legal-checkbox/index.js'
import '../../partials/w3m-legal-footer/index.js'
import styles from './styles.js'

@customElement('w3m-onramp-token-select-view')
export class W3mOnrampTokensView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() public selectedCurrency = OnRampController.state.purchaseCurrencies
  @state() public tokens = OnRampController.state.purchaseCurrencies
  @state() private tokenImages = AssetController.state.tokenImages
  @state() private checked = OptionsStateController.state.isLegalCheckboxChecked

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        OnRampController.subscribe(val => {
          this.selectedCurrency = val.purchaseCurrencies
          this.tokens = val.purchaseCurrencies
        }),
        AssetController.subscribeKey('tokenImages', val => (this.tokenImages = val)),
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
        .padding=${['0', 's', 's', 's']}
        gap="xs"
        class=${ifDefined(disabled ? 'disabled' : undefined)}
      >
        ${this.currenciesTemplate(disabled)}
      </wui-flex>
      <w3m-legal-footer></w3m-legal-footer>
    `
  }

  // -- Private ------------------------------------------- //
  private currenciesTemplate(disabled = false) {
    return this.tokens.map(
      token => html`
        <wui-list-item
          imageSrc=${ifDefined(this.tokenImages?.[token.symbol])}
          @click=${() => this.selectToken(token)}
          variant="image"
          tabIdx=${ifDefined(disabled ? -1 : undefined)}
        >
          <wui-flex gap="3xs" alignItems="center">
            <wui-text variant="paragraph-500" color="fg-100">${token.name}</wui-text>
            <wui-text variant="small-400" color="fg-200">${token.symbol}</wui-text>
          </wui-flex>
        </wui-list-item>
      `
    )
  }

  private selectToken(currency: PurchaseCurrency) {
    if (!currency) {
      return
    }

    OnRampController.setPurchaseCurrency(currency)
    ModalController.close()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-onramp-token-select-view': W3mOnrampTokensView
  }
}
