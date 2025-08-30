import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import {
  CoreHelperUtil,
  ExchangeController,
  type PaymentAsset,
  RouterController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-icon-box'
import '@reown/appkit-ui/wui-input-text'
import '@reown/appkit-ui/wui-link'
import '@reown/appkit-ui/wui-list-token'
import '@reown/appkit-ui/wui-separator'
import '@reown/appkit-ui/wui-text'

import styles from './styles.js'

@customElement('w3m-deposit-from-exchange-select-asset-view')
export class W3mDepositFromExchangeSelectAssetView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private assets: PaymentAsset[] = ExchangeController.state.assets

  @state() private search = ''

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        ExchangeController.subscribe(val => {
          this.assets = val.assets
        })
      ]
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column">
        ${this.templateSearchInput()} <wui-separator></wui-separator> ${this.templateTokens()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private templateSearchInput() {
    return html`
      <wui-flex gap="2" padding="3">
        <wui-input-text
          @inputChange=${this.onInputChange.bind(this)}
          class="network-search-input"
          size="sm"
          placeholder="Search token"
          icon="search"
        ></wui-input-text>
      </wui-flex>
    `
  }

  private templateTokens() {
    const filteredAssets = this.assets.filter(asset =>
      asset.metadata.name.toLowerCase().includes(this.search.toLowerCase())
    )
    const hasAssets = filteredAssets.length > 0

    return html`
      <wui-flex
        class="contentContainer"
        flexDirection="column"
        .padding=${['0', '3', '0', '3'] as const}
      >
        <wui-flex justifyContent="flex-start" .padding=${['4', '3', '3', '3'] as const}>
          <wui-text variant="md-medium" color="secondary">Available tokens</wui-text>
        </wui-flex>
        <wui-flex flexDirection="column" gap="2">
          ${hasAssets
            ? filteredAssets.map(
                asset =>
                  html`<wui-list-item
                    .imageSrc=${asset.metadata.iconUrl}
                    ?clickable=${true}
                    @click=${this.handleTokenClick.bind(this, asset)}
                  >
                    <wui-text variant="md-medium" color="primary">${asset.metadata.name}</wui-text>
                    <wui-text variant="md-regular" color="secondary"
                      >${asset.metadata.symbol}</wui-text
                    >
                  </wui-list-item>`
              )
            : html`<wui-flex
                .padding=${['20', '0', '0', '0'] as const}
                alignItems="center"
                flexDirection="column"
                gap="4"
              >
                <wui-icon-box icon="coinPlaceholder" color="default" size="lg"></wui-icon-box>
                <wui-flex
                  class="textContent"
                  gap="2"
                  flexDirection="column"
                  justifyContent="center"
                >
                  <wui-text variant="lg-medium" align="center" color="primary">
                    No tokens found
                  </wui-text>
                </wui-flex>
                <wui-link @click=${this.onBuyClick.bind(this)}>Buy</wui-link>
              </wui-flex>`}
        </wui-flex>
      </wui-flex>
    `
  }

  private onBuyClick() {
    RouterController.push('OnRampProviders')
  }
  private onInputChange(event: CustomEvent<string>) {
    this.onDebouncedSearch(event.detail)
  }

  private onDebouncedSearch = CoreHelperUtil.debounce((value: string) => {
    this.search = value
  })

  private handleTokenClick(asset: PaymentAsset) {
    ExchangeController.setPaymentAsset(asset)
    RouterController.goBack()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-deposit-from-exchange-select-asset-view': W3mDepositFromExchangeSelectAssetView
  }
}
