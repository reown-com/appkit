import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { AssetUtil, NetworkController, type OnRampProvider } from '@web3modal/core'
import '../../components/wui-icon/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { ColorType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('wui-onramp-provider-item')
export class WuiOnRampProviderItem extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

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
      <button ?disabled=${this.disabled} ontouchstart>
        <wui-visual name=${ifDefined(this.name)} class="provider-image"></wui-visual>
        <wui-flex flexDirection="column" gap="4xs">
          <wui-text variant="paragraph-500" color="fg-100">${this.label}</wui-text>
          <wui-flex alignItems="center" justifyContent="flex-start" gap="l">
            <wui-text variant="tiny-500" color="fg-100">
              <wui-text variant="tiny-400" color="fg-200">Fees</wui-text>
              ${this.feeRange}
            </wui-text>
            <wui-flex gap="xxs">
              <wui-icon name="bank" size="xs" color="fg-150"></wui-icon>
              <wui-icon name="card" size="xs" color="fg-150"></wui-icon>
            </wui-flex>
            ${this.networksTemplate()}
          </wui-flex>
        </wui-flex>
        ${this.loading
          ? html`<wui-loading-spinner color="fg-200" size="md"></wui-loading-spinner>`
          : html`<wui-icon name="chevronRight" color="fg-200" size="sm"></wui-icon>`}
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private networksTemplate() {
    const networks = NetworkController.getRequestedCaipNetworks()
    const slicedNetworks = networks?.filter(network => network?.imageId)?.slice(0, 5)

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
    'wui-onramp-provider-item': WuiOnRampProviderItem
  }
}
