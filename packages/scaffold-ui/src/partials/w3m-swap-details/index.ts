import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'

import { NumberUtil } from '@reown/appkit-common'
import { ChainController, ConstantsUtil, SwapController } from '@reown/appkit-core'
import { UiHelperUtil, customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-text'

import '../w3m-tooltip-trigger/index.js'
import '../w3m-tooltip/index.js'
import styles from './styles.js'

// -- Constants ----------------------------------------- //
const slippageRate = ConstantsUtil.CONVERT_SLIPPAGE_TOLERANCE

@customElement('w3m-swap-details')
export class WuiSwapDetails extends LitElement {
  public static override styles = [styles]

  private unsubscribe: ((() => void) | undefined)[] = []

  // -- State & Properties -------------------------------- //
  @state() public networkName = ChainController.state.activeCaipNetwork?.name

  @property() public detailsOpen = false

  @state() public sourceToken = SwapController.state.sourceToken

  @state() public toToken = SwapController.state.toToken

  @state() public toTokenAmount = SwapController.state.toTokenAmount

  @state() public sourceTokenPriceInUSD = SwapController.state.sourceTokenPriceInUSD

  @state() public toTokenPriceInUSD = SwapController.state.toTokenPriceInUSD

  @state() public gasPriceInUSD = SwapController.state.gasPriceInUSD

  @state() public priceImpact = SwapController.state.priceImpact

  @state() public maxSlippage = SwapController.state.maxSlippage

  @state() public networkTokenSymbol = SwapController.state.networkTokenSymbol

  @state() public inputError = SwapController.state.inputError

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()

    this.unsubscribe.push(
      ...[
        SwapController.subscribe(newState => {
          this.sourceToken = newState.sourceToken
          this.toToken = newState.toToken
          this.toTokenAmount = newState.toTokenAmount
          this.gasPriceInUSD = newState.gasPriceInUSD
          this.priceImpact = newState.priceImpact
          this.maxSlippage = newState.maxSlippage
          this.sourceTokenPriceInUSD = newState.sourceTokenPriceInUSD
          this.toTokenPriceInUSD = newState.toTokenPriceInUSD
          this.inputError = newState.inputError
        })
      ]
    )
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const minReceivedAmount =
      this.toTokenAmount && this.maxSlippage
        ? NumberUtil.bigNumber(this.toTokenAmount).minus(this.maxSlippage).toString()
        : null

    if (!this.sourceToken || !this.toToken || this.inputError) {
      return null
    }

    const toTokenSwappedAmount =
      this.sourceTokenPriceInUSD && this.toTokenPriceInUSD
        ? (1 / this.toTokenPriceInUSD) * this.sourceTokenPriceInUSD
        : 0

    return html`
      <wui-flex flexDirection="column" alignItems="center" gap="1xs" class="details-container">
        <wui-flex flexDirection="column">
          <button @click=${this.toggleDetails.bind(this)}>
            <wui-flex justifyContent="space-between" .padding=${['0', 'xs', '0', 'xs']}>
              <wui-flex justifyContent="flex-start" flexGrow="1" gap="xs">
                <wui-text variant="small-400" color="fg-100">
                  1 ${this.sourceToken.symbol} =
                  ${UiHelperUtil.formatNumberToLocalString(toTokenSwappedAmount, 3)}
                  ${this.toToken.symbol}
                </wui-text>
                <wui-text variant="small-400" color="fg-200">
                  $${UiHelperUtil.formatNumberToLocalString(this.sourceTokenPriceInUSD)}
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
                      <wui-flex alignItems="center" gap="xs">
                        <wui-text class="details-row-title" variant="small-400" color="fg-150">
                          Network cost
                        </wui-text>
                        <w3m-tooltip-trigger
                          text=${`Network cost is paid in ${this.networkTokenSymbol} on the ${this.networkName} network in order to execute transaction.`}
                        >
                          <wui-icon size="xs" color="fg-250" name="infoCircle"></wui-icon>
                        </w3m-tooltip-trigger>
                      </wui-flex>
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
                  ${this.maxSlippage && this.sourceToken.symbol
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
                                    )} ${this.toToken.symbol} due to price changes.`
                                  : ''
                              }`}
                            >
                              <wui-icon size="xs" color="fg-250" name="infoCircle"></wui-icon>
                            </w3m-tooltip-trigger>
                          </wui-flex>
                          <wui-flex>
                            <wui-text variant="small-400" color="fg-200">
                              ${UiHelperUtil.formatNumberToLocalString(this.maxSlippage, 6)}
                              ${this.toToken.symbol} ${slippageRate}%
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
                          Provider fee
                        </wui-text>
                      </wui-flex>
                      <wui-flex>
                        <wui-text variant="small-400" color="fg-200">0.85%</wui-text>
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
