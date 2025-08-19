import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { AssetUtil, ChainController, type OnRampProvider } from '@reown/appkit-controllers'
import { type ColorType, customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-image'
import '@reown/appkit-ui/wui-loading-spinner'
import '@reown/appkit-ui/wui-text'
import '@reown/appkit-ui/wui-visual'

import styles from './styles.js'

@customElement('w3m-onramp-provider-item')
export class W3mOnRampProviderItem extends LitElement {
  public static override styles = [styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public disabled = false

  @property() color: ColorType = 'inherit'

  @property() public name?: OnRampProvider['name']

  @property() public label = ''

  @property() public feeRange = ''

  @property({ type: Boolean }) public loading = false

  @property() public onClick: (() => void) | null = null

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ?disabled=${this.disabled} @click=${this.onClick} ontouchstart>
        <wui-visual name=${ifDefined(this.name)} class="provider-image"></wui-visual>
        <wui-flex flexDirection="column" gap="01">
          <wui-text variant="md-regular" color="primary">${this.label}</wui-text>
          <wui-flex alignItems="center" justifyContent="flex-start" gap="4">
            <wui-text variant="sm-medium" color="primary">
              <wui-text variant="sm-regular" color="secondary">Fees</wui-text>
              ${this.feeRange}
            </wui-text>
            <wui-flex gap="2">
              <wui-icon name="bank" size="sm" color="default"></wui-icon>
              <wui-icon name="card" size="sm" color="default"></wui-icon>
            </wui-flex>
            ${this.networksTemplate()}
          </wui-flex>
        </wui-flex>
        ${this.loading
          ? html`<wui-loading-spinner color="secondary" size="md"></wui-loading-spinner>`
          : html`<wui-icon name="chevronRight" color="default" size="sm"></wui-icon>`}
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private networksTemplate() {
    const requestedCaipNetworks = ChainController.getAllRequestedCaipNetworks()
    const slicedNetworks = requestedCaipNetworks
      ?.filter(network => network?.assets?.imageId)
      ?.slice(0, 5)

    return html`
      <wui-flex class="networks">
        ${slicedNetworks?.map(
          network => html`
            <wui-flex class="network-icon">
              <wui-image src=${ifDefined(AssetUtil.getNetworkImage(network))}></wui-image>
            </wui-flex>
          `
        )}
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-onramp-provider-item': W3mOnRampProviderItem
  }
}
