import {
  ConnectionController,
  CoreHelperUtil,
  RouterController,
  type Connector,
  OnRampController
} from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'

@customElement('w3m-onramp-token-select-view')
export class W3mOnrampTokensView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() public selectedCurrency = OnRampController.state.purchaseCurrencies
  @state() public currencies = OnRampController.state.purchaseCurrencies

  public constructor() {
    super()
    this.unsubscribe.push(
      OnRampController.subscribe(val => {
        this.selectedCurrency = val.purchaseCurrencies
        this.currencies = val.purchaseCurrencies
      })
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" padding="s" gap="xs">
        ${this.currenciesTemplate()}
      </wui-flex>
      <w3m-legal-footer></w3m-legal-footer>
    `
  }

  // -- Private ------------------------------------------- //
  private currenciesTemplate() {
    return this.currencies.map(currency => {
      if (!ConnectionController.checkInstalled()) {
        return null
      }

      return html`
        <wui-list-wallet imageSrc=${''} .installed=${true} name=${currency.name ?? 'Unknown'}>
        </wui-list-wallet>
      `
    })
  }

  // -- Private Methods ----------------------------------- //
  private onConnector(connector: Connector) {
    if (connector.type === 'WALLET_CONNECT') {
      if (CoreHelperUtil.isMobile()) {
        RouterController.push('AllWallets')
      } else {
        RouterController.push('ConnectingWalletConnect')
      }
    } else {
      RouterController.push('ConnectingExternal', { connector })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-onramp-token-select-view': W3mOnrampTokensView
  }
}
