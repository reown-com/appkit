import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { InputUtil } from '@reown/appkit-common'
import {
  AssetUtil,
  RouterController,
  type SwapInputTarget,
  type TransfersToken
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-text'
import '@reown/appkit-ui/wui-token-button'

import styles from './styles.js'

@customElement('w3m-transfers-input')
export class W3mTransfersInput extends LitElement {
  public static override styles = [styles]

  // -- State & Properties -------------------------------- //
  @property() public focused = false

  @property() public value?: string

  @property() public disabled?: boolean

  @property() public target: SwapInputTarget = 'sourceToken'

  @property() public token?: TransfersToken

  @property() public onSetAmount: ((target: SwapInputTarget, value: string) => void) | null = null

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
            @keydown=${this.handleKeydown}
            placeholder="0"
            type="text"
            inputmode="decimal"
            pattern="[0-9,.]*"
          />
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

  private templateTokenSelectButton() {
    if (!this.token) {
      return html` <wui-button
        data-testid="transfers-select-token-button-${this.target}"
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
          data-testid="transfers-input-token-${this.target}"
          text=${this.token.symbol}
          imageSrc=${this.token.logoUri}
          chainImageSrc=${ifDefined(
            AssetUtil.getNetworkImageByCaipNetworkId(this.token.caipNetworkId)
          )}
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
    if (this.target === 'sourceToken') {
      RouterController.push('TransfersSelectToken', {
        target: this.target
      })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-transfers-input': W3mTransfersInput
  }
}
