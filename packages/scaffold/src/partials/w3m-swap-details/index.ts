import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import styles from './styles.js'
import { UiHelperUtil, customElement } from '@web3modal/ui'
import { NumberUtil } from '@web3modal/common'

@customElement('w3m-swap-details')
export class WuiSwapDetails extends LitElement {
  public static override styles = [styles]

  // -- State & Properties -------------------------------- //
  @property() public detailsOpen = false

  @property() public sourceTokenSymbol?: string

  @property() public sourceTokenPrice?: number

  @property() public toTokenSymbol?: string

  @property() public toTokenAmount?: string

  @property() public toTokenSwappedAmount?: number

  @property() public gasPriceInUSD?: number

  @property() public priceImpact?: number

  @property() public slippageRate = 1

  @property() public maxSlippage?: number

  @property() public providerFee?: string

  // -- Render -------------------------------------------- //
  public override render() {
    const minReceivedAmount =
      this.toTokenAmount && this.maxSlippage
        ? NumberUtil.bigNumber(this.toTokenAmount).minus(this.maxSlippage).toString()
        : null

    return html`
      <wui-flex flexDirection="column" alignItems="center" gap="1xs" class="details-container">
        <wui-flex flexDirection="column">
          <button @click=${this.toggleDetails.bind(this)}>
            <wui-flex justifyContent="space-between" .padding=${['0', 'xs', '0', 'xs']}>
              <wui-flex justifyContent="flex-start" flexGrow="1" gap="xs">
                <wui-text variant="small-400" color="fg-100"
                  >1 ${this.sourceTokenSymbol} =
                  ${UiHelperUtil.formatNumberToLocalString(this.toTokenSwappedAmount, 3)}
                  ${this.toTokenSymbol}</wui-text
                >
                <wui-text variant="small-400" color="fg-200">
                  $${UiHelperUtil.formatNumberToLocalString(this.sourceTokenPrice)}
                </wui-text>
              </wui-flex>
              <wui-icon name="chevronBottom"></wui-icon>
            </wui-flex>
          </button>
          ${this.detailsOpen
            ? html`
                <wui-flex flexDirection="column" gap="xs" class="details-content-container">
                  <wui-flex flexDirection="column" gap="xs">
                    <wui-flex
                      justifyContent="space-between"
                      alignItems="center"
                      class="details-row"
                    >
                      <wui-text variant="small-400" color="fg-150">Network cost</wui-text>
                      <wui-text variant="small-400" color="fg-100">
                        $${UiHelperUtil.formatNumberToLocalString(this.gasPriceInUSD, 3)}
                      </wui-text>
                    </wui-flex>
                  </wui-flex>
                  ${this.priceImpact
                    ? html` <wui-flex flexDirection="column" gap="xs">
                        <wui-flex
                          justifyContent="space-between"
                          alignItems="center"
                          class="details-row"
                        >
                          <wui-flex alignItems="center" gap="xs">
                            <wui-text class="details-row-title" variant="small-400" color="fg-150">
                              Price impact
                            </wui-text>
                            <w3m-tooltip-trigger
                              text="Price impact reflects the change in market price due to your trade"
                            >
                              <wui-icon size="xs" color="fg-250" name="infoCircle"></wui-icon>
                            </w3m-tooltip-trigger>
                          </wui-flex>
                          <wui-flex>
                            <wui-text variant="small-400" color="fg-200">
                              ${UiHelperUtil.formatNumberToLocalString(this.priceImpact, 3)}%
                            </wui-text>
                          </wui-flex>
                        </wui-flex>
                      </wui-flex>`
                    : null}
                  ${this.maxSlippage && this.sourceTokenSymbol
                    ? html`<wui-flex flexDirection="column" gap="xs">
                        <wui-flex
                          justifyContent="space-between"
                          alignItems="center"
                          class="details-row"
                        >
                          <wui-flex alignItems="center" gap="xs">
                            <wui-text class="details-row-title" variant="small-400" color="fg-150">
                              Max. slippage
                            </wui-text>
                            <w3m-tooltip-trigger
                              text=${`Max slippage sets the minimum amount you must receive for the transaction to proceed. ${
                                minReceivedAmount
                                  ? `Transaction will be reversed if you receive less than ${UiHelperUtil.formatNumberToLocalString(
                                      minReceivedAmount,
                                      6
                                    )} ${this.toTokenSymbol} due to price changes.`
                                  : ''
                              }`}
                            >
                              <wui-icon size="xs" color="fg-250" name="infoCircle"></wui-icon>
                            </w3m-tooltip-trigger>
                          </wui-flex>
                          <wui-flex>
                            <wui-text variant="small-400" color="fg-200">
                              ${UiHelperUtil.formatNumberToLocalString(this.maxSlippage, 6)}
                              ${this.toTokenSymbol} ${this.slippageRate}%
                            </wui-text>
                          </wui-flex>
                        </wui-flex>
                      </wui-flex>`
                    : null}
                  <wui-flex flexDirection="column" gap="xs">
                    <wui-flex
                      justifyContent="space-between"
                      alignItems="center"
                      class="details-row provider-free-row"
                    >
                      <wui-flex alignItems="center" gap="xs">
                        <wui-text class="details-row-title" variant="small-400" color="fg-150">
                          Provider fee (0.75%)
                        </wui-text>
                      </wui-flex>
                      <wui-flex>
                        ${this.providerFee
                          ? html`
                              <wui-text variant="small-400" color="fg-200">
                                ${UiHelperUtil.formatNumberToLocalString(this.providerFee, 6)}
                                ${this.sourceTokenSymbol}
                              </wui-text>
                            `
                          : null}
                      </wui-flex>
                    </wui-flex>
                  </wui-flex>
                </wui-flex>
              `
            : null}
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private toggleDetails() {
    this.detailsOpen = !this.detailsOpen
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-w3m-details': WuiSwapDetails
  }
}
