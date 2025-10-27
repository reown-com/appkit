import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import {
  type OnRampCryptoCurrency,
  type OnRampFiatCurrency,
  RouterController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-text'
import '@reown/appkit-ui/wui-token-button'

import styles from './styles.js'

@customElement('w3m-onramp-input')
export class W3mOnrampInput extends LitElement {
  public static override styles = [styles]

  // -- State & Properties -------------------------------- //
  @property() public type: 'fiat' | 'crypto' = 'crypto'

  @property() public readOnly?: boolean

  @property() public focused = false

  @property() public balance: string | undefined

  @property() public value?: string

  @property() public price = 0

  @property() public disabled?: boolean

  @property() public currency?: OnRampFiatCurrency | OnRampCryptoCurrency

  @property() public placeholderButtonLabel = 'Select token'

  @property() public target: 'sourceToken' | 'targetToken' = 'sourceToken'

  @property() public onSetAmount: ((value: string) => void) | null = null

  // -- Render -------------------------------------------- //
  public override render() {
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
            placeholder="0"
            type="text"
            inputmode="decimal"
            pattern="[0-9,.]*"
            ?readonly=${this.readOnly}
          />
        </wui-flex>
        ${this.templateTokenSelectButton()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //

  private dispatchInputChangeEvent(event: InputEvent) {
    if (!this.onSetAmount) {
      return
    }

    const value = (event.target as HTMLInputElement).value.replace(/[^0-9.]/gu, '')

    if (value === ',' || value === '.') {
      this.onSetAmount('0.')
    } else if (value.endsWith(',')) {
      this.onSetAmount(value.replace(',', '.'))
    } else {
      this.onSetAmount(value)
    }
  }

  private templateTokenSelectButton() {
    if (!this.currency) {
      return html` <wui-button
        data-testid="swap-select-token-button-${this.target}"
        class="swap-token-button"
        size="md"
        variant="neutral-secondary"
        @click=${this.onSelectToken.bind(this)}
      >
        ${this.placeholderButtonLabel}
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
          data-testid="onramp-input-currency-${this.target}"
          text=${this.currency.symbol}
          imageSrc=${this.getImageSrc()}
          @click=${this.onSelectToken.bind(this)}
        >
        </wui-token-button>
      </wui-flex>
    `
  }

  private onFocusChange(state: boolean) {
    this.focused = state
  }

  private onSelectToken() {
    if (this.type === 'fiat') {
      RouterController.push('BuySelectToken', {
        onRampSelectType: 'fiat'
      })
    } else {
      RouterController.push('BuySelectToken', {
        onRampSelectType: 'crypto'
      })
    }
  }

  private getImageSrc() {
    if (!this.currency) {
      return null
    }

    if ('icon' in this.currency) {
      const base64 = btoa(unescape(encodeURIComponent(this.currency.icon)))
      const src = 'data:image/svg+xml;base64,' + base64

      return src
    }

    return this.currency.image.small ?? null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-onramp-input': W3mOnrampInput
  }
}
