import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import { InputUtil, NumberUtil } from '@reown/appkit-common'
import {
  EventsController,
  RouterController,
  type SwapInputTarget,
  type SwapToken
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-text'
import '@reown/appkit-ui/wui-token-button'

import styles from './styles.js'

const MINIMUM_USD_VALUE_TO_CONVERT = 0.00005

@customElement('w3m-swap-input')
export class W3mSwapInput extends LitElement {
  public static override styles = [styles]

  // -- State & Properties -------------------------------- //
  @property() public focused = false

  @property() public balance: string | undefined

  @property() public value?: string

  @property() public price = 0

  @property() public marketValue?: string

  @property() public disabled?: boolean

  @property() public target: SwapInputTarget = 'sourceToken'

  @property() public token?: SwapToken

  @property() public onSetAmount: ((target: SwapInputTarget, value: string) => void) | null = null

  @property() public onSetMaxValue:
    | ((target: SwapInputTarget, balance: string | undefined) => void)
    | null = null

  // -- Render -------------------------------------------- //
  public override render() {
    const marketValue = this.marketValue || '0'
    const isMarketValueGreaterThanZero = NumberUtil.bigNumber(marketValue).gt('0')

    return html`
      <wui-flex
        class="${this.focused ? 'focus' : ''}"
        justifyContent="space-between"
        alignItems="center"
      >
        <wui-flex
          flex="1"
          flexDirection="column"
          alignItems="flex-start"
          justifyContent="center"
          class="swap-input"
        >
          <input
            data-testid="swap-input-${this.target}"
            @focusin=${() => this.onFocusChange(true)}
            @focusout=${() => this.onFocusChange(false)}
            ?disabled=${this.disabled}
            value=${this.value || ''}
            @input=${this.dispatchInputChangeEvent}
            @keydown=${this.handleKeydown}
            placeholder="0"
            type="text"
            inputmode="decimal"
            pattern="[0-9,.]*"
          />
          <wui-text class="market-value" variant="sm-regular" color="secondary">
            ${isMarketValueGreaterThanZero
              ? `$${NumberUtil.formatNumberToLocalString(this.marketValue, 2)}`
              : null}
          </wui-text>
        </wui-flex>
        ${this.templateTokenSelectButton()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private handleKeydown(event: KeyboardEvent) {
    return InputUtil.numericInputKeyDown(event, this.value, (value: string) =>
      this.onSetAmount?.(this.target, value)
    )
  }

  private dispatchInputChangeEvent(event: InputEvent) {
    if (!this.onSetAmount) {
      return
    }

    const value = (event.target as HTMLInputElement).value.replace(/[^0-9.]/gu, '')

    if (value === ',' || value === '.') {
      this.onSetAmount(this.target, '0.')
    } else if (value.endsWith(',')) {
      this.onSetAmount(this.target, value.replace(',', '.'))
    } else {
      this.onSetAmount(this.target, value)
    }
  }

  private setMaxValueToInput() {
    this.onSetMaxValue?.(this.target, this.balance)
  }

  private templateTokenSelectButton() {
    if (!this.token) {
      return html` <wui-button
        data-testid="swap-select-token-button-${this.target}"
        class="swap-token-button"
        size="md"
        variant="neutral-secondary"
        @click=${this.onSelectToken.bind(this)}
      >
        Select token
      </wui-button>`
    }

    return html`
      <wui-flex
        class="swap-token-button"
        flexDirection="column"
        alignItems="flex-end"
        justifyContent="center"
        gap="1"
      >
        <wui-token-button
          data-testid="swap-input-token-${this.target}"
          text=${this.token.symbol}
          imageSrc=${this.token.logoUri}
          @click=${this.onSelectToken.bind(this)}
        >
        </wui-token-button>
        <wui-flex alignItems="center" gap="1"> ${this.tokenBalanceTemplate()} </wui-flex>
      </wui-flex>
    `
  }

  private tokenBalanceTemplate() {
    const balanceValueInUSD = NumberUtil.multiply(this.balance, this.price)
    const haveBalance = balanceValueInUSD
      ? balanceValueInUSD?.gt(MINIMUM_USD_VALUE_TO_CONVERT)
      : false

    return html`
      ${haveBalance
        ? html`<wui-text variant="sm-regular" color="secondary">
            ${NumberUtil.formatNumberToLocalString(this.balance, 2)}
          </wui-text>`
        : null}
      ${this.target === 'sourceToken' ? this.tokenActionButtonTemplate(haveBalance) : null}
    `
  }

  private tokenActionButtonTemplate(haveBalance: boolean) {
    if (haveBalance) {
      return html` <button class="max-value-button" @click=${this.setMaxValueToInput.bind(this)}>
        <wui-text color="accent-primary" variant="sm-medium">Max</wui-text>
      </button>`
    }

    return html` <button class="max-value-button" @click=${this.onBuyToken.bind(this)}>
      <wui-text color="accent-primary" variant="sm-medium">Buy</wui-text>
    </button>`
  }

  private onFocusChange(state: boolean) {
    this.focused = state
  }

  private onSelectToken() {
    EventsController.sendEvent({ type: 'track', event: 'CLICK_SELECT_TOKEN_TO_SWAP' })
    RouterController.push('SwapSelectToken', {
      target: this.target
    })
  }

  private onBuyToken() {
    RouterController.push('OnRampProviders')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-swap-input': W3mSwapInput
  }
}
