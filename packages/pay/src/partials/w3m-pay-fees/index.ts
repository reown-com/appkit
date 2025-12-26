import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { NumberUtil } from '@reown/appkit-common'
import { AssetUtil, ChainController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-image'
import '@reown/appkit-ui/wui-text'
import { HelpersUtil } from '@reown/appkit-utils'

import { PayController } from '../../controllers/PayController.js'
import type { QuoteFee } from '../../types/quote.js'
import styles from './styles.js'

@customElement('w3m-pay-fees')
export class W3mPayFees extends LitElement {
  public static override styles = [styles]

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private quote = PayController.state.quote

  public constructor() {
    super()
    this.unsubscribe.push(PayController.subscribeKey('quote', val => (this.quote = val)))
  }

  // -- Lifecycle ----------------------------------------- //
  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const amount = NumberUtil.formatNumber(this.quote?.origin.amount || '0', {
      decimals: this.quote?.origin.currency.metadata.decimals ?? 0,
      round: 6
    }).toString()

    return html`
      <wui-flex flexDirection="column" gap="4">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Pay</wui-text>
          <wui-text variant="md-regular" color="primary">
            ${amount} ${this.quote?.origin.currency.metadata.symbol || 'Unknown'}
          </wui-text>
        </wui-flex>

        ${this.quote && this.quote.fees.length > 0
          ? this.quote.fees.map(fee => this.renderFee(fee))
          : null}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private renderFee(fee: QuoteFee) {
    const isNetworkFee = fee.id === 'network'

    const feeAmount = NumberUtil.formatNumber(fee.amount || '0', {
      decimals: fee.currency.metadata.decimals ?? 0,
      round: 6
    }).toString()

    if (isNetworkFee) {
      const allNetworks = ChainController.getAllRequestedCaipNetworks()
      const targetNetwork = allNetworks.find(net =>
        HelpersUtil.isLowerCaseMatch(net.caipNetworkId, fee.currency.network)
      )

      return html`
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">${fee.label}</wui-text>

          <wui-flex flexDirection="column" alignItems="flex-end" gap="2">
            <wui-text variant="md-regular" color="primary">
              ${feeAmount} ${fee.currency.metadata.symbol || 'Unknown'}
            </wui-text>

            <wui-flex alignItems="center" gap="01">
              <wui-image
                src=${ifDefined(AssetUtil.getNetworkImage(targetNetwork))}
                size="xs"
              ></wui-image>
              <wui-text variant="sm-regular" color="secondary">
                ${targetNetwork?.name || 'Unknown'}
              </wui-text>
            </wui-flex>
          </wui-flex>
        </wui-flex>
      `
    }

    return html`
      <wui-flex alignItems="center" justifyContent="space-between">
        <wui-text variant="md-regular" color="secondary">${fee.label}</wui-text>
        <wui-text variant="md-regular" color="primary">
          ${feeAmount} ${fee.currency.metadata.symbol || 'Unknown'}
        </wui-text>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-pay-fees': W3mPayFees
  }
}
